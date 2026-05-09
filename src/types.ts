export type GameState = "waiting" | "running" | "revealed";

export interface GameConfig {
  hostUid?: string;
  state: GameState;
  durationSec: number;
  startAt: number | null;
  countdownMs: number;
  revealHideMs: number;
}

export interface Team {
  name: string;
  color: string;
  createdAt: number;
}

export interface Player {
  teamId: string;
  nickname: string | null;
  joinedAt: number;
}

export type Phase =
  | "waiting"
  | "countdown"
  | "active"
  | "finished"
  | "revealed";

export interface DerivedGameStatus {
  phase: Phase;
  remainingMs: number;
  elapsedMs: number;
}
