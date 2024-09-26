import type { Denops } from "jsr:@denops/std@7.2.0";
import { is } from "jsr:@core/unknownutil@4.3.0";
import type { CollectorFactory } from "../../tataku/export.ts";

const isOption = is.ObjectOf({
  selected: is.ArrayOf(is.String),
});

const collector: CollectorFactory = (_: Denops, options: unknown) => {
  if (!isOption(options)) {
    throw new Error(
      `:Internal error: options is invalid ${JSON.stringify(options)}`,
    );
  }
  return new ReadableStream<string[]>({
    start: (controller) => {
      controller.enqueue(options.selected);
    },
  });
};

export default collector;
