import { useEffect, useState } from "react";
import type { TeamScore } from "../hooks/useAggregatedScores";

interface Props {
  scores: TeamScore[];
}

const SUSPENSE_MS = 2500; // 全チーム同じ値で増えていく時間
const REVEAL_MS = 2500;   // 実スコアに分岐していく時間
const TOTAL_MS = SUSPENSE_MS + REVEAL_MS;

export function ResultReveal({ scores }: Props) {
  const sorted = [...scores].sort((a, b) => b.total - a.total);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const e = now - startedAt;
      setElapsed(e);
      if (e < TOTAL_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const finalMax = Math.max(1, ...sorted.map((s) => s.total));
  // サスペンス到達点: 一番低いチームのスコア。これ以下なら全チーム値が単調増加で済む
  const suspenseTarget = sorted.length > 0
    ? Math.min(...sorted.map((s) => s.total))
    : 0;

  const inSuspense = elapsed < SUSPENSE_MS;
  const inReveal = elapsed >= SUSPENSE_MS && elapsed < TOTAL_MS;

  const displayedFor = (final: number): number => {
    if (elapsed >= TOTAL_MS) return final;
    if (inSuspense) {
      const t = easeOutQuad(elapsed / SUSPENSE_MS);
      return Math.round(suspenseTarget * t);
    }
    // reveal phase
    const t = easeOutCubic((elapsed - SUSPENSE_MS) / REVEAL_MS);
    return Math.round(suspenseTarget + (final - suspenseTarget) * t);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-center">
        {inSuspense ? "結果は…？" : "最終結果"}
      </h2>
      <div className="space-y-4">
        {sorted.map((s, idx) => {
          const animated = displayedFor(s.total);
          const widthPct = (animated / finalMax) * 100;
          return (
            <div key={s.team.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "text-2xl font-black tabular-nums w-8 transition-colors duration-500",
                      inSuspense ? "text-gray-600" : "text-gray-400",
                    ].join(" ")}
                  >
                    {inSuspense ? "?" : idx + 1}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{ backgroundColor: s.team.color, color: "white" }}
                  >
                    {s.team.name}
                  </span>
                </div>
                <span
                  className={[
                    "text-3xl font-black tabular-nums",
                    inReveal ? "transition-colors" : "",
                  ].join(" ")}
                >
                  {animated.toLocaleString()}
                </span>
              </div>
              <div className="h-8 rounded-full bg-gray-900 overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: s.team.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}
