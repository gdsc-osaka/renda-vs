import { useCallback, useState, type PointerEvent } from "react";

interface Props {
  onTap: (info: { x: number; y: number }) => void;
  disabled?: boolean;
  label?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const RIPPLE_DURATION_MS = 600;
const MAX_RIPPLES = 12;
let nextRippleId = 0;

export function TapButton({ onTap, disabled, label = "TAP!" }: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      // 主ボタン（指タップ・左クリック）のみ受け付ける
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++nextRippleId;

      setRipples((prev) => {
        const next = prev.length >= MAX_RIPPLES ? prev.slice(1) : prev;
        return [...next, { id, x, y }];
      });
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, RIPPLE_DURATION_MS);

      onTap({ x, y });
    },
    [disabled, onTap],
  );

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        "relative overflow-hidden",
        "select-none touch-manipulation",
        "flex-1 w-full flex items-center justify-center",
        "rounded-3xl text-7xl font-black tracking-widest",
        disabled
          ? "bg-gray-700 text-gray-500"
          : "bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-2xl",
      ].join(" ")}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      <span className="relative z-10 pointer-events-none">{label}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/60 pointer-events-none"
          style={{
            left: r.x - 200,
            top: r.y - 200,
            width: 400,
            height: 400,
            animation: `tap-ripple ${RIPPLE_DURATION_MS}ms ease-out forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes tap-ripple {
          0% { transform: scale(0); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
