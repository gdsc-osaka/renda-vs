const PLAYER_ID_KEY = "renda-vs:playerId";
const NICKNAME_KEY = "renda-vs:nickname";
const TEAM_ID_KEY = "renda-vs:teamId";

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getStoredNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) ?? "";
}

export function setStoredNickname(name: string) {
  localStorage.setItem(NICKNAME_KEY, name);
}

export function getStoredTeamId(): string | null {
  return localStorage.getItem(TEAM_ID_KEY);
}

export function setStoredTeamId(id: string) {
  localStorage.setItem(TEAM_ID_KEY, id);
}
