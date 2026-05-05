import { expect } from "jsr:@std/expect@1.0.17";
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
      expect(result.isOk()).toEqual(true);
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
    expect(result.isErr()).toEqual(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "is not found in rtp",
    );
  },
});

test({
  mode: "all",
  name: "loadCollector returns err when found in multiple rtp entries",
  fn: async (denops) => {
    const [a, b] = await Promise.all([Deno.makeTempDir(), Deno.makeTempDir()]);
    try {
      await Promise.all([
        copyFixture("collector/simple.ts", a, "collector", "dup_c"),
        copyFixture("collector/simple.ts", b, "collector", "dup_c"),
      ]);
      await addRuntimepath(denops, a);
      await addRuntimepath(denops, b);
      const result = await loadCollector(denops, "dup_c");
      expect(result.isErr()).toEqual(true);
      expect(result._unsafeUnwrapErr().message).toContain("found multiply");
    } finally {
      await Promise.all([
        Deno.remove(a, { recursive: true }),
        Deno.remove(b, { recursive: true }),
      ]);
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
      expect(result.isErr()).toEqual(true);
      expect(result._unsafeUnwrapErr().message).toContain(
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
      expect(result.isOk()).toEqual(true);
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
    expect(result.isErr()).toEqual(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "is not found in rtp",
    );
  },
});

test({
  mode: "all",
  name: "loadProcessor returns err when found in multiple rtp entries",
  fn: async (denops) => {
    const [a, b] = await Promise.all([Deno.makeTempDir(), Deno.makeTempDir()]);
    try {
      await Promise.all([
        copyFixture("processor/passthrough.ts", a, "processor", "dup_p"),
        copyFixture("processor/passthrough.ts", b, "processor", "dup_p"),
      ]);
      await addRuntimepath(denops, a);
      await addRuntimepath(denops, b);
      const result = await loadProcessor(denops, "dup_p");
      expect(result.isErr()).toEqual(true);
      expect(result._unsafeUnwrapErr().message).toContain("found multiply");
    } finally {
      await Promise.all([
        Deno.remove(a, { recursive: true }),
        Deno.remove(b, { recursive: true }),
      ]);
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
      expect(result.isErr()).toEqual(true);
      expect(result._unsafeUnwrapErr().message).toContain(
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
      expect(result.isOk()).toEqual(true);
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
    expect(result.isErr()).toEqual(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "is not found in rtp",
    );
  },
});

test({
  mode: "all",
  name: "loadEmitter returns err when found in multiple rtp entries",
  fn: async (denops) => {
    const [a, b] = await Promise.all([Deno.makeTempDir(), Deno.makeTempDir()]);
    try {
      await Promise.all([
        copyFixture("emitter/empty.ts", a, "emitter", "dup_e"),
        copyFixture("emitter/empty.ts", b, "emitter", "dup_e"),
      ]);
      await addRuntimepath(denops, a);
      await addRuntimepath(denops, b);
      const result = await loadEmitter(denops, "dup_e");
      expect(result.isErr()).toEqual(true);
      expect(result._unsafeUnwrapErr().message).toContain("found multiply");
    } finally {
      await Promise.all([
        Deno.remove(a, { recursive: true }),
        Deno.remove(b, { recursive: true }),
      ]);
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
      expect(result.isErr()).toEqual(true);
      expect(result._unsafeUnwrapErr().message).toContain(
        "loading emitter(bad_e) is failed",
      );
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});
