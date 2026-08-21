import type { Player } from "./lib";

// Carries the HTTP status so callers can tell "wrong passcode / not signed
// in" (401 — a real access-control answer) apart from a transient server or
// database hiccup (anything else), which need very different UI responses.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      typeof json?.error === "string" ? json.error : `Request failed (${res.status})`,
      res.status
    );
  }
  return json as T;
}

export const hifzApi = {
  familyLogin: (passcode: string) =>
    request<{ success: true }>("/api/hifz/family-login", {
      method: "POST",
      body: JSON.stringify({ passcode }),
    }),
  familyLogout: () =>
    request<{ success: true }>("/api/hifz/family-logout", { method: "POST" }),
  playerLogin: (playerId: string, pin: string) =>
    request<{ player: Player }>("/api/hifz/player-login", {
      method: "POST",
      body: JSON.stringify({ playerId, pin }),
    }),
  playerLogout: () =>
    request<{ success: true }>("/api/hifz/player-logout", { method: "POST" }),
  me: () => request<{ player: Player | null }>("/api/hifz/me"),
  state: () => request<{ players: Player[] }>("/api/hifz/state"),
  patchPlayer: (patch: Record<string, unknown>) =>
    request<{ player: Player }>("/api/hifz/player", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};
