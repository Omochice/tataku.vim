import { assert } from "https://deno.land/std@0.207.0/testing/asserts.ts";
import { isAsyncFunction } from "././utils.ts";

Deno.test({
  name: "Test for `isAsyncFunction`.",
  fn: async (t) => {
    await t.step("If x is async function, should return true.", () => {
      const x = async (n: unknown) => await Promise.resolve(n);
      assert(
        isAsyncFunction(x),
        `Given: ${Object.prototype.toString.call(x)}`,
      );
    });
    await t.step("If x is sync function, should return false.", () => {
      const x = (n: unknown) => n;
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
