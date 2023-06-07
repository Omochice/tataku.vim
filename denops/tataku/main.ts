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
      _recipe: unknown,
      _source: unknown,
    ): Promise<void> {
      await Promise.resolve();
      // if (!validate(recipe)) {
      //   echoError(
      //     denops,
      //     `The recipe is invalid format: ${JSON.stringify(recipe)}`,
      //   );
      //   return;
      // }
      // if (!isArray(source, isString)) {
      //   return;
      // }

      // const { processor: processors, emitter } = recipe;

      // let processed = source;
      // for (const processor of processors) {
      //   const result = await process(
      //     denops,
      //     processor.name,
      //     processor.options ?? {},
      //     processed,
      //   );
      //   if (result.isErr()) {
      //     await handleError(
      //       denops,
      //       "processor",
      //       processor.name,
      //       result.unwrap(),
      //     );
      //     return;
      //   }
      //   processed = result.unwrap();
      // }

      // const result = await emit(
      //   denops,
      //   emitter.name,
      //   emitter.options ?? {},
      //   processed,
      // );
      // if (result.isErr()) {
      //   await handleError(denops, "emitter", emitter.name, result.unwrapErr());
      //   return;
      // }
    },
  };
  await Promise.resolve();
}
