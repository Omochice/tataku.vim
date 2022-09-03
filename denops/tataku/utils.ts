import { Denops, isArray, isFunction, isObject, isString } from "./deps.ts";
import {
  Collector,
  Emitter,
  Kind,
  Processor,
  Recipe,
  RecipePage,
  TatakuModule,
} from "./types.ts";

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
export function isTatakuModule<T extends Collector | Processor | Emitter>(
  x: unknown,
): x is TatakuModule<T> {
  return isObject(x) && (isFunction(x.run) || isAsyncFunction(x.run));
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
export function isRecipe(x: unknown): x is Recipe {
  if (!isObject(x)) {
    return false;
  }
  const acceptCollector = isObject(x.collector) && isRecipePage(x.collector);
  const acceptProcessor = isArray(x.processor) &&
    x.processor.every((p) => isObject(p) && isRecipePage(p));
  const acceptEmitter = isObject(x.emitter) && isRecipePage(x.emitter);
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
  const acceptName = isString(x.name);
  const acceptOptions = isObject(x.options);
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
  await denops.call("tataku#util#echo_error", msg);
}

/**
 * handle error in tataku module
 */
export async function handleError(
  denops: Denops,
  kind: Kind,
  name: string,
  error: unknown,
) {
  if (error instanceof Error) {
    await echoError(
      denops,
      `Error occured in ${kind}-${name}: ${error.message}`,
    );
  } else {
    await echoError(
      denops,
      `Unexpected throwing in ${kind}-${name}: ${error}`,
    );
  }
}
