import type { TeamWithId } from "../lib/teams";

interface Props {
  teams: TeamWithId[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export function TeamSelector({ teams, selected, onSelect }: Props) {
  if (teams.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-800/60 px-6 py-10 text-center text-gray-300">
        ホストの準備をお待ちください…
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {teams.map((t) => {
        const isSelected = t.id === selected;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={[
              "rounded-2xl px-5 py-6 text-left transition-all",
              "border-2",
              isSelected
                ? "border-white scale-[1.02] shadow-xl"
                : "border-transparent opacity-90 hover:opacity-100",
            ].join(" ")}
            style={{ backgroundColor: t.color }}
          >
            <div className="text-xs font-semibold uppercase opacity-80 text-white">
              Team
            </div>
            <div className="text-2xl font-bold text-white drop-shadow">
              {t.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
