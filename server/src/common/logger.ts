import bunyan from "bunyan";
import PrettyStream from "bunyan-prettystream";

import config from "@/config";

const createStreams = () => {
  const { type, level } = config.log;

  if (process.env.NODE_ENV === "test") {
    return [];
  }

  const jsonStream = () => {
    return {
      name: "json",
      level,
      stream: process.stdout,
    };
  };

  const consoleStream = () => {
    const pretty = new PrettyStream();
    pretty.pipe(process.stdout);
    return {
      name: "console",
      level,
      stream: pretty,
    };
  };

  const streams = type === "console" ? [consoleStream()] : [jsonStream()];

  return streams;
};

export default bunyan.createLogger({
  name: config.productName,
  serializers: {
    ...bunyan.stdSerializers,
    err: function (err) {
      return {
        ...bunyan.stdSerializers.err(err),
        ...(err.errInfo ? { errInfo: err.errInfo } : {}),
      };
    },
  },
  /** @ts-expect-error */
  streams: createStreams(),
});
