import { Denops, isArray, isString } from "./deps.ts";
import { echoError, handleError, isRecipe } from "./utils.ts";
import { collect, emit, process } from "./tataku.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(recipe: unknown): Promise<void> {
      if (!isRecipe(recipe)) {
        echoError(denops, `The recipe is invalid format: ${recipe}`);
        return;
      }

      const { collector, processor, emitter } = recipe;
      let pipe: string[] = [];

      try {
        pipe = await collect(denops, collector.name, collector.options ?? {});
      } catch (err) {
        await handleError(denops, "collector", collector.name, err);
        return;
      }

      for (const recipe of processor) {
        try {
          pipe = await process(denops, recipe.name, recipe.options ?? {}, pipe);
        } catch (err) {
          await handleError(denops, "processor", recipe.name, err);
          return;
        }
      }

      try {
        await emit(denops, emitter.name, emitter.options ?? {}, pipe);
      } catch (err) {
        await handleError(denops, "emitter", emitter.name, err);
        return;
      }
    },
    async runWithoutCollector(recipe: unknown, source: unknown): Promise<void> {
      if (!isRecipe(recipe)) {
        echoError(denops, `The recipe is invalid format: ${recipe}`);
        return;
      }
      if (!isArray(source, isString)) {
        return;
      }

      const { processor, emitter } = recipe;
      let pipe: string[] = source;

      for (const recipe of processor) {
        try {
          pipe = await process(denops, recipe.name, recipe.options ?? {}, pipe);
        } catch (err) {
          await handleError(denops, "processor", recipe.name, err);
          return;
        }
      }

      try {
        await emit(denops, emitter.name, emitter.options ?? {}, pipe);
      } catch (err) {
        await handleError(denops, "emitter", emitter.name, err);
        return;
      }
    },
  };
  await Promise.resolve();
}
