import type { Denops } from "jsr:@denops/std@7.3.0";
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
