import { Denops, is } from "../../tataku/deps.ts";

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
