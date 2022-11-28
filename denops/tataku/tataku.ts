import {
  Denops,
  ensureArray,
  err,
  fn,
  isString,
  ok,
  op,
  Result,
  toFileUrl,
} from "./deps.ts";
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
  Result<T, Error>
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
    return err(e);
  }
  if (founds.length > 1) {
    // module should have uniq name
    const e = new Error(`${expectedPath} found duplicatedly: ${founds}`);
    return err(e);
  }

  const { default: loaded } = await import(toFileUrl(founds[0]).href);

  const constructed = new loaded(option);

  if (!isTatakuModule<T>(constructed)) {
    // module should have "run" property
    const e = new Error(
      `Module of ${expectedPath} must have "run" function.`,
    );
    return err(e);
  }
  return ok(constructed);
}

export async function collect(
  denops: Denops,
  name: string,
  option: Record<string, unknown>,
): Promise<Result<string[], unknown>> {
  const result = await loadTatakuModule<Collector>(
    denops,
    {
      kind: "collector",
      name: name,
    },
    option,
  );

  if (result.isErr()) {
    return err(result.error);
  }

  try {
    return ok(await result.value.run(denops));
  } catch (e: unknown) {
    return err(e);
  }
}

export async function process(
  denops: Denops,
  name: string,
  option: Record<string, unknown>,
  source: string[],
): Promise<Result<string[], unknown>> {
  const result = await loadTatakuModule<Processor>(
    denops,
    {
      kind: "processor",
      name: name,
    },
    option,
  );

  if (result.isErr()) {
    return err(result.error);
  }

  try {
    return ok(await result.value.run(denops, source));
  } catch (e: unknown) {
    return err(e);
  }
}

export async function emit(
  denops: Denops,
  name: string,
  option: Record<string, unknown>,
  source: string[],
): Promise<Result<undefined, unknown>> {
  const result = await loadTatakuModule<Emitter>(
    denops,
    {
      kind: "emitter",
      name: name,
    },
    option,
  );

  if (result.isErr()) {
    return err(result.error);
  }

  try {
    await result.value.run(denops, source);
    return ok(undefined);
  } catch (e) {
    return err(e);
  }
}
