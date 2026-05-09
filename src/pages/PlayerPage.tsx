import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { set } from "firebase/database";
import { useGameConfig, usePhase } from "../hooks/useGameState";
import { useTeams } from "../hooks/useTeams";
import { TeamSelector } from "../components/TeamSelector";
import { ActiveGame } from "../components/ActiveGame";
import { CountdownNumber } from "../components/CountdownNumber";
import {
  getPlayerId,
  getStoredNickname,
  getStoredTeamId,
  setStoredNickname,
  setStoredTeamId,
} from "../lib/player-id";
import { playerRef } from "../lib/game-state";

export function PlayerPage() {
  const config = useGameConfig();
  const teams = useTeams();
  const { phase, remainingMs, countdownRemainingMs } = usePhase(config);

  const [playerId] = useState(() => getPlayerId());
  const [teamId, setTeamId] = useState<string | null>(() => getStoredTeamId());
  const [nickname, setNickname] = useState(() => getStoredNickname());
  const [error, setError] = useState<string | null>(null);

  const validTeam = useMemo(() => teams.find((t) => t.id === teamId), [teams, teamId]);

  // Register/Update player record whenever team changes (allow joining mid-game)
  useEffect(() => {
    if (phase === "finished" || phase === "revealed") return;
    if (!validTeam) return;
    void set(playerRef(playerId), {
      teamId: validTeam.id,
      nickname: nickname.trim() || null,
      joinedAt: Date.now(),
    }).catch((e) => setError(`参加登録に失敗しました: ${(e as Error).message}`));
  }, [validTeam, phase, playerId, nickname]);

  const handleSelectTeam = (id: string) => {
    setTeamId(id);
    setStoredTeamId(id);
  };

  const handleNicknameChange = (v: string) => {
    const trimmed = v.slice(0, 20);
    setNickname(trimmed);
    setStoredNickname(trimmed);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {phase === "waiting" && (
        <div className="flex-1 flex flex-col p-5 gap-5 max-w-2xl w-full mx-auto">
          <header className="flex items-center justify-between mt-2">
            <h1 className="text-3xl font-black tracking-tight">連打 vs</h1>
            <Link to="/host" className="text-sm text-gray-400 hover:text-gray-200 underline">
              ホスト画面
            </Link>
          </header>

          <section className="rounded-2xl bg-gray-800/60 p-5">
            <label className="block text-sm text-gray-300 mb-2">ニックネーム（任意）</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              maxLength={20}
              placeholder="ニックネーム"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </section>

          <section>
            <h2 className="text-sm text-gray-300 mb-2">チームを選んでください</h2>
            <TeamSelector teams={teams} selected={teamId} onSelect={handleSelectTeam} />
          </section>

          {validTeam && (
            <div className="rounded-xl bg-emerald-900/40 border border-emerald-700 px-4 py-3 text-emerald-200 text-center">
              「{validTeam.name}」で待機中です。ゲーム開始までお待ちください。
            </div>
          )}

          <footer className="mt-auto text-xs text-gray-500 text-center pb-2">
            タップ・クリック以外（スペース／Enter等）はカウントされません
          </footer>
        </div>
      )}

      {phase === "countdown" && validTeam && (
        <div className="flex-1 flex items-center justify-center p-5">
          <CountdownNumber remainingMs={countdownRemainingMs} />
        </div>
      )}

      {phase === "countdown" && !validTeam && (
        <div className="flex-1 flex flex-col p-5 gap-4 max-w-2xl w-full mx-auto">
          <div className="rounded-2xl bg-orange-900/40 border border-orange-600 px-4 py-3 text-center">
            <div className="text-sm text-orange-200">まもなく開始！</div>
            <div className="text-4xl font-black tabular-nums text-white mt-1">
              {Math.ceil(countdownRemainingMs / 1000)}
            </div>
          </div>
          <h2 className="text-sm text-gray-300">急いでチームを選んでください</h2>
          <TeamSelector teams={teams} selected={teamId} onSelect={handleSelectTeam} />
        </div>
      )}

      {phase === "active" && validTeam && (
        <ActiveGame
          key={`game-${config?.startAt ?? "0"}`}
          validTeam={validTeam}
          playerId={playerId}
          remainingMs={remainingMs}
        />
      )}

      {phase === "active" && !validTeam && (
        <div className="flex-1 flex flex-col p-5 gap-4 max-w-2xl w-full mx-auto">
          <div className="rounded-2xl bg-rose-900/50 border border-rose-600 px-4 py-3 text-center">
            <div className="text-sm text-rose-200">ゲーム開催中・今からでも参加できます！</div>
            <div className="text-4xl font-black tabular-nums text-white mt-1">
              残り {Math.ceil(remainingMs / 1000)}s
            </div>
          </div>
          <h2 className="text-sm text-gray-300">チームを選択するとすぐに連打できます</h2>
          <TeamSelector teams={teams} selected={teamId} onSelect={handleSelectTeam} />
        </div>
      )}

      {phase === "finished" && (
        <div className="flex-1 flex items-center justify-center p-5 text-center">
          <div className="space-y-3">
            <div className="text-2xl font-bold">お疲れさまでした！</div>
            <div className="text-gray-400">ホストの結果発表をお待ちください</div>
            <Link
              to="/host"
              className="inline-block mt-3 text-sm text-gray-400 hover:text-gray-200 underline"
            >
              ホスト画面
            </Link>
          </div>
        </div>
      )}

      {phase === "revealed" && (
        <div className="flex-1 flex items-center justify-center p-5 text-center">
          <div className="space-y-3">
            <div className="text-2xl font-bold">結果発表中</div>
            <div className="text-gray-400">ホスト画面をご覧ください</div>
            <Link
              to="/host"
              className="inline-block mt-3 text-sm text-gray-400 hover:text-gray-200 underline"
            >
              ホスト画面
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-[90%]">
          <div className="rounded-xl bg-red-900/90 border border-red-600 px-4 py-3 text-red-100 text-center text-sm shadow-2xl">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-200 underline"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
