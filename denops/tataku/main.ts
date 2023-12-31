import { Denops } from "./deps.ts";
import { echoError } from "./utils.ts";
import { prepareStreams } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(
      recipe: unknown,
      selected?: unknown,
    ): Promise<void> {
      await prepareStreams(denops, recipe, selected)
        .match(
          ({ collector, processor, emitter }) => {
            collector
              .pipeThrough(processor)
              .pipeTo(emitter);
          },
          (err) => {
            echoError(denops, err.message);
          },
        );
    },
  };
  await Promise.resolve();
}
