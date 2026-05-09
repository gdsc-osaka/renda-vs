import { onValue, ref } from "firebase/database";
import { db } from "./firebase";

let offsetMs = 0;
let initialized = false;

export function initServerTimeOffset() {
  if (initialized) return;
  initialized = true;
  const offsetRef = ref(db, ".info/serverTimeOffset");
  onValue(offsetRef, (snap) => {
    const val = snap.val();
    if (typeof val === "number") offsetMs = val;
  });
}

export function serverNow(): number {
  return Date.now() + offsetMs;
}
