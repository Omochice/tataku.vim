import {
  Denops,
  Err,
  fn,
  is,
  join,
  Ok,
  op,
  Result,
  toFileUrl,
} from "./deps.ts";
import { Collector, Emitter, Processor } from "./types.ts";
import { isAsyncFunction } from "./utils.ts";

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
  if (!is.ArrayOf(is.String)(founds)) {
    return Err(
      new Error(
        `globpath must return array of string: ${JSON.stringify(founds)}`,
      ),
    );
  }
  if (founds.length === 0) {
    return Err(new Error(`${expectedPath} is not found in rtp...`));
  }
  if (founds.length !== 1) {
    return Err(
      new Error(
        `path(${expectedPath}) is found multiply: ${JSON.stringify(founds)}}`,
      ),
    );
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
  const factory = (await import(result.unwrap().href)).default;
  if (!is.Function(factory) && !isAsyncFunction(factory)) {
    return Err(new Error(`loading collector(${name}) is failed.`));
  }
  return Ok(factory as Factory<Collector>);
}

export async function loadProcessor(
  denops: Denops,
  name: string,
): Promise<Result<Factory<Processor>, Error>> {
  const result = await search(denops, { kind: "processor", name });
  if (result.isErr()) {
    return Err(result.unwrapErr());
  }
  const factory = (await import(result.unwrap().href)).default;
  if (!is.Function(factory) && !isAsyncFunction(factory)) {
    return Err(new Error(`loading processor(${name}) is failed.`));
  }
  return Ok(factory as Factory<Processor>);
}

export async function loadEmitter(
  denops: Denops,
  name: string,
): Promise<Result<Factory<Emitter>, Error>> {
  const result = await search(denops, { kind: "emitter", name });
  if (result.isErr()) {
    return Err(result.unwrapErr());
  }
  const factory = (await import(result.unwrap().href)).default;
  if (!is.Function(factory) && !isAsyncFunction(factory)) {
    return Err(new Error(`loading emitter(${name}) is failed.`));
  }
  return Ok(factory as Factory<Emitter>);
}
