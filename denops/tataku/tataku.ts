import type { Denops } from "jsr:@denops/std@8.1.1";
import { err, ok, okAsync, Result, ResultAsync } from "npm:neverthrow@8.2.0";
import type { Collector, Emitter, Processor, Recipe } from "./types.ts";
import { validate } from "./validate.ts";
import { loadCollector, loadEmitter, loadProcessor } from "./load.ts";
import { convertError } from "./utils.ts";

type Streams = {
  collector: Collector;
  processor: CombinedProcessorStream;
  emitter: Emitter;
};

class CombinedProcessorStream extends TransformStream<string[]> {
  override readable: ReadableStream<string[]>;
  override writable: WritableStream<string[]>;
  constructor(streams: Processor[]) {
    super();
    if (streams.length === 0) {
      throw new Error("Combine target is must be exists", { cause: streams });
    }
    this.writable = streams[0].writable;
    this.readable = streams.at(-1)!.readable;

    for (let i = 0; i < streams.length - 1; i++) {
      streams[i].readable.pipeTo(streams[i + 1].writable);
    }
  }
}

export function prepareStreams(
  denops: Denops,
  originalRecipe: unknown,
  replacement?: unknown,
): ResultAsync<Streams, Error> {
  return checkRecipe(originalRecipe, replacement)
    .asyncAndThen((recipe) =>
      ResultAsync.combine([
        loadCollector(denops, recipe.collector.name)
          .andThen((factory) =>
            ResultAsync.fromPromise(
              Promise.resolve(factory(denops, recipe.collector.options ?? {})),
              convertError("Failed to load collector"),
            )
          ),
        ResultAsync.combine(
          recipe.processor.map((page) =>
            loadProcessor(denops, page.name)
              .andThen((factory) =>
                ResultAsync.fromPromise(
                  Promise.resolve(factory(denops, page.options ?? {})),
                  convertError("Failed to load processor"),
                )
              )
          ),
        )
          .andThen((streams) => okAsync(new CombinedProcessorStream(streams))),
        loadEmitter(denops, recipe.emitter.name)
          .andThen((factory) =>
            ResultAsync.fromPromise(
              Promise.resolve(factory(denops, recipe.emitter.options ?? {})),
              convertError("Failed to load emitter"),
            )
          ),
      ])
    )
    .andThen((r) =>
      okAsync({
        collector: r[0],
        processor: r[1],
        emitter: r[2],
      })
    );
}

function checkRecipe(
  recipe: unknown,
  replacement?: unknown,
): Result<Recipe, Error> {
  if (!validate(recipe)) {
    return err(
      new Error(
        `The recipe is invalid format: ${JSON.stringify(recipe)}`,
      ),
    );
  }
  if (replacement === undefined) {
    return ok(recipe);
  }
  if (replacement === null) {
    return err(new Error(":Internal error: replacing collector is failed"));
  }

  const replacedRecipe = {
    ...recipe,
    ...{
      collector: {
        name: "operator",
        options: {
          selected: replacement,
        },
      },
    },
  };

  if (!validate(replacedRecipe)) {
    return err(
      new Error(
        `The recipe is invalid format: ${JSON.stringify(replacedRecipe)}`,
      ),
    );
  }

  return ok(replacedRecipe);
}
