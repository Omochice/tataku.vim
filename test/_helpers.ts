import type { Denops } from "jsr:@denops/std@8.2.0";
import { join } from "jsr:@std/path@1.1.4";

export type Kind = "collector" | "processor" | "emitter";

/**
 * Write a fixture module under `{rtpRoot}/denops/@tataku/{kind}/{name}.ts`.
 *
 * @returns Absolute path of the written file.
 */
export async function writeFixture(
  rtpRoot: string,
  kind: Kind,
  name: string,
  source: string,
): Promise<string> {
  const dir = join(rtpRoot, "denops", "@tataku", kind);
  await Deno.mkdir(dir, { recursive: true });
  const file = join(dir, `${name}.ts`);
  await Deno.writeTextFile(file, source);
  return file;
}

/**
 * Append `path` to Vim/Neovim's global `&runtimepath`.
 *
 * Uses `fnameescape` to tolerate paths with spaces or special characters.
 */
export async function addRuntimepath(
  denops: Denops,
  path: string,
): Promise<void> {
  const escaped = await denops.call("fnameescape", path) as string;
  await denops.cmd(`set runtimepath+=${escaped}`);
}

/**
 * Resolve when `predicate` returns truthy; reject when `timeout` elapses.
 *
 * @param options.timeout Total timeout in milliseconds. Default 5000.
 * @param options.interval Polling interval in milliseconds. Default 100.
 */
export async function waitFor(
  predicate: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {},
): Promise<void> {
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 100;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`waitFor: timeout after ${timeout}ms`);
}
