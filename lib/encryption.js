import CryptoJS from "crypto-js";

// It's crucial to use an environment variable for the secret key in production.
// The key should be a long, random string.
const SECRET_KEY =
  process.env.NEXT_PUBLIC_SECRET_KEY || "your-default-secret-key-for-dev";
const SALT = "KasuwarZamani"; // Optional salt for additional security

export const encryptData = (data) => {
  try {
    // Convert data to string if it's an object
    const stringToEncrypt =
      typeof data === "object" ? JSON.stringify(data) : String(data);

    // Create key and IV
    const key = CryptoJS.PBKDF2(SECRET_KEY, SALT, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(stringToEncrypt, key.toString());
    return encrypted.toString();
  } catch (error) {
    return null;
  }
};

export const decryptData = (encryptedString) => {
  try {
    if (!encryptedString) {
      return null;
    }

    // Recreate key
    const key = CryptoJS.PBKDF2(SECRET_KEY, SALT, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedString, key.toString());
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    // Try parsing as JSON, return as is if not JSON
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    return null;
  }
};
