import { useEffect, useState } from "react";
import { onValue } from "firebase/database";
import { countsRef, playersRef } from "../lib/game-state";
import type { Player } from "../types";
import type { TeamWithId } from "../lib/teams";

export interface TeamScore {
  team: TeamWithId;
  total: number;
  playerCount: number;
}

export function useAggregatedScores(teams: TeamWithId[]): {
  scoresByTeam: Map<string, TeamScore>;
  totalPlayers: number;
} {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [players, setPlayers] = useState<Record<string, Player>>({});

  useEffect(() => {
    return onValue(countsRef(), (snap) => {
      setCounts((snap.val() as Record<string, number> | null) ?? {});
    });
  }, []);

  useEffect(() => {
    return onValue(playersRef(), (snap) => {
      setPlayers((snap.val() as Record<string, Player> | null) ?? {});
    });
  }, []);

  const scoresByTeam = new Map<string, TeamScore>();
  for (const t of teams) {
    scoresByTeam.set(t.id, { team: t, total: 0, playerCount: 0 });
  }

  for (const [pid, player] of Object.entries(players)) {
    const score = scoresByTeam.get(player.teamId);
    if (!score) continue;
    score.playerCount++;
    score.total += counts[pid] ?? 0;
  }

  return {
    scoresByTeam,
    totalPlayers: Object.keys(players).length,
  };
}
