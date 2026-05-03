import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.13";
import { test } from "jsr:@denops/test@4.0.0";
import {
  loadCollector,
  loadEmitter,
  loadProcessor,
} from "../denops/tataku/load.ts";
import { addRuntimepath, writeFixture } from "./_helpers.ts";

const collectorSource = `
export default () =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(["hello"]);
      controller.close();
    },
  });
`;

const processorSource = `
export default () => new TransformStream();
`;

const emitterSource = `
export default () => new WritableStream();
`;

const notFunctionSource = `export default 42;`;

test({
  mode: "all",
  name: "loadCollector returns factory when found in rtp",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await writeFixture(root, "collector", "found_c", collectorSource);
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
      await writeFixture(a, "collector", "dup_c", collectorSource);
      await writeFixture(b, "collector", "dup_c", collectorSource);
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
      await writeFixture(root, "collector", "bad_c", notFunctionSource);
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
      await writeFixture(root, "processor", "found_p", processorSource);
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
      await writeFixture(a, "processor", "dup_p", processorSource);
      await writeFixture(b, "processor", "dup_p", processorSource);
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
      await writeFixture(root, "processor", "bad_p", notFunctionSource);
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
      await writeFixture(root, "emitter", "found_e", emitterSource);
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
      await writeFixture(a, "emitter", "dup_e", emitterSource);
      await writeFixture(b, "emitter", "dup_e", emitterSource);
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
      await writeFixture(root, "emitter", "bad_e", notFunctionSource);
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
