import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.13";
import { test } from "jsr:@denops/test@4.0.0";
import { prepareStreams } from "../denops/tataku/tataku.ts";
import { addRuntimepath, copyFixture } from "./_helpers.ts";

test({
  mode: "all",
  name: "prepareStreams returns three streams for a valid recipe",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await Promise.all([
        copyFixture("collector/simple.ts", root, "collector", "ps_c"),
        copyFixture("processor/passthrough.ts", root, "processor", "ps_p"),
        copyFixture("emitter/empty.ts", root, "emitter", "ps_e"),
      ]);
      await addRuntimepath(denops, root);

      const recipe = {
        collector: { name: "ps_c" },
        processor: [{ name: "ps_p" }],
        emitter: { name: "ps_e" },
      };
      const result = await prepareStreams(denops, recipe);
      assertEquals(result.isOk(), true);
      const streams = result._unsafeUnwrap();
      assertEquals(streams.collector instanceof ReadableStream, true);
      assertEquals(streams.processor instanceof TransformStream, true);
      assertEquals(streams.emitter instanceof WritableStream, true);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "prepareStreams returns err when recipe is invalid",
  fn: async (denops) => {
    const result = await prepareStreams(denops, { foo: "bar" });
    assertEquals(result.isErr(), true);
    assertStringIncludes(
      result._unsafeUnwrapErr().message,
      "The recipe is invalid format",
    );
  },
});

test({
  mode: "all",
  name: "prepareStreams returns err when collector module is not found",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await Promise.all([
        copyFixture(
          "processor/passthrough.ts",
          root,
          "processor",
          "ps_missing_p",
        ),
        copyFixture("emitter/empty.ts", root, "emitter", "ps_missing_e"),
      ]);
      await addRuntimepath(denops, root);

      const recipe = {
        collector: { name: "ps_missing_c" },
        processor: [{ name: "ps_missing_p" }],
        emitter: { name: "ps_missing_e" },
      };
      const result = await prepareStreams(denops, recipe);
      assertEquals(result.isErr(), true);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "prepareStreams succeeds with replacement using the operator collector",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await Promise.all([
        copyFixture(
          "processor/passthrough.ts",
          root,
          "processor",
          "ps_rep_p",
        ),
        copyFixture("emitter/empty.ts", root, "emitter", "ps_rep_e"),
      ]);
      await addRuntimepath(denops, root);
      await addRuntimepath(denops, Deno.cwd());

      const recipe = {
        collector: { name: "anything" },
        processor: [{ name: "ps_rep_p" }],
        emitter: { name: "ps_rep_e" },
      };
      const result = await prepareStreams(denops, recipe, ["a", "b"]);
      assertEquals(result.isOk(), true);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "prepareStreams returns err when replacement is null",
  fn: async (denops) => {
    const recipe = {
      collector: { name: "c" },
      processor: [{ name: "p" }],
      emitter: { name: "e" },
    };
    const result = await prepareStreams(denops, recipe, null);
    assertEquals(result.isErr(), true);
    assertStringIncludes(
      result._unsafeUnwrapErr().message,
      "replacing collector is failed",
    );
  },
});
