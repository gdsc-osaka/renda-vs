import { useCallback, type PointerEvent } from "react";

interface Props {
  onTap: () => void;
  disabled?: boolean;
  label?: string;
}

export function TapButton({ onTap, disabled, label = "TAP!" }: Props) {
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      // 主ボタン（指タップ・左クリック）のみ受け付ける
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      onTap();
    },
    [disabled, onTap],
  );

  // <button> ではなく <div role="button"> を使うことで Enter/Space での発火を防止
  return (
    <div
      role="button"
      tabIndex={-1}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        "select-none touch-manipulation",
        "flex-1 w-full flex items-center justify-center",
        "rounded-3xl text-7xl font-black tracking-widest",
        "transition-transform active:scale-95",
        disabled
          ? "bg-gray-700 text-gray-500"
          : "bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-2xl",
      ].join(" ")}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {label}
    </div>
  );
}
