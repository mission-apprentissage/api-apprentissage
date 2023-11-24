import { internal } from "@hapi/boom";
import crypto from "crypto";

export function generateKey(size = 32, format: BufferEncoding = "base64") {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

export function generateSecretHash(key: string) {
  const salt = crypto.randomBytes(8).toString("hex");
  const buffer = crypto.scryptSync(key, salt, 64);
  return `${buffer.toString("hex")}.${salt}`;
}

export function compareKeys(storedKey: string, suppliedKey: string) {
  const [hashedPassword, salt] = storedKey.split(".");

  if (!hashedPassword || !salt) {
    throw internal("compareKeys: invalid storedKey");
  }

  const buffer = crypto.scryptSync(suppliedKey, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer);
}

// USAGE
// const key = generateKey(); // send to user: Jj0fmQUis7xKJ6oge4r1fN4em7xJ+hILrgubKlG6PLA=
// const secretHash = generateSecretHash(key); // save in db: c10c7e79fc496144ee245d9dcbe52d9d3910c2a514af1cfe8afda9ea655815efed5bd2a793b31bf923fe47d212bab7896cd527c720849678077e34cdd6fec0a2.2f717b397644fdcc
// VERIF => compareKeys(secretHash, key)
