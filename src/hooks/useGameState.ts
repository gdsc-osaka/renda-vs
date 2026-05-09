import { useEffect, useState } from "react";
import type { GameConfig, Phase } from "../types";
import { subscribeConfig } from "../lib/game-state";
import { initServerTimeOffset, serverNow } from "../lib/server-time";

export function useGameConfig(): GameConfig | null | undefined {
  // undefined: loading, null: no config yet
  const [config, setConfig] = useState<GameConfig | null | undefined>(undefined);
  useEffect(() => {
    initServerTimeOffset();
    return subscribeConfig((c) => setConfig(c));
  }, []);
  return config;
}

export function usePhase(config: GameConfig | null | undefined): {
  phase: Phase;
  remainingMs: number;
  countdownRemainingMs: number;
} {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!config) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 100);
    return () => window.clearInterval(id);
  }, [config]);

  if (!config) return { phase: "waiting", remainingMs: 0, countdownRemainingMs: 0 };

  if (config.state === "revealed") {
    return { phase: "revealed", remainingMs: 0, countdownRemainingMs: 0 };
  }

  if (config.state === "waiting" || config.startAt == null) {
    return { phase: "waiting", remainingMs: 0, countdownRemainingMs: 0 };
  }

  const now = serverNow();
  const startAt = config.startAt;
  const endAt = startAt + config.durationSec * 1000;

  if (now < startAt) {
    return {
      phase: "countdown",
      remainingMs: config.durationSec * 1000,
      countdownRemainingMs: startAt - now,
    };
  }

  if (now < endAt) {
    return {
      phase: "active",
      remainingMs: endAt - now,
      countdownRemainingMs: 0,
    };
  }

  return { phase: "finished", remainingMs: 0, countdownRemainingMs: 0 };
}
