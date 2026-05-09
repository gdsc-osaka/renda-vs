import { onValue, ref, set, update, remove } from "firebase/database";
import { db, GAME_ID, COUNTDOWN_MS_DEFAULT, DURATION_SEC_DEFAULT, REVEAL_HIDE_MS_DEFAULT } from "./firebase";
import { serverNow } from "./server-time";
import type { GameConfig } from "../types";

export const configRef = () => ref(db, `games/${GAME_ID}/config`);
export const teamsRef = () => ref(db, `games/${GAME_ID}/teams`);
export const playersRef = () => ref(db, `games/${GAME_ID}/players`);
export const countsRef = () => ref(db, `games/${GAME_ID}/counts`);
export const playerRef = (playerId: string) => ref(db, `games/${GAME_ID}/players/${playerId}`);
export const countRef = (playerId: string) => ref(db, `games/${GAME_ID}/counts/${playerId}`);
export const gameRootRef = () => ref(db, `games/${GAME_ID}`);

export function subscribeConfig(cb: (config: GameConfig | null) => void) {
  return onValue(configRef(), (snap) => {
    cb(snap.val() as GameConfig | null);
  });
}

export async function claimHost(uid: string) {
  await update(configRef(), {
    hostUid: uid,
  });
}

export async function ensureInitialConfig(uid: string) {
  await set(configRef(), {
    hostUid: uid,
    state: "waiting",
    durationSec: DURATION_SEC_DEFAULT,
    startAt: null,
    countdownMs: COUNTDOWN_MS_DEFAULT,
    revealHideMs: REVEAL_HIDE_MS_DEFAULT,
  });
}

export async function updateDuration(durationSec: number) {
  await update(configRef(), { durationSec });
}

export async function startGame(countdownMs: number) {
  await remove(countsRef());
  await update(configRef(), {
    state: "running",
    startAt: serverNow() + countdownMs,
    countdownMs,
  });
}

export async function revealResults() {
  await update(configRef(), { state: "revealed" });
}

export async function resetGame() {
  await Promise.all([
    remove(countsRef()),
    remove(playersRef()),
    update(configRef(), { state: "waiting", startAt: null }),
  ]);
}

export async function takeoverHost(uid: string) {
  await remove(gameRootRef());
  await ensureInitialConfig(uid);
}
