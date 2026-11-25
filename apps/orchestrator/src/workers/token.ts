import { createHash, createDecipheriv } from "node:crypto";

// Meta OAuth uses a 12-byte IV; older channel connections use a 16-byte IV.
export function openChannelToken(value: string | null) {
  if (!value) throw new Error("Channel disconnected");
  const [iv, second, third] = value.split(":");
  const meta = iv.length === 24;
  const secret = process.env.ENCRYPTION_SECRET || (meta && process.env.BETTER_AUTH_SECRET ? "meta-oauth:" + process.env.BETTER_AUTH_SECRET : "");
  if (secret.length < 32 || !third) throw new Error("Reconnect the channel and configure token encryption");
  const decipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(meta ? third : second, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(meta ? second : third, "hex")), decipher.final()]).toString();
}

