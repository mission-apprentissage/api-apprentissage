import crypto from "crypto";
import { internal } from "@hapi/boom";

export function generateKey(size = 32, format: BufferEncoding = "base64") {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

export function compareKeys(storedKey: string, suppliedKey: string) {
  const [hashedPassword, salt] = storedKey.split(".");

  if (!hashedPassword || !salt) {
    throw internal("compareKeys: invalid storedKey");
  }

  const buffer = crypto.scryptSync(suppliedKey, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer);
}
