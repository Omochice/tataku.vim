import type { Denops } from "jsr:@denops/std@7.0.0";
import { is } from "jsr:@core/unknownutil@3.18.1";

const isOption = is.ObjectOf({
  selected: is.ArrayOf(is.String),
});

const collector = (_: Denops, options: unknown) => {
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
