import CryptoJS from "crypto-js";

// Use EXPO_PUBLIC prefix for Expo environment variables
const SECRET_KEY = process.env.EXPO_PUBLIC_SECRET_KEY || "aB3@kL2%nO5!fs4pQ8";
const SALT = "KasuwarZamani";

export const encryptData = (data: any) => {
  try {
    const stringToEncrypt = typeof data === "object" ? JSON.stringify(data) : String(data);

    const key = CryptoJS.PBKDF2(SECRET_KEY, SALT, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    const encrypted = CryptoJS.AES.encrypt(stringToEncrypt, key.toString());
    return encrypted.toString();
  } catch (error) {
    return null;
  }
};

export const decryptData = (encryptedString: string | null) => {
  try {
    if (!encryptedString) {
      return null;
    }

    const key = CryptoJS.PBKDF2(SECRET_KEY, SALT, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    const decrypted = CryptoJS.AES.decrypt(encryptedString, key.toString());
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    return null;
  }
};
