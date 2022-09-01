import { assert } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { isAsyncFunction, isRecipe, isTatakuModule } from "././utils.ts";

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
