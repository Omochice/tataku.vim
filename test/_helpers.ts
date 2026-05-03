import type { Denops } from "jsr:@denops/std@8.2.0";
import { fromFileUrl, join } from "jsr:@std/path@1.1.4";

const FIXTURES_DIR = fromFileUrl(import.meta.resolve("./fixtures"));

export type Kind = "collector" | "processor" | "emitter";

/**
 * Copy a file from `test/fixtures/{fixtureRelPath}` into
 * `{rtpRoot}/denops/@tataku/{kind}/{name}.ts`.
 *
 * @returns Absolute path of the written file.
 */
export async function copyFixture(
  fixtureRelPath: string,
  rtpRoot: string,
  kind: Kind,
  name: string,
): Promise<string> {
  const sourcePath = join(FIXTURES_DIR, fixtureRelPath);
  const destDir = join(rtpRoot, "denops", "@tataku", kind);
  await Deno.mkdir(destDir, { recursive: true });
  const destFile = join(destDir, `${name}.ts`);
  await Deno.copyFile(sourcePath, destFile);
  return destFile;
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
