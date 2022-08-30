import { Denops, ensureArray, fn, isString, op, toFileUrl } from "./deps.ts";
import { isTatakuModule } from "./utils.ts";
import { Collector, Emitter, Processor, Query, TatakuModule } from "./types.ts";

export async function loadTatakuModule(
  denops: Denops,
  query: Query,
): Promise<
  [TatakuModule, null] | [null, Error]
> {
  const expectedPath = `@tataku/${query.kind}/${query.name}.ts`;
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

export async function collect(
  denops: Denops,
  name: string,
  options: Record<string, unknown>,
): Promise<string[]> {
  const [collector, err] = await loadTatakuModule(denops, {
    kind: "collector",
    name: name,
  });

  if (err !== null) {
    throw err;
  }

  try {
    return await (collector.run as Collector)(denops, options);
  } catch (e) {
    throw e;
  }
}

export async function process(
  denops: Denops,
  name: string,
  options: Record<string, unknown>,
  source: string[],
): Promise<string[]> {
  const [processor, err] = await loadTatakuModule(denops, {
    kind: "processor",
    name: name,
  });
  if (err !== null) {
    throw err;
  }

  try {
    return (processor.run as Processor)(denops, options, source);
  } catch (e) {
    throw e;
  }
}

export async function emit(
  denops: Denops,
  name: string,
  options: Record<string, unknown>,
  source: string[],
): Promise<void | Error> {
  const [emitter, err] = await loadTatakuModule(denops, {
    kind: "emitter",
    name: name,
  });

  if (err !== null) {
    throw err;
  }

  try {
    await (emitter.run as Emitter)(denops, options, source);
  } catch (e) {
    return e;
  }
}
