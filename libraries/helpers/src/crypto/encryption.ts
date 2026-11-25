import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
function encryptionSecret() {
  const key = process.env.ENCRYPTION_SECRET;
  if (!key || key.length < 32) throw new Error("Set ENCRYPTION_SECRET to at least 32 characters");
  return key;
}

export class EncryptionHelper {
  static encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash("sha256").update(encryptionSecret()).digest();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  static decrypt(cipherText: string): string {
    try {
      const [ivHex, authTagHex, encryptedData] = cipherText.split(":");
      if (!ivHex || !authTagHex || !encryptedData) throw new Error("Invalid encrypted token");

      const key = crypto.createHash("sha256").update(encryptionSecret()).digest();
      const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
      decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      throw new Error("Invalid encrypted token");
    }
  }
}

