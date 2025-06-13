import path from "path";
import { __dirname } from "api-alternance-sdk/internal";

export function getStaticDirPath(): string {
  // tsup build project into a single file to dist/index.js
  // Hence import.meta.url references dist/index.js
  if (process.env.IS_BUILT === "true") {
    return path.join(__dirname(import.meta), "../static");
  }

  // When ran directly from source code with tsx or jest
  // Then files are not compiled into a single file
  return path.join(__dirname(import.meta), "../static");
}

export function getStaticFilePath(relativeFilename: string): string {
  return path.join(getStaticDirPath(), relativeFilename);
}
