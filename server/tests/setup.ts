import { config } from "dotenv";

config({
  path: "./server/.env.test",
  quiet: process.env.NODE_ENV === "test",
});
