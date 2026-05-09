import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameConfig, usePhase } from "../hooks/useGameState";
import { useTeams } from "../hooks/useTeams";
import { useAggregatedScores } from "../hooks/useAggregatedScores";
import {
  claimHost,
  ensureInitialConfig,
  resetGame,
  revealResults,
  startGame,
  takeoverHost,
  updateDuration,
} from "../lib/game-state";
import { TeamManager } from "./TeamManager";
import { ScoreBar } from "./ScoreBar";
import { ResultReveal } from "./ResultReveal";
import { CountdownNumber } from "./CountdownNumber";
import { COUNTDOWN_MS_DEFAULT, REVEAL_HIDE_MS_DEFAULT } from "../lib/firebase";
import type { User } from "firebase/auth";

interface Props {
  user: User;
}

export function HostDashboard({ user }: Props) {
  const config = useGameConfig();
  const teams = useTeams();
  const { phase, remainingMs, countdownRemainingMs } = usePhase(config);
  const { scoresByTeam, totalPlayers } = useAggregatedScores(teams);

  const scores = useMemo(() => Array.from(scoresByTeam.values()), [scoresByTeam]);

  const [durationOverride, setDurationOverride] = useState<number | null>(null);
  const duration = durationOverride ?? config?.durationSec ?? 20;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize config / claim host when state changes
  useEffect(() => {
    if (config === undefined) return; // still loading
    if (config === null) {
      void ensureInitialConfig(user.uid).catch((e) => setError((e as Error).message));
    } else if (!config.hostUid) {
      void claimHost(user.uid).catch((e) => setError((e as Error).message));
    }
  }, [config, user.uid]);

  const isHostOfThisGame = !!config && config.hostUid === user.uid;

  if (config === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-400">
        読み込み中…
      </div>
    );
  }

  // 別のホストが登録されている場合
  if (config && config.hostUid && config.hostUid !== user.uid) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-5">
        <div className="max-w-md w-full rounded-2xl bg-gray-800 p-6 space-y-4 text-center">
          <h1 className="text-xl font-bold">他のホストがゲームを管理中です</h1>
          <p className="text-sm text-gray-400">
            このブラウザではホスト権限がありません。引き継ぐと現在のゲームデータがすべて削除されます。
          </p>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm("現在のゲームを完全リセットしてホスト権限を引き継ぎますか？")) return;
              setBusy(true);
              try {
                await takeoverHost(user.uid);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="w-full rounded-lg bg-red-700 hover:bg-red-600 px-4 py-2 font-bold"
          >
            引き継いでリセット
          </button>
          <Link to="/" className="block text-sm text-gray-400 underline">
            プレイヤー画面に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!isHostOfThisGame) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-400">
        ホスト権限を取得中…
      </div>
    );
  }

  const handleStart = async () => {
    if (teams.length < 2) {
      setError("チームを 2 つ以上作成してください");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateDuration(duration);
      await startGame(config.countdownMs ?? COUNTDOWN_MS_DEFAULT);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleReveal = async () => {
    setBusy(true);
    try {
      await revealResults();
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("ゲームをリセットしますか？参加者データもクリアされます。")) return;
    setBusy(true);
    try {
      await resetGame();
    } finally {
      setBusy(false);
    }
  };

  const revealHideMs = config.revealHideMs ?? REVEAL_HIDE_MS_DEFAULT;
  const shouldHideScores = phase === "active" && remainingMs <= revealHideMs;

  return (
    <div className="min-h-dvh max-w-3xl mx-auto p-5 space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black">ホストダッシュボード</h1>
        <Link to="/" className="text-sm text-gray-400 underline">
          プレイヤー画面
        </Link>
      </header>

      <div className="rounded-2xl bg-gray-800/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            状態: <strong className="text-white">{phaseLabel(phase)}</strong>
          </span>
          <span className="text-sm text-gray-300">参加者: {totalPlayers} 人</span>
        </div>

        {phase === "waiting" && (
          <>
            <label className="block text-sm text-gray-300">制限時間（秒）</label>
            <input
              type="number"
              min={1}
              max={300}
              value={duration}
              onChange={(e) => setDurationOverride(Number(e.target.value) || 0)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2"
            />
            <button
              type="button"
              onClick={handleStart}
              disabled={busy || teams.length < 2 || duration < 1}
              className="w-full rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 px-4 py-3 font-black text-lg"
            >
              ゲーム開始（{Math.round((config.countdownMs ?? COUNTDOWN_MS_DEFAULT) / 1000)} 秒カウントダウン）
            </button>
          </>
        )}

        {phase === "countdown" && <CountdownNumber remainingMs={countdownRemainingMs} />}

        {phase === "active" && (
          <div className="text-center">
            <div className="text-sm text-gray-400">残り時間</div>
            <div className="text-6xl font-black tabular-nums">
              {Math.ceil(remainingMs / 1000)}
              <span className="text-2xl text-gray-400">s</span>
            </div>
          </div>
        )}

        {phase === "finished" && (
          <button
            type="button"
            onClick={handleReveal}
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 px-4 py-4 font-black text-xl animate-pulse"
          >
            🎉 結果発表 🎉
          </button>
        )}

        {(phase === "finished" || phase === "revealed") && (
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="w-full rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm"
          >
            リセット（次のゲームへ）
          </button>
        )}
      </div>

      {(phase === "active" || phase === "countdown") && (
        <section className="rounded-2xl bg-gray-800/60 p-5 space-y-4">
          <h2 className="text-lg font-bold">
            ライブスコア{shouldHideScores && " (発表まで非表示)"}
          </h2>
          <ScoreBar scores={scores} hidden={shouldHideScores} />
        </section>
      )}

      {phase === "finished" && (
        <section className="rounded-2xl bg-gray-800/60 p-5 space-y-4">
          <h2 className="text-lg font-bold text-center text-amber-300">
            結果は隠されています。「結果発表」ボタンを押してください
          </h2>
          <ScoreBar scores={scores} hidden />
        </section>
      )}

      {phase === "revealed" && (
        <section className="rounded-2xl bg-gray-800/60 p-6">
          <ResultReveal scores={scores} />
        </section>
      )}

      {phase === "waiting" && <TeamManager teams={teams} />}

      {error && (
        <div className="rounded-xl bg-red-900/80 border border-red-600 px-4 py-3 text-red-100">
          {error}
        </div>
      )}
    </div>
  );
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case "waiting":
      return "待機中";
    case "countdown":
      return "カウントダウン中";
    case "active":
      return "ゲーム中";
    case "finished":
      return "終了（発表前）";
    case "revealed":
      return "結果発表中";
    default:
      return phase;
  }
}
