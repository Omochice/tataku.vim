import { Denops, is } from "./deps.ts";
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
        await handleError(
          denops,
          "collector",
          collector.name,
          collected.unwrapErr(),
        );
        return;
      }

      let processed = collected.unwrap();
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
            result.unwrapErr(),
          );
          return;
        }
        processed = result.unwrap();
      }

      const result = await emit(
        denops,
        emitter.name,
        emitter.options ?? {},
        processed,
      );
      if (result.isErr()) {
        await handleError(denops, "emitter", emitter.name, result.unwrapErr());
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
      if (!is.ArrayOf(is.String)(source)) {
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
            result.unwrap(),
          );
          return;
        }
        processed = result.unwrap();
      }

      const result = await emit(
        denops,
        emitter.name,
        emitter.options ?? {},
        processed,
      );
      if (result.isErr()) {
        await handleError(denops, "emitter", emitter.name, result.unwrapErr());
        return;
      }
    },
  };
  await Promise.resolve();
}
