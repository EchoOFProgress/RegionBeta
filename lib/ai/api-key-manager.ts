import { encryptApiKey, decryptApiKey } from "./crypto";

const GEMINI_KEY_STORAGE_KEY = "user-gemini-key-encrypted";
const ANTHROPIC_KEY_STORAGE_KEY = "user-anthropic-key-encrypted";

/**
 * Manages the Gemini API key.
 * Prioritizes the user's custom key, falling back to the developer key if not found.
 */
export const apiKeyManager = {
  /**
   * Returns the currently active API key. First checks if user has set a custom key.
   * If not, uses the default developer fallback key.
   * @param userId The current user's Google ID (required for decryption)
   */
  async getEffectiveApiKey(userId?: string): Promise<{ key: string; type: "user" | "developer" }> {
    const devKey = process.env.NEXT_PUBLIC_GEMINI_DEFAULT_KEY || "";
    
    if (!userId || typeof window === "undefined") {
      return { key: devKey, type: "developer" };
    }

    try {
      const encryptedKey = localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
      if (encryptedKey) {
        const decrypted = await decryptApiKey(encryptedKey, userId);
        if (decrypted && decrypted.trim().length > 0) {
          return { key: decrypted, type: "user" };
        }
      }
    } catch (error) {
      console.error("Failed to decrypt user Gemini API key, falling back to dev key.", error);
    }

    return { key: devKey, type: "developer" };
  },

  /**
   * Returns the currently active Anthropic API key.
   */
  async getEffectiveAnthropicKey(userId?: string): Promise<{ key: string; type: "user" | "developer" }> {
    const devKey = process.env.NEXT_PUBLIC_ANTHROPIC_DEFAULT_KEY || "";
    
    if (!userId || typeof window === "undefined") {
      return { key: devKey, type: "developer" };
    }

    try {
      const encryptedKey = localStorage.getItem(ANTHROPIC_KEY_STORAGE_KEY);
      if (encryptedKey) {
        const decrypted = await decryptApiKey(encryptedKey, userId);
        if (decrypted && decrypted.trim().length > 0) {
          return { key: decrypted, type: "user" };
        }
      }
    } catch (error) {
      console.error("Failed to decrypt user Anthropic API key, falling back to dev key.", error);
    }

    return { key: devKey, type: "developer" };
  },

  /**
   * Saves the user's custom Anthropic API key.
   */
  async saveUserAnthropicKey(key: string, userId: string): Promise<void> {
    if (typeof window === "undefined") return;
    
    if (!key || key.trim() === "") {
      localStorage.removeItem(ANTHROPIC_KEY_STORAGE_KEY);
      return;
    }

    try {
      const encrypted = await encryptApiKey(key.trim(), userId);
      localStorage.setItem(ANTHROPIC_KEY_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error("Failed to save encrypted Anthropic API key.", error);
      throw new Error("Failed to save API key securely.");
    }
  },

  /**
   * Saves the user's custom API key.
   * Encrypts it before storing in localStorage using the user's Google ID as password.
   */
  async saveUserApiKey(key: string, userId: string): Promise<void> {
    if (typeof window === "undefined") return;
    
    if (!key || key.trim() === "") {
      localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
      return;
    }

    try {
      const encrypted = await encryptApiKey(key.trim(), userId);
      localStorage.setItem(GEMINI_KEY_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error("Failed to save encrypted Gemini API key.", error);
      throw new Error("Failed to save API key securely.");
    }
  },

  /** Look up if the user has a custom API key set (and decodes it). Useful for Settings pane. */
  async fetchUserApiKey(userId: string): Promise<string | null> {
      if (typeof window === "undefined") return null;
      try {
        const encryptedKey = localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
        if (encryptedKey) {
            return await decryptApiKey(encryptedKey, userId);
        }
      } catch (error) {
        return null;
      }
      return null;
  },

  async fetchUserAnthropicKey(userId: string): Promise<string | null> {
      if (typeof window === "undefined") return null;
      try {
        const encryptedKey = localStorage.getItem(ANTHROPIC_KEY_STORAGE_KEY);
        if (encryptedKey) {
            return await decryptApiKey(encryptedKey, userId);
        }
      } catch (error) {
        return null;
      }
      return null;
  },

  removeUserApiKey(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
        localStorage.removeItem(ANTHROPIC_KEY_STORAGE_KEY);
    }
  },

  /**
   * Verifies an API key by making a lightweight request to the Gemini API.
   * Calls get_models to check if key is valid.
   */
  async validateGeminiKey(key: string): Promise<boolean> {
    if (!key) return false;
    
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      return res.ok;
    } catch (error) {
      return false;
    }
  },

  /** Simplified aliases for UI components */
  async getKey(): Promise<string | null> {
    return this.fetchUserApiKey("anonymous-local-user");
  },

  async storeUserKey(key: string): Promise<void> {
    return this.saveUserApiKey(key, "anonymous-local-user");
  },

  clearUserKey(): void {
    this.removeUserApiKey();
  }
};
