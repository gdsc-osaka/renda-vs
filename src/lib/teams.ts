import { onValue, push, ref, remove, update } from "firebase/database";
import { db, GAME_ID } from "./firebase";
import { teamsRef } from "./game-state";
import type { Team } from "../types";

export type TeamWithId = Team & { id: string };

export function subscribeTeams(cb: (teams: TeamWithId[]) => void) {
  return onValue(teamsRef(), (snap) => {
    const val = snap.val() as Record<string, Team> | null;
    if (!val) return cb([]);
    const list = Object.entries(val).map(([id, t]) => ({ id, ...t }));
    list.sort((a, b) => a.createdAt - b.createdAt);
    cb(list);
  });
}

export async function createTeam(name: string, color: string) {
  const newRef = push(teamsRef());
  await update(newRef, {
    name,
    color,
    createdAt: Date.now(),
  } satisfies Team);
  return newRef.key!;
}

export async function updateTeam(id: string, patch: Partial<Pick<Team, "name" | "color">>) {
  await update(ref(db, `games/${GAME_ID}/teams/${id}`), patch);
}

export async function deleteTeam(id: string) {
  await remove(ref(db, `games/${GAME_ID}/teams/${id}`));
}
