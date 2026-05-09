import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebase";

const HOST_FLAG_KEY = "renda-vs:host-authenticated";

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyHostPassword(password: string): Promise<boolean> {
  const salt = import.meta.env.VITE_HOST_PASSWORD_SALT;
  const expected = import.meta.env.VITE_HOST_PASSWORD_HASH;
  if (!salt || !expected) {
    throw new Error("ホストパスワードが未設定です。.env を確認してください。");
  }
  const got = await sha256Hex(salt + password);
  return got === expected;
}

export async function ensureAnonymousAuth(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

export function markHostSession() {
  sessionStorage.setItem(HOST_FLAG_KEY, "1");
}

export function isHostSession(): boolean {
  return sessionStorage.getItem(HOST_FLAG_KEY) === "1";
}

export function clearHostSession() {
  sessionStorage.removeItem(HOST_FLAG_KEY);
}
