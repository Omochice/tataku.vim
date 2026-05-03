import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.13";
import { test } from "jsr:@denops/test@4.0.0";
import {
  loadCollector,
  loadEmitter,
  loadProcessor,
} from "../denops/tataku/load.ts";
import { addRuntimepath, copyFixture } from "./_helpers.ts";

test({
  mode: "all",
  name: "loadCollector returns factory when found in rtp",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture("collector/simple.ts", root, "collector", "found_c");
      await addRuntimepath(denops, root);
      const result = await loadCollector(denops, "found_c");
      assertEquals(result.isOk(), true);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadCollector returns err when not in rtp",
  fn: async (denops) => {
    const result = await loadCollector(denops, "missing_c");
    assertEquals(result.isErr(), true);
    assertStringIncludes(
      result._unsafeUnwrapErr().message,
      "is not found in rtp",
    );
  },
});

test({
  mode: "all",
  name: "loadCollector returns err when found in multiple rtp entries",
  fn: async (denops) => {
    const a = await Deno.makeTempDir();
    const b = await Deno.makeTempDir();
    try {
      await copyFixture("collector/simple.ts", a, "collector", "dup_c");
      await copyFixture("collector/simple.ts", b, "collector", "dup_c");
      await addRuntimepath(denops, a);
      await addRuntimepath(denops, b);
      const result = await loadCollector(denops, "dup_c");
      assertEquals(result.isErr(), true);
      assertStringIncludes(result._unsafeUnwrapErr().message, "found multiply");
    } finally {
      await Deno.remove(a, { recursive: true });
      await Deno.remove(b, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadCollector returns err when default export is not a function",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture("not_function.ts", root, "collector", "bad_c");
      await addRuntimepath(denops, root);
      const result = await loadCollector(denops, "bad_c");
      assertEquals(result.isErr(), true);
      assertStringIncludes(
        result._unsafeUnwrapErr().message,
        "loading collector(bad_c) is failed",
      );
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadProcessor returns factory when found in rtp",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture(
        "processor/passthrough.ts",
        root,
        "processor",
        "found_p",
      );
      await addRuntimepath(denops, root);
      const result = await loadProcessor(denops, "found_p");
      assertEquals(result.isOk(), true);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadProcessor returns err when not in rtp",
  fn: async (denops) => {
    const result = await loadProcessor(denops, "missing_p");
    assertEquals(result.isErr(), true);
    assertStringIncludes(
      result._unsafeUnwrapErr().message,
      "is not found in rtp",
    );
  },
});

test({
  mode: "all",
  name: "loadProcessor returns err when found in multiple rtp entries",
  fn: async (denops) => {
    const a = await Deno.makeTempDir();
    const b = await Deno.makeTempDir();
    try {
      await copyFixture("processor/passthrough.ts", a, "processor", "dup_p");
      await copyFixture("processor/passthrough.ts", b, "processor", "dup_p");
      await addRuntimepath(denops, a);
      await addRuntimepath(denops, b);
      const result = await loadProcessor(denops, "dup_p");
      assertEquals(result.isErr(), true);
      assertStringIncludes(result._unsafeUnwrapErr().message, "found multiply");
    } finally {
      await Deno.remove(a, { recursive: true });
      await Deno.remove(b, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadProcessor returns err when default export is not a function",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture("not_function.ts", root, "processor", "bad_p");
      await addRuntimepath(denops, root);
      const result = await loadProcessor(denops, "bad_p");
      assertEquals(result.isErr(), true);
      assertStringIncludes(
        result._unsafeUnwrapErr().message,
        "loading processor(bad_p) is failed",
      );
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadEmitter returns factory when found in rtp",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture("emitter/empty.ts", root, "emitter", "found_e");
      await addRuntimepath(denops, root);
      const result = await loadEmitter(denops, "found_e");
      assertEquals(result.isOk(), true);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadEmitter returns err when not in rtp",
  fn: async (denops) => {
    const result = await loadEmitter(denops, "missing_e");
    assertEquals(result.isErr(), true);
    assertStringIncludes(
      result._unsafeUnwrapErr().message,
      "is not found in rtp",
    );
  },
});

test({
  mode: "all",
  name: "loadEmitter returns err when found in multiple rtp entries",
  fn: async (denops) => {
    const a = await Deno.makeTempDir();
    const b = await Deno.makeTempDir();
    try {
      await copyFixture("emitter/empty.ts", a, "emitter", "dup_e");
      await copyFixture("emitter/empty.ts", b, "emitter", "dup_e");
      await addRuntimepath(denops, a);
      await addRuntimepath(denops, b);
      const result = await loadEmitter(denops, "dup_e");
      assertEquals(result.isErr(), true);
      assertStringIncludes(result._unsafeUnwrapErr().message, "found multiply");
    } finally {
      await Deno.remove(a, { recursive: true });
      await Deno.remove(b, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "loadEmitter returns err when default export is not a function",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture("not_function.ts", root, "emitter", "bad_e");
      await addRuntimepath(denops, root);
      const result = await loadEmitter(denops, "bad_e");
      assertEquals(result.isErr(), true);
      assertStringIncludes(
        result._unsafeUnwrapErr().message,
        "loading emitter(bad_e) is failed",
      );
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});
