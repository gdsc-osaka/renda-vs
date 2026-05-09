import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { isHostSession } from "../lib/host-auth";

export interface HostAuthState {
  user: User | null;
  isHost: boolean;
  loading: boolean;
}

export function useHostAuth(): HostAuthState {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return {
    user,
    isHost: !!user && isHostSession(),
    loading,
  };
}
