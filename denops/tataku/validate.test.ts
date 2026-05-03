import { describe, it } from "jsr:@std/testing@1.0.13/bdd";
import { expect } from "jsr:@std/expect@1.0.17";
import { validate } from "./validate.ts";

describe("validate", () => {
  it("returns true for a minimal valid recipe", () => {
    const recipe = {
      collector: { name: "c" },
      processor: [{ name: "p" }],
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(true);
  });

  it("returns true when options are present on every page", () => {
    const recipe = {
      collector: { name: "c", options: { a: 1 } },
      processor: [{ name: "p", options: { b: 2 } }],
      emitter: { name: "e", options: { c: 3 } },
    };
    expect(validate(recipe)).toEqual(true);
  });

  it("returns false when processor is an empty array", () => {
    const recipe = {
      collector: { name: "c" },
      processor: [],
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false for null", () => {
    expect(validate(null)).toEqual(false);
  });

  it("returns false for non-object values", () => {
    expect(validate("recipe")).toEqual(false);
    expect(validate(42)).toEqual(false);
    expect(validate(undefined)).toEqual(false);
  });

  it("returns false when collector is missing", () => {
    const recipe = {
      processor: [{ name: "p" }],
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when processor is missing", () => {
    const recipe = {
      collector: { name: "c" },
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when emitter is missing", () => {
    const recipe = {
      collector: { name: "c" },
      processor: [{ name: "p" }],
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when collector.name is not a string", () => {
    const recipe = {
      collector: { name: 1 },
      processor: [{ name: "p" }],
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when collector.options is not a record", () => {
    const recipe = {
      collector: { name: "c", options: "not a record" },
      processor: [{ name: "p" }],
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when processor is not an array", () => {
    const recipe = {
      collector: { name: "c" },
      processor: { name: "p" },
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when a processor item lacks name", () => {
    const recipe = {
      collector: { name: "c" },
      processor: [{ options: {} }],
      emitter: { name: "e" },
    };
    expect(validate(recipe)).toEqual(false);
  });

  it("returns false when emitter.name is not a string", () => {
    const recipe = {
      collector: { name: "c" },
      processor: [{ name: "p" }],
      emitter: { name: 42 },
    };
    expect(validate(recipe)).toEqual(false);
  });
});
