import {
  Denops,
  Err,
  fn,
  isArray,
  isString,
  join,
  Ok,
  op,
  Result,
  toFileUrl,
} from "./deps.ts";
import { Collector, Emitter, Processor } from "./types.ts";

type Kind = "collector" | "processor" | "emitter";

type Query = {
  kind: Kind;
  name: string;
};

type Factory<T> = (denops: Denops, options: unknown) => T;

async function search(
  denops: Denops,
  query: Query,
): Promise<Result<URL, Error>> {
  const expectedPath = join(
    "denops",
    "@tataku",
    query.kind,
    `${query.name}.ts`,
  );
  const founds = await fn.globpath(
    denops,
    await op.runtimepath.getGlobal(denops),
    expectedPath,
    false,
    true,
  ) as unknown;
  if (!isArray(founds) || founds.length === 0) {
    return Err(new Error(`${expectedPath} is not found in rtp...`));
  }
  if (founds.length !== 1) {
    return Err(
      new Error(
        `path(${expectedPath}) is found multiply: ${JSON.stringify(founds)}}`,
      ),
    );
  }
  if (!isString(founds[0])) {
    return Err(new Error(`:Internal error: path is not string: ${founds[0]}`));
  }
  return Ok(toFileUrl(founds[0]));
}

export async function loadCollector(
  denops: Denops,
  name: string,
): Promise<Result<Factory<Collector>, Error>> {
  const result = await search(denops, { kind: "collector", name });
  if (result.isErr()) {
    return Err(result.unwrapErr());
  }
  return (await import(result.unwrap().href)).default;
}

export async function loadProcessor(
  denops: Denops,
  name: string,
): Promise<Result<Factory<Processor>, Error>> {
  const result = await search(denops, { kind: "processor", name });
  if (result.isErr()) {
    return Err(result.unwrapErr());
  }
  return (await import(result.unwrap().href)).default;
}

export async function loadEmitter(
  denops: Denops,
  name: string,
): Promise<Result<Factory<Emitter>, Error>> {
  const result = await search(denops, { kind: "emitter", name });
  if (result.isErr()) {
    return Err(result.unwrapErr());
  }
  return (await import(result.unwrap().href)).default;
}
