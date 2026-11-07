import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_SECRET || "reerts-super-secure-secret-key-32b!"; // 32 bytes

export class EncryptionHelper {
  static encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  static decrypt(cipherText: string): string {
    try {
      const [ivHex, authTagHex, encryptedData] = cipherText.split(":");
      if (!ivHex || !authTagHex || !encryptedData) return cipherText;

      const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
      const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
      decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return cipherText;
    }
  }
}

