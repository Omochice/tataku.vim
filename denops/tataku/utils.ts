import { Denops } from "./deps.ts";
import { Kind } from "./types.ts";

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
): Promise<void> {
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
