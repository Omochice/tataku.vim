import {
  Denops,
  echoerr,
  isArray,
  isFunction,
  isObject,
  isString,
} from "./deps.ts";
import { Kind, Recipe, RecipePage, TatakuModule } from "./types.ts";

/**
 * Return `true` if the type of `x` is `async function`.
 *
 * @example
 * ```typescript
 * const foo = async () => { return Promise.resolve(42) }
 * isAsyncFunction(foo)
 * // true
 *
 * const bar = () => { return 42 }
 * isAsyncFunction(bar)
 * // false
 * ```
 */
export function isAsyncFunction(
  x: unknown,
): x is (...args: unknown[]) => Promise<unknown> {
  // I refered https://github.com/lambdalisue/deno-unknownutil/blob/310bdffd6258e519472cb2b4c3501ee9369bf5d1/is.ts#L59
  return Object.prototype.toString.call(x) === "[object AsyncFunction]";
}

/**
 * Return `true` if the type of `x` is `TatakuModule`
 *
 * @example
 * ```typescript
 * const foo = { run: (denops: Denops, Option: Record<string, unknown>) => { return Promise.resolve(["42"]) } }
 * isTatakuModule(foo)
 * // true
 *
 * const bar = { other: (denops: Denops, Option: Record<string, unknown>) => { return Promise.resolve(["42"]) }
 * isTatakuModule(bar)
 * // false
 *
 * const spam = { run: 42 }
 * isTatakuModule(spam)
 * // false
 * ```
 */
export function isTatakuModule(x: Record<string, unknown>): x is TatakuModule {
  return "run" in x && (isFunction(x.run) || isAsyncFunction(x.run));
}

/**
 * Return `true` if the type of `x` is `Recipe`
 *
 * @example
 * ```typescript
 * const r = {
 *   collector: { name: "sample", options: {}, },
 *   processor: [{ name: "sample", options: {}, },],
 *   emitter: { name: "sample", options: {}, },
 *   }
 * isRecipe(r)
 * // true
 * ```
 */
export function isRecipe(x: Record<string, unknown>): x is Recipe {
  const acceptCollector = "collector" in x && isObject(x.collector) &&
    isRecipePage(x.collector);
  const acceptProcessor = "processor" in x && isArray(x.processor, isObject) &&
    x.processor.every((p) => isRecipePage(p));
  const acceptEmitter = "emitter" in x && isObject(x.emitter) &&
    isRecipePage(x.emitter);
  return acceptCollector && acceptProcessor && acceptEmitter;
}

/**
 * Return `true` if the type of `x` is `RecipePage`
 *
 * @example
 * ```typescript
 * const r = { name: "sample", options: {}, }
 * isRecipePage(r)
 * // true
 * ```
 */
export function isRecipePage(x: Record<string, unknown>): x is RecipePage {
  const acceptName = "name" in x && isString(x.name);
  const acceptOptions = "options" in x && isObject(x.options);
  return acceptName && acceptOptions;
}

/**
 * Echo error message with `[tataku]` as prefix
 *
 * @example
 * ```typescript
 * echoError(denops, "message")
 * // show error in vim/neovim
 * ```
 */
export async function echoError(denops: Denops, msg: string): Promise<void> {
  await echoerr(denops, `[tataku] ${msg}`);
}
