import { $array, $object, $string, Denops } from "../../tataku/deps.ts";

const validate = $object({
  selected: $array($string),
});

const collector = (_: Denops, options: unknown) => {
  if (!validate(options)) {
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
