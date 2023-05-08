import { assert } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import {
  isAsyncFunction,
  isRecipe,
  isRecipePage,
  isTatakuModule,
} from "././utils.ts";

Deno.test({
  name: "Test for `isAsyncFunction`.",
  fn: async (t) => {
    await t.step("If x is async function, should return true.", () => {
      const x = async () => {};
      assert(
        isAsyncFunction(x),
        `Given: ${Object.prototype.toString.call(x)}`,
      );
    });
    await t.step("If x is sync function, should return false.", () => {
      const x = () => {};
      assert(
        !isAsyncFunction(x),
        `Given: ${Object.prototype.toString.call(x)}`,
      );
    });
    await t.step("If x is not function, should return false.", () => {
      for (const x of [Number(), String(), Object()]) {
        assert(
          !isAsyncFunction(x),
          `Given: ${typeof x}`,
        );
      }
    });
  },
});

Deno.test({
  name: "Test for `isTatakuModule`.",
  fn: async (t) => {
    await t.step("If x has `run` as function, should return true.", () => {
      const x = { run: () => {} };
      assert(isTatakuModule(x), `Given: ${x}`);
    });
    await t.step(
      "If x has `run` as async function, should return true.",
      () => {
        const x = { run: async () => {} };
        assert(isTatakuModule(x), `Given: ${x}`);
      },
    );
    await t.step(
      "If x has other name props, should return true even if has `run`.",
      () => {
        const x = { run: async () => {}, other: 100 };
        assert(isTatakuModule(x), `Given: ${x}`);
      },
    );
    await t.step(
      "If x is not Object, should return false.",
      () => {
        for (const x of [Number(), String(), Function()]) {
          assert(!isTatakuModule(x), `Given: ${typeof x}`);
        }
      },
    );
    await t.step(
      "If x does not have `run` props, should return false.",
      () => {
        const x = { notrun: () => {} };
        assert(!isTatakuModule(x), `Given: ${typeof x}`);
      },
    );
    await t.step(
      "If x has `run` props but it is not function, should return false.",
      () => {
        for (const n of [Number(), String(), Object()]) {
          const x = { run: n };
          assert(!isTatakuModule(x), `Given: ${typeof x}`);
        }
      },
    );
  },
});

Deno.test({
  name: "Test for `isRecipe`",
  fn: async (t) => {
    await t.step("If x is expected format, should return true", () => {
      const x = {
        collector: { name: "sample", options: {} },
        processor: [{ name: "sample", options: {} }],
        emitter: { name: "sample", options: {} },
      };
      assert(isRecipe(x), `Given: ${x}`);
    });
    await t.step("If `collector` is missing in x, should return false", () => {
      const x = {
        processor: [{ name: "sample", options: {} }],
        emitter: { name: "sample", options: {} },
      };
      assert(!isRecipe(x), `Given: ${x}`);
    });
    await t.step("If `processor` is missing in x, should return false", () => {
      const x = {
        collector: { name: "sample", options: {} },
        emitter: { name: "sample", options: {} },
      };
      assert(!isRecipe(x), `Given: ${x}`);
    });
    await t.step("If `emitter` is missing in x, should return false", () => {
      const x = {
        collector: { name: "sample", options: {} },
        processor: [{ name: "sample", options: {} }],
      };
      assert(!isRecipe(x), `Given: ${x}`);
    });
  },
});

Deno.test({
  name: "Test for `isRecipePage`",
  fn: async (t) => {
    await t.step("If x is expected format, should return true", () => {
      const x = { name: "", options: {} };
      assert(isRecipePage(x), `Given: ${x}`);
    });
    await t.step("Even if x has other prop too, should return true", () => {
      const x = { name: "", options: {}, other: "" };
      assert(isRecipePage(x), `Given: ${x}`);
    });
    await t.step("If `name` has value not string, should return false", () => {
      for (const prop of [Number(), Array(0), Object(), Function()]) {
        const x = { name: prop, options: {} };
        assert(!isRecipePage(x), `Given: ${x}`);
      }
    });
    await t.step(
      "If `options` has value not object, should return false",
      () => {
        for (const prop of [Number(), String(), Array(0), Function()]) {
          const x = { name: "", options: prop };
          assert(!isRecipePage(x), `Given: ${x}`);
        }
      },
    );
    await t.step("If x does not have `name`, should return false", () => {
      const x = { options: {} };
      assert(!isRecipePage(x), `Given: ${x}`);
    });
    await t.step("If x does not have `options`, should return true", () => {
      const x = { name: "" };
      assert(isRecipePage(x), `Given: ${x}`);
    });
  },
});
