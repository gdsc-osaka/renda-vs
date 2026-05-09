import { useEffect, useRef, useState } from "react";
import { TapButton } from "./TapButton";
import { ClickTracker } from "../lib/click-tracker";
import { isMuted, playClick, toggleMute } from "../lib/audio";
import type { TeamWithId } from "../lib/teams";

interface Props {
  validTeam: TeamWithId;
  playerId: string;
  remainingMs: number;
}

// startAt を key にして毎ゲーム再マウントする想定の前提で、
// localTotal とトラッカーは「このゲーム1回分」のライフサイクルになる
export function ActiveGame({ validTeam, playerId, remainingMs }: Props) {
  const [localTotal, setLocalTotal] = useState(0);
  const [muted, setMutedState] = useState(isMuted());
  const [error, setError] = useState<string | null>(null);
  const trackerRef = useRef<ClickTracker | null>(null);

  useEffect(() => {
    const tracker = new ClickTracker({
      playerId,
      onAutoClickerDetected: () =>
        setError("自動クリッカーを検知しました。次のゲームをお待ちください。"),
      onSendError: (e) => console.warn("send error", e),
    });
    tracker.start();
    trackerRef.current = tracker;
    return () => {
      tracker.stop();
      trackerRef.current = null;
    };
  }, [playerId]);

  const handleTap = () => {
    if (!trackerRef.current?.tap()) return;
    setLocalTotal((t) => t + 1);
    playClick();
  };

  return (
    <div className="fixed inset-0 flex flex-col p-3 gap-3 bg-black">
      <div className="flex items-center justify-between gap-3">
        <div className="text-left">
          <div className="text-xs text-gray-500 leading-tight">あなたの連打</div>
          <div className="text-3xl font-black tabular-nums text-orange-300 leading-none">
            {localTotal}
          </div>
        </div>
        <div className="text-center">
          <div
            className="inline-block rounded-full px-3 py-0.5 text-xs font-bold"
            style={{ backgroundColor: validTeam.color, color: "white" }}
          >
            {validTeam.name}
          </div>
          <div className="text-4xl font-black tabular-nums leading-tight">
            {Math.ceil(remainingMs / 1000)}
            <span className="text-xl text-gray-400">s</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMutedState(toggleMute())}
          aria-label={muted ? "ミュート解除" : "ミュート"}
          className="text-2xl w-10 h-10 rounded-full bg-gray-800/80 text-gray-200"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <TapButton onTap={handleTap} disabled={!!error} />

      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md w-[90%]">
          <div className="rounded-xl bg-red-900/90 border border-red-600 px-4 py-3 text-red-100 text-center text-sm shadow-2xl">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
