import { Denops } from "./deps.ts";
import { echoError } from "./utils.ts";
import { execute } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(
      recipe: unknown,
      selected?: unknown,
    ): Promise<void> {
      await execute(denops, recipe, selected)
        .match(
          () => {},
          (err) => {
            echoError(denops, err.message);
          },
        );
    },
  };
  await Promise.resolve();
}
