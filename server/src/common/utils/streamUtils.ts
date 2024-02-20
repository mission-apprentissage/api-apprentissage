import { Transform } from "node:stream";

import { compose, transformData } from "oleoduc";
import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";

type Options = {
  size: number;
};

export function createBatchTransformStream(opts: Options): Transform {
  let currentBatch: unknown[] = [];

  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      currentBatch.push(chunk);

      if (currentBatch.length >= opts.size) {
        this.push(currentBatch);
        currentBatch = [];
      }

      callback();
    },
    flush(callback) {
      if (currentBatch.length > 0) {
        this.push(currentBatch);
      }
      callback();
    },
  });
}

export function createJsonLineTransformStream() {
  return compose(
    streamJson.parser(),
    streamers.streamArray(),
    transformData((data: { value: unknown }) => data.value)
  );
}
