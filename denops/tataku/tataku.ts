import { Denops, ensureArray, fn, isString, op, toFileUrl } from "./deps.ts";
import { isTatakuModule } from "./utils.ts";
import { Query } from "./types.ts";
import { Collector, Emitter, Processor } from "./interface.ts";

export async function loadTatakuModule<
  T extends Collector | Processor | Emitter,
>(
  denops: Denops,
  query: Query,
  option: Record<string, unknown>,
): Promise<
  [T, undefined] | [undefined, Error]
> {
  const expectedPath = `denops/@tataku/${query.kind}/${query.name}.ts`;
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
    return [undefined, e];
  }
  if (founds.length > 1) {
    // module should have uniq name
    const e = new Error(`${expectedPath} found duplicatedly: ${founds}`);
    return [undefined, e];
  }

  const { default: loaded } = await import(toFileUrl(founds[0]).href);

  const constructed = new loaded(option);

  if (!isTatakuModule<T>(constructed)) {
    // module should have "run" property
    const e = new Error(
      `Module of ${expectedPath} must have "run" function.`,
    );
    return [undefined, e];
  }
  return [constructed, undefined];
}

export async function collect(
  denops: Denops,
  name: string,
  option: Record<string, unknown>,
): Promise<string[]> {
  const [collector, err] = await loadTatakuModule<Collector>(
    denops,
    {
      kind: "collector",
      name: name,
    },
    option,
  );

  if (err !== undefined) {
    throw err;
  }

  try {
    return await collector.run(denops);
  } catch (e) {
    throw e;
  }
}

export async function process(
  denops: Denops,
  name: string,
  option: Record<string, unknown>,
  source: string[],
): Promise<string[]> {
  const [processor, err] = await loadTatakuModule<Processor>(
    denops,
    {
      kind: "processor",
      name: name,
    },
    option,
  );
  if (err !== undefined) {
    throw err;
  }

  try {
    return processor.run(denops, source);
  } catch (e) {
    throw e;
  }
}

export async function emit(
  denops: Denops,
  name: string,
  option: Record<string, unknown>,
  source: string[],
): Promise<void | Error> {
  const [emitter, err] = await loadTatakuModule<Emitter>(
    denops,
    {
      kind: "emitter",
      name: name,
    },
    option,
  );

  if (err !== undefined) {
    throw err;
  }

  try {
    await emitter.run(denops, source);
  } catch (e) {
    return e;
  }
}
