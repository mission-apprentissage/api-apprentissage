import { config } from "dotenv";

config({
  path: "./ui/.env.test",
  quiet: process.env.NODE_ENV === "test",
});
