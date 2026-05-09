interface Props {
  remainingMs: number;
}

export function CountdownNumber({ remainingMs }: Props) {
  const seconds = Math.ceil(remainingMs / 1000);
  const display = seconds > 0 ? String(seconds) : "START!";
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="text-gray-400 text-lg">まもなく開始</div>
      <div
        key={display}
        className="text-[200px] font-black leading-none text-white animate-[pop_1s_ease-out]"
        style={{
          textShadow: "0 0 40px rgba(255,255,255,0.5)",
        }}
      >
        {display}
      </div>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.3); opacity: 0; }
          40% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
