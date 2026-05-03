import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.13";
import { test } from "jsr:@denops/test@4.0.0";
import { join } from "jsr:@std/path@1.1.4";
import { main } from "../denops/tataku/main.ts";
import { addRuntimepath, copyFixture, waitFor } from "./_helpers.ts";

test({
  mode: "all",
  name: "main registers a run dispatcher",
  fn: async (denops) => {
    await main(denops);
    assertEquals(typeof denops.dispatcher.run, "function");
  },
});

test({
  mode: "all",
  name: "main.run pipes a valid recipe end-to-end into the emitter",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      await copyFixture("collector/simple.ts", root, "collector", "main_c");
      await copyFixture(
        "processor/passthrough.ts",
        root,
        "processor",
        "main_p",
      );
      await copyFixture("emitter/var.ts", root, "emitter", "main_e");
      await addRuntimepath(denops, root);
      await main(denops);

      const recipe = {
        collector: { name: "main_c" },
        processor: [{ name: "main_p" }],
        emitter: { name: "main_e" },
      };
      await denops.dispatcher.run(recipe);

      await waitFor(async () => {
        const v = await denops.eval(
          "exists('g:tataku_test_output') ? 1 : 0",
        ) as number;
        return v === 1;
      });
      const observed = await denops.eval("g:tataku_test_output");
      assertEquals(observed, ["hello", "world"]);
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});

test({
  mode: "all",
  name: "main.run reports an invalid recipe through tataku#util#echo_error",
  fn: async (denops) => {
    const root = await Deno.makeTempDir();
    try {
      const utilDir = join(root, "autoload", "tataku");
      await Deno.mkdir(utilDir, { recursive: true });
      await Deno.writeTextFile(
        join(utilDir, "util.vim"),
        [
          "function! tataku#util#echo_error(msg) abort",
          "  let g:tataku_test_error = a:msg",
          "endfunction",
          "",
        ].join("\n"),
      );
      await addRuntimepath(denops, root);
      await main(denops);

      await denops.dispatcher.run({ foo: "bar" });
      await waitFor(async () => {
        const v = await denops.eval(
          "get(g:, 'tataku_test_error', '')",
        ) as string;
        return v.length > 0;
      });
      const observed = await denops.eval("g:tataku_test_error") as string;
      assertStringIncludes(observed, "The recipe is invalid format");
    } finally {
      await Deno.remove(root, { recursive: true });
    }
  },
});
