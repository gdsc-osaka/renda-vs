import type { TeamScore } from "../hooks/useAggregatedScores";

interface Props {
  scores: TeamScore[];
  hidden?: boolean;
}

export function ScoreBar({ scores, hidden }: Props) {
  const max = Math.max(1, ...scores.map((s) => s.total));
  return (
    <div className="space-y-3">
      {scores.map(({ team, total, playerCount }) => {
        const pct = (total / max) * 100;
        return (
          <div key={team.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{team.name}</span>
              <span className="tabular-nums text-gray-300">
                {hidden ? "???" : total.toLocaleString()}{" "}
                <span className="text-xs text-gray-500">
                  / {playerCount}人
                </span>
              </span>
            </div>
            <div className="h-6 rounded-full bg-gray-900 overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: hidden ? "100%" : `${pct}%`,
                  backgroundColor: hidden ? "#374151" : team.color,
                  filter: hidden ? "blur(8px)" : undefined,
                  opacity: hidden ? 0.5 : 1,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
