import { Denops } from "./deps.ts";
import { echoError } from "./utils.ts";
import { execute } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(recipe: unknown): Promise<void> {
      const result = await execute(denops, recipe);
      if (result.isErr()) {
        echoError(denops, result.unwrapErr().message);
      }
    },
    async runWithoutCollector(
      recipe: unknown,
      selected: unknown,
    ): Promise<void> {
      const replacePage = {
        collector: {
          name: "operator",
          options: {
            selected,
          },
        },
      };
      const result = await execute(denops, recipe, replacePage);
      if (result.isErr()) {
        echoError(denops, result.unwrapErr().message);
      }
    },
  };
  await Promise.resolve();
}
