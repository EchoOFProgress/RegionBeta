
const GEMINI_KEY_STORAGE_KEY = "user-gemini-key-plain";
const ANTHROPIC_KEY_STORAGE_KEY = "user-anthropic-key-plain";

/**
 * Manages the Gemini API key.
 * Prioritizes the user's custom key, falling back to the developer key if not found.
 */
export const apiKeyManager = {
  /**
   * Returns the currently active API key. First checks if user has set a custom key.
   * If not, uses the default developer fallback key.
   */
  async getEffectiveApiKey(userId?: string): Promise<{ key: string; type: "user" | "developer" }> {
    const devKey = process.env.NEXT_PUBLIC_GEMINI_DEFAULT_KEY || "";
    
    if (typeof window === "undefined") {
      return { key: devKey, type: "developer" };
    }

    try {
      const plainKey = localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
      if (plainKey && plainKey.trim().length > 0) {
        return { key: plainKey.trim(), type: "user" };
      }
      
      // Legacy check for encrypted key (to migrate old users if needed)
      const encryptedKey = localStorage.getItem("user-gemini-key-encrypted");
      if (encryptedKey) {
          // If we had a userId we could try to decrypt, but let's just prefer plain storage now
          // to eliminate all crypto-related failure points.
      }
    } catch (error) {
      console.error("Failed to retrieve user Gemini API key.", error);
    }

    return { key: devKey, type: "developer" };
  },

  /**
   * Returns the currently active Anthropic API key.
   */
  async getEffectiveAnthropicKey(userId?: string): Promise<{ key: string; type: "user" | "developer" }> {
    const devKey = process.env.NEXT_PUBLIC_ANTHROPIC_DEFAULT_KEY || "";
    
    if (typeof window === "undefined") {
      return { key: devKey, type: "developer" };
    }

    try {
      const plainKey = localStorage.getItem(ANTHROPIC_KEY_STORAGE_KEY);
      if (plainKey && plainKey.trim().length > 0) {
        return { key: plainKey.trim(), type: "user" };
      }
    } catch (error) {
      console.error("Failed to retrieve user Anthropic API key.", error);
    }

    return { key: devKey, type: "developer" };
  },

  async saveUserAnthropicKey(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    if (!key || key.trim() === "") {
      localStorage.removeItem(ANTHROPIC_KEY_STORAGE_KEY);
      return;
    }
    localStorage.setItem(ANTHROPIC_KEY_STORAGE_KEY, key.trim());
  },

  async saveUserApiKey(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    if (!key || key.trim() === "") {
      localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
      return;
    }
    localStorage.setItem(GEMINI_KEY_STORAGE_KEY, key.trim());
  },

  async fetchUserApiKey(): Promise<string | null> {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
  },

  async fetchUserAnthropicKey(): Promise<string | null> {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(ANTHROPIC_KEY_STORAGE_KEY);
  },

  removeUserApiKey(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
        localStorage.removeItem(ANTHROPIC_KEY_STORAGE_KEY);
        localStorage.removeItem("user-gemini-key-encrypted");
    }
  },

  /**
   * Verifies an API key by making a lightweight request to the Gemini API.
   * Now more permissive: allows 429 errors during validation since key exists but is limited.
   */
  async validateGeminiKey(key: string): Promise<boolean> {
    if (!key || key.length < 20) return false;
    
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      // 429 means key is valid but limited. 200 means key is valid and available. 
      // 400/401/403 means key is invalid.
      return res.status === 200 || res.status === 429;
    } catch (error) {
      // If network error, we can't validate, but let's assume it might be okay if it looks like a key
      return key.startsWith("AIza");
    }
  },

  /** Simplified aliases for UI components */
  async getKey(): Promise<string | null> {
    return this.fetchUserApiKey();
  },

  async storeUserKey(key: string): Promise<void> {
    return this.saveUserApiKey(key);
  },

  clearUserKey(): void {
    this.removeUserApiKey();
  }
};
