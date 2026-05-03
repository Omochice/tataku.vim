type EmitterDenops = { cmd(cmd: string): Promise<void> };

export default (denops: EmitterDenops): WritableStream<string[]> =>
  new WritableStream<string[]>({
    async write(chunk) {
      const literal = "[" +
        chunk.map((s) => "'" + s.replace(/'/g, "''") + "'").join(",") +
        "]";
      await denops.cmd("let g:tataku_test_output = " + literal);
    },
  });
