import { Denops, Err, Ok, Result } from "./deps.ts";
import { validate } from "./types.ts";
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
