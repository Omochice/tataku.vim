import { Denops, ensureObject } from "./deps.ts";
import {
  Collector,
  Emitter,
  Processor,
} from "./types.ts";
import { echoError, isRecipe } from "./utils.ts";
import { loadTatakuModule } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(recipe: unknown): Promise<void> {
      const ensuredRecipe = ensureObject(recipe);

      if (!isRecipe(ensuredRecipe)) {
        echoError(denops, `The recipe is invalid format: ${ensuredRecipe}`);
        return;
      }

      let results: string[] = [];

      // absorber
      {
        const [collector, err] = await loadTatakuModule(denops, {
          kind: "collector",
          name: ensuredRecipe.collector.name,
        });

        if (err !== null) {
          echoError(denops, err.message);
          return;
        }

        results = await (collector.run as Collector)(
          denops,
          ensuredRecipe.collector.options,
        );
      }

      for (const recipe of ensuredRecipe.processor) {
        const [processor, err] = await loadTatakuModule(denops, {
          kind: "processor",
          name: recipe.name,
        });
        if (err !== null) {
          echoError(denops, err.message);
          return;
        }
        results = await (processor.run as Processor)(
          denops,
          recipe.options,
          results,
        );
      }

      // emitter
      {
        const [emitter, err] = await loadTatakuModule(denops, {
          kind: "emitter",
          name: ensuredRecipe.emitter.name,
        });
        if (err !== null) {
          echoError(denops, err.message);
          return;
        }
        await (emitter.run as Emitter)(
          denops,
          ensuredRecipe.emitter.options,
          results,
        );
      }
    },
  };
  await Promise.resolve();
}
