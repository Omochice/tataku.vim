import { Denops, isArray, isString } from "./deps.ts";
import { echoError, handleError } from "./utils.ts";
import { collect, emit, process } from "./tataku.ts";
import { validate } from "./types.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async run(recipe: unknown): Promise<void> {
      if (!validate(recipe)) {
        echoError(
          denops,
          `The recipe is invalid format: ${JSON.stringify(recipe)}`,
        );
        return;
      }

      const { collector, processor: processors, emitter } = recipe;

      const collected = await collect(
        denops,
        collector.name,
        collector.options ?? {},
      );
      if (collected.isErr()) {
        await handleError(denops, "collector", collector.name, collected.error);
        return;
      }

      let processed = collected.value;
      for (const processor of processors) {
        const result = await process(
          denops,
          processor.name,
          processor.options ?? {},
          processed,
        );
        if (result.isErr()) {
          await handleError(
            denops,
            "processor",
            processor.name,
            result.error,
          );
          return;
        }
        processed = result.value;
      }

      const result = await emit(
        denops,
        emitter.name,
        emitter.options ?? {},
        processed,
      );
      if (result.isErr()) {
        await handleError(denops, "emitter", emitter.name, result.error);
        return;
      }
    },
    async runWithoutCollector(recipe: unknown, source: unknown): Promise<void> {
      if (!validate(recipe)) {
        echoError(
          denops,
          `The recipe is invalid format: ${JSON.stringify(recipe)}`,
        );
        return;
      }
      if (!isArray(source, isString)) {
        return;
      }

      const { processor: processors, emitter } = recipe;

      let processed = source;
      for (const processor of processors) {
        const result = await process(
          denops,
          processor.name,
          processor.options ?? {},
          processed,
        );
        if (result.isErr()) {
          await handleError(
            denops,
            "processor",
            processor.name,
            result.error,
          );
          return;
        }
        processed = result.value;
      }

      const result = await emit(
        denops,
        emitter.name,
        emitter.options ?? {},
        processed,
      );
      if (result.isErr()) {
        await handleError(denops, "emitter", emitter.name, result.error);
        return;
      }
    },
  };
  await Promise.resolve();
}
