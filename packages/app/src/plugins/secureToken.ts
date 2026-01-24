import { registerPlugin } from "@capacitor/core";

export interface SecureTokenPlugin {
  setToken(options: { token: string }): Promise<void>;
  getToken(): Promise<{ token?: string | null }>;
  clearToken(): Promise<void>;
}

export const SecureToken = registerPlugin<SecureTokenPlugin>("SecureToken");
