export default (): ReadableStream<string[]> =>
  new ReadableStream<string[]>({
    start(controller) {
      controller.enqueue(["hello", "world"]);
      controller.close();
    },
  });
