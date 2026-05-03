import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import { expect } from "jsr:@std/expect@1.0.17";
import { DenopsStub } from "jsr:@denops/test@4.0.0/stub";
import { convertError, echoError, handleError } from "./utils.ts";

describe("convertError", () => {
  it("returns the original Error instance unchanged", () => {
    const original = new Error("boom");
    const converted = convertError("ignored")(original);
    expect(converted).toBe(original);
  });

  it("wraps non-Error with default message 'Failed' and preserves cause", () => {
    const err = convertError()("boom");
    expect(err.message).toEqual("Failed");
    expect(err.cause).toEqual("boom");
  });

  it("uses the provided message for non-Error inputs", () => {
    const err = convertError("custom message")("boom");
    expect(err.message).toEqual("custom message");
    expect(err.cause).toEqual("boom");
  });

  it("preserves object causes by reference", () => {
    const cause = { foo: 1 };
    const err = convertError()(cause);
    expect(err.cause).toBe(cause);
  });

  it("preserves undefined cause", () => {
    const err = convertError()(undefined);
    expect(err.cause).toEqual(undefined);
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
    expect(calls).toEqual([{
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
    expect(calls).toEqual([{
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
    expect(calls).toEqual([{
      fn: "tataku#util#echo_error",
      args: ["Unexpected throwing in processor-bar: raw value"],
    }]);
  });
});
