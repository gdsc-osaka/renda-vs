import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

void setPersistence(auth, browserLocalPersistence);

if (import.meta.env.VITE_USE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectDatabaseEmulator(db, "127.0.0.1", 9000);
}

export const GAME_ID = "main";
export const COUNTDOWN_MS_DEFAULT = 5000;
export const REVEAL_HIDE_MS_DEFAULT = 5000;
export const DURATION_SEC_DEFAULT = 20;
export const AUTO_CLICK_THRESHOLD = 20;
