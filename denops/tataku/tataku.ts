import { Denops, err, ok, okAsync, Result, ResultAsync } from "./deps.ts";
import { Recipe, validate } from "./types.ts";
import { Collector, Emitter, Processor } from "./types.ts";
import { loadCollector, loadEmitter, loadProcessor } from "./load.ts";

type Streams = {
  collector: Collector;
  processor: CombinedProcessorStream;
  emitter: Emitter;
};

class CombinedProcessorStream extends TransformStream<string[]> {
  readable: ReadableStream<string[]>;
  writable: WritableStream<string[]>;
  constructor(streams: Processor[]) {
    super();
    this.writable = streams[0].writable;
    this.readable = streams.at(-1)!.readable;

    for (let i = 0; i < streams.length - 1; i++) {
      streams[i].readable.pipeTo(streams[i + 1].writable);
    }
  }
}

export function execute(
  denops: Denops,
  recipe: unknown,
  replacement?: unknown,
): ResultAsync<void, Error> {
  return prepareStreams(denops, recipe, replacement)
    .andThen((streams) => {
      streams.collector
        .pipeThrough(streams.processor)
        .pipeTo(streams.emitter);
      return okAsync(undefined);
    });
}

function prepareStreams(
  denops: Denops,
  originalRecipe: unknown,
  replacement?: unknown,
): ResultAsync<Streams, Error> {
  return checkRecipe(originalRecipe, replacement)
    .asyncAndThen((recipe) =>
      ResultAsync.combine([
        loadCollector(denops, recipe.collector.name)
          .andThen((factory) =>
            okAsync(factory(denops, recipe.collector.options ?? {}))
          ),
        ResultAsync.combine(
          recipe.processor.map((page) =>
            loadProcessor(denops, page.name)
              .andThen((factory) =>
                okAsync(factory(denops, page.options ?? {}))
              )
          ),
        ).andThen((streams) => okAsync(new CombinedProcessorStream(streams))),
        loadEmitter(denops, recipe.emitter.name)
          .andThen((factory) =>
            okAsync(factory(denops, recipe.emitter.options ?? {}))
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
