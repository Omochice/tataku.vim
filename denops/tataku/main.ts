import type { Denops } from "jsr:@denops/std@7.4.0";
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
