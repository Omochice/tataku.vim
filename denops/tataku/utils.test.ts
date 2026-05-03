import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import { assertEquals, assertStrictEquals } from "jsr:@std/assert@1.0.13";
import { DenopsStub } from "jsr:@denops/test@4.0.0/stub";
import { convertError, echoError, handleError } from "./utils.ts";

describe("convertError", () => {
  it("returns the original Error instance unchanged", () => {
    const original = new Error("boom");
    const converted = convertError("ignored")(original);
    assertStrictEquals(converted, original);
  });

  it("wraps non-Error with default message 'Failed' and preserves cause", () => {
    const err = convertError()("boom");
    assertEquals(err.message, "Failed");
    assertEquals(err.cause, "boom");
  });

  it("uses the provided message for non-Error inputs", () => {
    const err = convertError("custom message")("boom");
    assertEquals(err.message, "custom message");
    assertEquals(err.cause, "boom");
  });

  it("preserves object causes by reference", () => {
    const cause = { foo: 1 };
    const err = convertError()(cause);
    assertStrictEquals(err.cause, cause);
  });

  it("preserves undefined cause", () => {
    const err = convertError()(undefined);
    assertEquals(err.cause, undefined);
  });
});

describe("echoError", () => {
  it("calls denops.call with 'tataku#util#echo_error' and the message", async () => {
    const calls: { fn: string; args: unknown[] }[] = [];
    const denops = new DenopsStub({
      call: (fn, ...args) => {
        calls.push({ fn, args });
        return Promise.resolve();
      },
    });
    await echoError(denops, "hello");
    assertEquals(calls, [{
      fn: "tataku#util#echo_error",
      args: ["hello"],
    }]);
  });
});

describe("handleError", () => {
  it("echoes 'Error occurred in {kind}-{name}: {message}' for Error", async () => {
    const calls: { fn: string; args: unknown[] }[] = [];
    const denops = new DenopsStub({
      call: (fn, ...args) => {
        calls.push({ fn, args });
        return Promise.resolve();
      },
    });
    await handleError(denops, "collector", "foo", new Error("boom"));
    assertEquals(calls, [{
      fn: "tataku#util#echo_error",
      args: ["Error occurred in collector-foo: boom"],
    }]);
  });

  it("echoes 'Unexpected throwing in {kind}-{name}: {value}' for non-Error", async () => {
    const calls: { fn: string; args: unknown[] }[] = [];
    const denops = new DenopsStub({
      call: (fn, ...args) => {
        calls.push({ fn, args });
        return Promise.resolve();
      },
    });
    await handleError(denops, "processor", "bar", "raw value");
    assertEquals(calls, [{
      fn: "tataku#util#echo_error",
      args: ["Unexpected throwing in processor-bar: raw value"],
    }]);
  });
});
