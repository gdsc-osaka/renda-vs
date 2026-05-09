import { useState } from "react";
import { useHostAuth } from "../hooks/useHostAuth";
import { HostLogin } from "../components/HostLogin";
import { HostDashboard } from "../components/HostDashboard";

export function HostPage() {
  const { user, isHost, loading } = useHostAuth();
  const [, force] = useState(0);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-400">
        認証情報を確認中…
      </div>
    );
  }

  if (!user || !isHost) {
    return <HostLogin onSuccess={() => force((n) => n + 1)} />;
  }

  return <HostDashboard user={user} />;
}
