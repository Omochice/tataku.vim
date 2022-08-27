import {
  Denops,
  echoerr,
  isArray,
  isFunction,
  isObject,
  isString,
} from "./deps.ts";
import { Recipe, RecipePage, TatakuModule } from "./types.ts";

/**
 * Return `true` if the type of `x` is `async function`.
 *
 * @example
 * const foo = async () => { return Promise.resolve(42) }
 * isAsyncFunction(foo)
 * // true
 *
 * const bar = () => { return 42 }
 * isAsyncFunction(bar)
 * // false
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
 */
export function isTatakuModule<T>(x: Record<string, unknown>): x is TatakuModule<T> {
  return (isObject(x, isFunction) || isObject(x, isAsyncFunction)) &&
    "run" in x;
}

export function isRecipe(x: Record<string, unknown>): x is Recipe {
  const acceptInputter = "inputter" in x && isObject(x.inputter) &&
    isRecipePage(x.inputter);
  const acceptProcessor = "processor" in x && isArray(x.processor, isObject) &&
    x.processor.every((p) => isRecipePage(p));
  const acceptOutputter = "outputter" in x && isObject(x.outputter) &&
    isRecipePage(x.outputter);
  return acceptInputter && acceptProcessor && acceptOutputter;
}

export function isRecipePage(x: Record<string, unknown>): x is RecipePage {
  const acceptName = "name" in x && isString(x.name);
  const acceptOptions = "options" in x && isObject(x.options);
  return acceptName && acceptOptions;
}

/**
 * Echo error message with `[tataku]` as prefix
 *
 * @example
 * echoError(denops, "message")
 * // show error in vim/neovim
 */
export async function echoError(denops: Denops, msg: string): Promise<void> {
  await echoerr(denops, `[tataku] ${msg}`);
}
