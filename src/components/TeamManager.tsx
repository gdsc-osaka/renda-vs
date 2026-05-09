import { useState } from "react";
import { createTeam, deleteTeam, type TeamWithId } from "../lib/teams";

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
];

interface Props {
  teams: TeamWithId[];
  disabled?: boolean;
}

export function TeamManager({ teams, disabled }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createTeam(name.trim().slice(0, 20), color);
      setName("");
      // Rotate to next palette color
      const idx = PALETTE.indexOf(color);
      setColor(PALETTE[(idx + 1) % PALETTE.length]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("このチームを削除しますか？")) return;
    await deleteTeam(id);
  };

  return (
    <section className="rounded-2xl bg-gray-800/60 p-5 space-y-4">
      <h2 className="text-lg font-bold">チーム管理</h2>

      <div className="space-y-2">
        {teams.length === 0 && (
          <div className="text-sm text-gray-400">まだチームがありません</div>
        )}
        {teams.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-lg bg-gray-900 px-3 py-2"
          >
            <span
              className="inline-block w-5 h-5 rounded-full border border-gray-600"
              style={{ backgroundColor: t.color }}
            />
            <span className="flex-1 truncate">{t.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(t.id)}
              disabled={disabled}
              className="text-xs text-red-400 hover:text-red-300 disabled:text-gray-600"
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-3">
        <div className="text-sm text-gray-300">新しいチームを追加</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          disabled={disabled}
          placeholder="チーム名（例: 関西）"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2"
        />
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={[
                "w-7 h-7 rounded-full border-2 transition-transform",
                color === c ? "border-white scale-110" : "border-transparent",
              ].join(" ")}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || disabled || !name.trim()}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-4 py-2 font-bold"
        >
          追加
        </button>
        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>
    </section>
  );
}
