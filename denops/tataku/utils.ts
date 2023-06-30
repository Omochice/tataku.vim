import { Denops, is } from "./deps.ts";
import { Kind } from "./types.ts";
import { Collector, Emitter, Processor } from "./interface.ts";

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
): x is T {
  return is.ObjectOf({
    run: is.OneOf([is.Function, isAsyncFunction]),
  })(x);
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
