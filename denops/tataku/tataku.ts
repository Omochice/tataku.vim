import { Denops, Err, Ok, Result } from "./deps.ts";
import { Recipe, validate } from "./types.ts";
import { Collector, Emitter, Processor } from "./types.ts";
import { loadCollector, loadEmitter, loadProcessor } from "./load.ts";

type Streams = {
  collector: Collector;
  processors: Processor[];
  emitter: Emitter;
};

export function execute(
  denops: Denops,
  recipe: unknown,
  replacement?: unknown,
): Promise<Result<undefined, Error>> {
  return prepareStreams(denops, recipe, replacement)
    .then((r) =>
      r.andThen((streams: Streams) => {
        streams.processors
          .reduce(
            (acc: Collector, p: Processor) => acc.pipeThrough(p),
            streams.collector,
          )
          .pipeTo(streams.emitter);
        return Ok(undefined);
      })
    );
}

async function prepareStreams(
  denops: Denops,
  originalRecipe: unknown,
  replacement?: unknown,
): Promise<Result<Streams, Error>> {
  const checked = checkRecipe(originalRecipe, replacement);
  if (checked.isErr()) {
    return Err(checked.unwrapErr());
  }
  const recipe = checked.unwrap();

  const results = await Promise.all([
    loadCollector(denops, recipe.collector.name)
      .then((r) => {
        return r.andThen((factory) =>
          Ok(factory(denops, recipe.collector.options ?? {}))
        );
      }),
    Promise.all(recipe.processor.map((processorPage) => {
      return loadProcessor(denops, processorPage.name).then((r) =>
        r.andThen((factory) => Ok(factory(denops, processorPage.options ?? {})))
      );
    })),
    loadEmitter(denops, recipe.emitter.name)
      .then((r) => {
        return r.andThen((factory) =>
          Ok(factory(denops, recipe.emitter.options ?? {}))
        );
      }),
  ]);
  const firstFailed = results.flat().find((r) => r.isErr());
  if (firstFailed !== undefined) {
    return Err(firstFailed.unwrapErr());
  }
  return Ok({
    collector: results[0].unwrap(),
    processors: results[1].map((e) => e.unwrap()),
    emitter: results[2].unwrap(),
  });
}

function checkRecipe(
  recipe: unknown,
  replacement?: unknown,
): Result<Recipe, Error> {
  if (!validate(recipe)) {
    return Err(
      new Error(
        `The recipe is invalid format: ${JSON.stringify(recipe)}`,
      ),
    );
  }
  if (replacement === undefined) {
    return Ok(recipe);
  }
  if (replacement === null) {
    return Err(new Error(":Internal error: replacing collector is failed"));
  }

  return Ok({
    ...recipe,
    ...replacement,
  });
}
