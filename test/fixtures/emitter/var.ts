import type { Denops } from "jsr:@denops/std@8.2.0";
import { globals } from "jsr:@denops/std@8.2.0/variable";

export default (denops: Denops): WritableStream<string[]> =>
  new WritableStream<string[]>({
    async write(chunk) {
      await globals.set(denops, "tataku_test_output", chunk);
    },
  });
