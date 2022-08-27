import { Denops, ensureArray, fn, isString, op, toFileUrl } from "./deps.ts";

import { isTatakuModule } from "./utils.ts";

import { Query, TatakuModule } from "./types.ts";

export async function loadTatakuModule(
  denops: Denops,
  query: Query,
): Promise<
  [TatakuModule, null] | [null, Error]
> {
  const expectedPath = `@tataku/${query.type}/${query.name}.ts`;
  const founds = ensureArray(
    await fn.globpath(
      denops,
      await op.runtimepath.getGlobal(denops),
      expectedPath,
      false,
      true,
    ),
    isString,
  );

  if (founds.length === 0) {
    const e = new Error(`${expectedPath} is not included in &runtimepath.`);
    return [null, e];
  }
  if (founds.length > 1) {
    // module should have uniq name
    const e = new Error(`${expectedPath} found duplicatedly: ${founds}`);
    return [null, e];
  }

  const loaded = await import(toFileUrl(founds[0]).href);

  if (!isTatakuModule(loaded)) {
    // module should have "run" property
    const e = new Error(
      `Module of ${expectedPath} must have "run" function.`,
    );
    return [null, e];
  }
  return [loaded, null];
}
