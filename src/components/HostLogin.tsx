import { useState, type FormEvent } from "react";
import { ensureAnonymousAuth, markHostSession, verifyHostPassword } from "../lib/host-auth";

interface Props {
  onSuccess: () => void;
}

export function HostLogin({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const ok = await verifyHostPassword(password);
      if (!ok) {
        setError("パスワードが違います");
        return;
      }
      await ensureAnonymousAuth();
      markHostSession();
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-gray-800/70 p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">ホスト認証</h1>
        <p className="text-sm text-gray-400 text-center">
          管理者用パスワードを入力してください
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white"
          placeholder="パスワード"
        />
        {error && (
          <div className="text-sm text-red-400 text-center">{error}</div>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 px-4 py-2 font-bold"
        >
          {busy ? "認証中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
