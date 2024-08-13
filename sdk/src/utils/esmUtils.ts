import path from "path";
import { fileURLToPath } from "url";

// add import.meta.url to filePath
export function __dirname(importMeta: ImportMeta) {
  const __filename = fileURLToPath(importMeta.url);
  return path.dirname(__filename);
}

export function resolvePath(importMeta: ImportMeta, relativePath: string) {
  return path.resolve(__dirname(importMeta), relativePath);
}
