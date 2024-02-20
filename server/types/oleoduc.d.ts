import { Readable, Transform, Writable } from "node:stream";

declare module "oleoduc" {
  export function compose<I extends Readable | Transform, O extends Writable | Transform>(
    ...streams: [I, ...Transform[], O]
  ): I & O;
}
