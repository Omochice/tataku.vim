import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import { expect } from "jsr:@std/expect@1.0.17";
import { DenopsStub } from "jsr:@denops/test@4.0.0/stub";
import collector from "./operator.ts";

async function readAll(
  stream: ReadableStream<string[]>,
): Promise<string[][]> {
  const chunks: string[][] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

describe("operator collector", () => {
  it("emits options.selected once and closes the stream", async () => {
    const denops = new DenopsStub();
    const stream = await collector(denops, { selected: ["a", "b"] });
    const chunks = await readAll(stream);
    expect(chunks).toEqual([["a", "b"]]);
  });

  it("emits an empty array when selected is empty", async () => {
    const denops = new DenopsStub();
    const stream = await collector(denops, { selected: [] });
    const chunks = await readAll(stream);
    expect(chunks).toEqual([[]]);
  });

  it("throws when options is undefined", () => {
    const denops = new DenopsStub();
    expect(() => collector(denops, undefined)).toThrow();
  });

  it("throws when options.selected is missing", () => {
    const denops = new DenopsStub();
    expect(() => collector(denops, {})).toThrow();
  });

  it("throws when options.selected contains non-string", () => {
    const denops = new DenopsStub();
    expect(() => collector(denops, { selected: ["a", 1] })).toThrow();
  });
});
