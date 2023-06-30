import { Denops } from "./deps.ts";
import { echoError } from "./utils.ts";
import { execute } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(
      recipe: unknown,
      selected?: unknown,
    ): Promise<void> {
      const result = await execute(denops, recipe, selected);
      if (result.isErr()) {
        echoError(denops, result.unwrapErr().message);
      }
    },
  };
  await Promise.resolve();
}
