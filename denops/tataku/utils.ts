import type { Denops } from "jsr:@denops/std@7.6.0";
import type { Kind } from "./types.ts";

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
  if (Error.isError(error)) {
    await echoError(
      denops,
      `Error occurred in ${kind}-${name}: ${error.message}`,
    );
  } else {
    await echoError(
      denops,
      `Unexpected throwing in ${kind}-${name}: ${error}`,
    );
  }
}

/**
 * Convert some value to Error
 *
 * @param cause Some error thing
 * @param message The message of error if using cause is not Error
 * @returns Converted error
 */
export function convertError(message = "Failed"): (e: unknown) => Error {
  return (cause) => {
    if (Error.isError(cause)) {
      return cause;
    }
    return new Error(message, { cause });
  };
}
