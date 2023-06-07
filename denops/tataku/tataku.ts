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
): Promise<Result<undefined, Error>> {
  return prepareStreams(denops, recipe)
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
  recipe: unknown,
): Promise<Result<Streams, Error>> {
  if (!validate(recipe)) {
    return Err(
      new Error(
        `The recipe is invalid format: ${JSON.stringify(recipe)}`,
      ),
    );
  }
  const loadCollectorResult = await loadCollector(
    denops,
    recipe.collector.name,
  );
  if (loadCollectorResult.isErr()) {
    return Err(loadCollectorResult.unwrapErr());
  }
  const collector = loadCollectorResult.unwrap()(
    denops,
    recipe.collector.options ?? {},
  );

  const processors = [];
  for (const processorRecipe of recipe.processor) {
    const loadProcessorResult = await loadProcessor(
      denops,
      processorRecipe.name,
    );
    if (loadProcessorResult.isErr()) {
      return Err(loadCollectorResult.unwrapErr());
    }
    processors.push(
      loadProcessorResult.unwrap()(denops, processorRecipe.options ?? {}),
    );
  }

  const loadEmitterResult = await loadEmitter(denops, recipe.emitter.name);
  if (loadEmitterResult.isErr()) {
    return Err(loadEmitterResult.unwrapErr());
  }
  const emitter = loadEmitterResult.unwrap()(
    denops,
    recipe.emitter.options ?? {},
  );

  return Ok({
    collector,
    processors,
    emitter,
  });
}
