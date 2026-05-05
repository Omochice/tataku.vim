import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import { expect } from "jsr:@std/expect@1.0.17";
import { checkRecipe, CombinedProcessorStream } from "./tataku.ts";

const validRecipe = {
  collector: { name: "c" },
  processor: [{ name: "p" }],
  emitter: { name: "e" },
};

describe("checkRecipe", () => {
  it("returns ok(recipe) when valid and replacement is undefined", () => {
    const result = checkRecipe(validRecipe);
    expect(result.isOk()).toEqual(true);
    expect(result._unsafeUnwrap()).toEqual(validRecipe);
  });

  it("returns err when recipe is invalid", () => {
    const result = checkRecipe({ foo: "bar" });
    expect(result.isErr()).toEqual(true);
  });

  it("returns err when replacement is null", () => {
    const result = checkRecipe(validRecipe, null);
    expect(result.isErr()).toEqual(true);
    expect(result._unsafeUnwrapErr().message).toEqual(
      ":Internal error: replacing collector is failed",
    );
  });

  it("replaces collector with operator when replacement is provided", () => {
    const result = checkRecipe(validRecipe, ["x", "y"]);
    expect(result.isOk()).toEqual(true);
    const recipe = result._unsafeUnwrap();
    expect(recipe.collector).toEqual({
      name: "operator",
      options: { selected: ["x", "y"] },
    });
  });

  it("preserves processor and emitter when replacement is provided", () => {
    const result = checkRecipe(validRecipe, ["x"]);
    const recipe = result._unsafeUnwrap();
    expect(recipe.processor).toEqual(validRecipe.processor);
    expect(recipe.emitter).toEqual(validRecipe.emitter);
  });
});

describe("CombinedProcessorStream", () => {
  it("throws when streams array is empty", () => {
    expect(() => new CombinedProcessorStream([])).toThrow(
      "Combine target is must be exists",
    );
  });

  it("uses the single stream's writable and readable for length=1", () => {
    const single = new TransformStream<string[]>();
    const combined = new CombinedProcessorStream([single]);
    expect(combined.writable).toBe(single.writable);
    expect(combined.readable).toBe(single.readable);
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
    expect(first.done).toEqual(false);
    expect(first.value).toEqual(["C", "B", "A"]);

    const second = await reader.read();
    expect(second.done).toEqual(true);
  });
});
