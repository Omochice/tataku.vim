import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import { assertEquals, assertThrows } from "jsr:@std/assert@1.0.13";
import { DenopsStub } from "jsr:@denops/test@4.0.0/stub";
import collector from "./operator.ts";

async function readAll(
  stream: ReadableStream<string[]>,
): Promise<string[][]> {
  const chunks: string[][] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }
  return chunks;
}

describe("operator collector", () => {
  it("emits options.selected once and closes the stream", async () => {
    const denops = new DenopsStub();
    const stream = await collector(denops, { selected: ["a", "b"] });
    const chunks = await readAll(stream);
    assertEquals(chunks, [["a", "b"]]);
  });

  it("emits an empty array when selected is empty", async () => {
    const denops = new DenopsStub();
    const stream = await collector(denops, { selected: [] });
    const chunks = await readAll(stream);
    assertEquals(chunks, [[]]);
  });

  it("throws when options is undefined", () => {
    const denops = new DenopsStub();
    assertThrows(() => collector(denops, undefined));
  });

  it("throws when options.selected is missing", () => {
    const denops = new DenopsStub();
    assertThrows(() => collector(denops, {}));
  });

  it("throws when options.selected contains non-string", () => {
    const denops = new DenopsStub();
    assertThrows(() => collector(denops, { selected: ["a", 1] }));
  });
});
