import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "../crypto";

describe("Crypto — AES-256-GCM encryption", () => {
  beforeAll(() => {
    // Set a test encryption key (32 bytes = 64 hex chars)
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  describe("encrypt", () => {
    it("should return encrypted, iv, and tag fields", () => {
      const result = encrypt("test-api-key-12345");
      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.tag).toBeDefined();
      expect(typeof result.encrypted).toBe("string");
      expect(typeof result.iv).toBe("string");
      expect(typeof result.tag).toBe("string");
    });

    it("should produce different ciphertexts for same plaintext (random IV)", () => {
      const result1 = encrypt("same-key");
      const result2 = encrypt("same-key");
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it("should produce hex strings", () => {
      const result = encrypt("test");
      expect(result.encrypted).toMatch(/^[0-9a-f]+$/);
      expect(result.iv).toMatch(/^[0-9a-f]+$/);
      expect(result.tag).toMatch(/^[0-9a-f]+$/);
    });

    it("should produce 24-char IV (12 bytes in hex)", () => {
      const result = encrypt("test");
      expect(result.iv.length).toBe(24);
    });

    it("should produce 32-char tag (16 bytes in hex)", () => {
      const result = encrypt("test");
      expect(result.tag.length).toBe(32);
    });
  });

  describe("decrypt", () => {
    it("should round-trip encrypt/decrypt correctly", () => {
      const plaintext = "AIzaSyB-test-key-12345";
      const { encrypted, iv, tag } = encrypt(plaintext);
      const decrypted = decrypt(encrypted, iv, tag);
      expect(decrypted).toBe(plaintext);
    });

    it("should handle empty string", () => {
      const { encrypted, iv, tag } = encrypt("");
      const decrypted = decrypt(encrypted, iv, tag);
      expect(decrypted).toBe("");
    });

    it("should handle long API keys", () => {
      const longKey = "A".repeat(500);
      const { encrypted, iv, tag } = encrypt(longKey);
      const decrypted = decrypt(encrypted, iv, tag);
      expect(decrypted).toBe(longKey);
    });

    it("should handle special characters", () => {
      const key = "key-with-special-chars!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const { encrypted, iv, tag } = encrypt(key);
      const decrypted = decrypt(encrypted, iv, tag);
      expect(decrypted).toBe(key);
    });

    it("should throw on tampered ciphertext", () => {
      const { encrypted, iv, tag } = encrypt("test-key");
      const tampered = "ff" + encrypted.slice(2);
      expect(() => decrypt(tampered, iv, tag)).toThrow();
    });

    it("should throw on tampered IV", () => {
      const { encrypted, iv, tag } = encrypt("test-key");
      const tampered = "ff" + iv.slice(2);
      expect(() => decrypt(encrypted, tampered, tag)).toThrow();
    });

    it("should throw on tampered tag", () => {
      const { encrypted, iv, tag } = encrypt("test-key");
      const tampered = "ff" + tag.slice(2);
      expect(() => decrypt(encrypted, iv, tampered)).toThrow();
    });
  });

  describe("ENCRYPTION_KEY validation", () => {
    it("should throw if ENCRYPTION_KEY is not set", () => {
      const original = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;
      expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
      process.env.ENCRYPTION_KEY = original;
    });

    it("should throw if ENCRYPTION_KEY is wrong length", () => {
      const original = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = "too-short";
      expect(() => encrypt("test")).toThrow("64 hex characters");
      process.env.ENCRYPTION_KEY = original;
    });
  });
});
