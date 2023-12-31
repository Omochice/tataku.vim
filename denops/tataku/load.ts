import {
  Denops,
  errAsync,
  fn,
  is,
  join,
  okAsync,
  op,
  ResultAsync,
  toFileUrl,
} from "./deps.ts";
import { Collector, Emitter, Processor } from "./types.ts";

type Kind = "collector" | "processor" | "emitter";

type Query = {
  kind: Kind;
  name: string;
};

type Factory<T> = (denops: Denops, options: unknown) => T;

function search(
  denops: Denops,
  query: Query,
): ResultAsync<URL, Error> {
  const expectedPath = join(
    "denops",
    "@tataku",
    query.kind,
    `${query.name}.ts`,
  );
  return ResultAsync.fromSafePromise(op.runtimepath.getGlobal(denops))
    .andThen((rtp: unknown) =>
      ResultAsync.fromSafePromise(
        fn.globpath(
          denops,
          rtp,
          expectedPath,
          false,
          true,
        ),
      )
    ).andThen((founds: unknown) => {
      if (!is.ArrayOf(is.String)(founds)) {
        return errAsync(
          new Error(
            `globpath must return array of string: ${JSON.stringify(founds)}`,
          ),
        );
      }
      if (founds.length === 0) {
        return errAsync(new Error(`${expectedPath} is not found in rtp...`));
      }
      if (founds.length !== 1) {
        return errAsync(
          new Error(
            `path(${expectedPath}) is found multiply: ${
              JSON.stringify(founds)
            }}`,
          ),
        );
      }
      return okAsync(toFileUrl(founds[0]));
    });
}

export function loadCollector(
  denops: Denops,
  name: string,
): ResultAsync<Factory<Collector>, Error> {
  return search(denops, { kind: "collector", name })
    .andThen((path) => {
      return ResultAsync.fromSafePromise(
        import(path.href).then((e) => e.default),
      );
    })
    .andThen((factory: unknown) => {
      if (!is.Function(factory) && !is.AsyncFunction(factory)) {
        return errAsync(new Error(`loading collector(${name}) is failed.`));
      }
      return okAsync(factory as Factory<Collector>);
    });
}

export function loadProcessor(
  denops: Denops,
  name: string,
): ResultAsync<Factory<Processor>, Error> {
  return search(denops, { kind: "processor", name })
    .andThen((path) => {
      return ResultAsync.fromSafePromise(
        import(path.href).then((e) => e.default),
      );
    })
    .andThen((factory: unknown) => {
      if (!is.Function(factory) && !is.AsyncFunction(factory)) {
        return errAsync(new Error(`loading processor(${name}) is failed.`));
      }
      return okAsync(factory as Factory<Processor>);
    });
}

export function loadEmitter(
  denops: Denops,
  name: string,
): ResultAsync<Factory<Emitter>, Error> {
  return search(denops, { kind: "emitter", name })
    .andThen((path) => {
      return ResultAsync.fromSafePromise(
        import(path.href).then((e) => e.default),
      );
    })
    .andThen((factory: unknown) => {
      if (!is.Function(factory) && !is.AsyncFunction(factory)) {
        return errAsync(new Error(`loading emitter(${name}) is failed.`));
      }
      return okAsync(factory as Factory<Emitter>);
    });
}
