// encryption.ts
import crypto from "crypto";

const algorithm = "aes-256-cbc";
// On récupère la clé secrète depuis l'environnement
const secretKey = process.env.ENCRYPTION_SECRET_KEY as string;
if (!secretKey) {
  throw new Error(
    "ENCRYPTION_SECRET_KEY must be set in your environment variables",
  );
}

// Dérivation de la clé : on utilise crypto.scryptSync pour obtenir une clé de 32 octets
const key = crypto.scryptSync(secretKey, "salt", 32);

/**
 * Chiffre un texte en utilisant AES-256-CBC.
 * @param text Le texte à chiffrer.
 * @returns Le texte chiffré sous forme de "iv:encryptedText".
 */
export function encrypt(text: string): string {
  // Générer un IV unique de 16 octets
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  // Concatène l'IV et le texte chiffré, séparés par ":"
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Déchiffre un texte chiffré au format "iv:encryptedText" en utilisant AES-256-CBC.
 * @param text Le texte chiffré.
 * @returns Le texte en clair.
 */
export function decrypt(text: string): string {
  const parts = text.split(":");
  // Le premier élément est l'IV
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = parts.join(":");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
