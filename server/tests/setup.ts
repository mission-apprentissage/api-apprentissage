import { config } from "dotenv";

config({
  path: "./server/.env.test",
});

process.on("unhandledRejection", (reason) => {
  console.log(`FAILED TO HANDLE PROMISE REJECTION`);
  console.error(reason);
  if (reason instanceof Error) console.log(reason.stack);
  throw reason;
});
