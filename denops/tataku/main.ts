import { Denops, ensureObject } from "./deps.ts";
import {
  TatakuInputterMethod,
  TatakuOutputterMethod,
  TatakuProcessorMethod,
} from "./types.ts";
import { echoError, isRecipe } from "./utils.ts";
import { loadTatakuModule } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(recipe: unknown): Promise<void> {
      const ensuredRecipe = ensureObject(recipe);

      if (!isRecipe(ensuredRecipe)) {
        echoError(denops, `The recipe is invalid format ${ensuredRecipe}`);
        return;
      }

      let results: string[] = [];

      {
        const [inputter, err] = await loadTatakuModule(denops, {
          type: "inputter",
          name: ensuredRecipe.inputter.name,
        });

        if (err !== null) {
          echoError(denops, err.message);
          return;
        }

        results = await (inputter.run as TatakuInputterMethod)(
          denops,
          ensuredRecipe.inputter.options,
        );
      }

      for (const recipe of ensuredRecipe.processor) {
        const [processor, err] = await loadTatakuModule(denops, {
          type: "processor",
          name: recipe.name,
        });
        if (err !== null) {
          echoError(denops, err.message);
          return;
        }
        results = await (processor.run as TatakuProcessorMethod)(
          denops,
          recipe.options,
          results,
        );
      }

      // output
      {
        const [outputter, err] = await loadTatakuModule(denops, {
          type: "outputter",
          name: ensuredRecipe.outputter.name,
        });
        if (err !== null) {
          echoError(denops, err.message);
          return;
        }
        await (outputter.run as TatakuOutputterMethod)(
          denops,
          ensuredRecipe.outputter.options,
          results,
        );
      }
    },
  };
  await Promise.resolve();
}
