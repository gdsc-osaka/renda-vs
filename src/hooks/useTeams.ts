import { useEffect, useState } from "react";
import { subscribeTeams, type TeamWithId } from "../lib/teams";

export function useTeams(): TeamWithId[] {
  const [teams, setTeams] = useState<TeamWithId[]>([]);
  useEffect(() => subscribeTeams(setTeams), []);
  return teams;
}
