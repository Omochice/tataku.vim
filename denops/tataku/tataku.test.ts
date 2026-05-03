import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import {
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "jsr:@std/assert@1.0.13";
import { checkRecipe, CombinedProcessorStream } from "./tataku.ts";

const validRecipe = {
  collector: { name: "c" },
  processor: [{ name: "p" }],
  emitter: { name: "e" },
};

describe("checkRecipe", () => {
  it("returns ok(recipe) when valid and replacement is undefined", () => {
    const result = checkRecipe(validRecipe);
    assertEquals(result.isOk(), true);
    assertEquals(result._unsafeUnwrap(), validRecipe);
  });

  it("returns err when recipe is invalid", () => {
    const result = checkRecipe({ foo: "bar" });
    assertEquals(result.isErr(), true);
  });

  it("returns err when replacement is null", () => {
    const result = checkRecipe(validRecipe, null);
    assertEquals(result.isErr(), true);
    assertEquals(
      result._unsafeUnwrapErr().message,
      ":Internal error: replacing collector is failed",
    );
  });

  it("replaces collector with operator when replacement is provided", () => {
    const result = checkRecipe(validRecipe, ["x", "y"]);
    assertEquals(result.isOk(), true);
    const recipe = result._unsafeUnwrap();
    assertEquals(recipe.collector, {
      name: "operator",
      options: { selected: ["x", "y"] },
    });
  });

  it("preserves processor and emitter when replacement is provided", () => {
    const result = checkRecipe(validRecipe, ["x"]);
    const recipe = result._unsafeUnwrap();
    assertEquals(recipe.processor, validRecipe.processor);
    assertEquals(recipe.emitter, validRecipe.emitter);
  });
});

describe("CombinedProcessorStream", () => {
  it("throws when streams array is empty", () => {
    assertThrows(
      () => new CombinedProcessorStream([]),
      Error,
      "Combine target is must be exists",
    );
  });

  it("uses the single stream's writable and readable for length=1", () => {
    const single = new TransformStream<string[]>();
    const combined = new CombinedProcessorStream([single]);
    assertStrictEquals(combined.writable, single.writable);
    assertStrictEquals(combined.readable, single.readable);
  });

  it("pipes data through multiple processors in order", async () => {
    const upper = new TransformStream<string[], string[]>({
      transform(chunk, controller) {
        controller.enqueue(chunk.map((s) => s.toUpperCase()));
      },
    });
    const reverse = new TransformStream<string[], string[]>({
      transform(chunk, controller) {
        controller.enqueue([...chunk].reverse());
      },
    });
    const combined = new CombinedProcessorStream([upper, reverse]);

    const writer = combined.writable.getWriter();
    const reader = combined.readable.getReader();

    await writer.write(["a", "b", "c"]);
    await writer.close();

    const first = await reader.read();
    assertEquals(first.done, false);
    assertEquals(first.value, ["C", "B", "A"]);

    const second = await reader.read();
    assertEquals(second.done, true);
  });
});
