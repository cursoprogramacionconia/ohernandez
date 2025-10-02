import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("La contraseña no puede estar vacía.");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${Buffer.from(derivedKey).toString("hex")}`;
}

export async function verifyPassword(password, hashedPassword) {
  if (!hashedPassword) {
    return false;
  }

  const [salt, key] = hashedPassword.split(":");
  if (!salt || !key) {
    return false;
  }

  try {
    const derivedKey = await scrypt(password, salt, KEY_LENGTH);
    const derivedBuffer = Buffer.from(derivedKey);
    const keyBuffer = Buffer.from(key, "hex");

    if (derivedBuffer.length !== keyBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedBuffer, keyBuffer);
  } catch (error) {
    console.error("Error verificando contraseña:", error);
    return false;
  }
}
