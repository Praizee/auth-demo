import { type ReactNode, useMemo, useState } from "react";
import {
  apiRequest,
  clearSession,
  getSavedSession,
  saveSession,
} from "../lib/api";
import { navigate } from "../lib/router";
import type { AuthPayload, User } from "../types";
import { AuthContext, type AuthContextValue } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthPayload | null>(() =>
    getSavedSession(),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthed: Boolean(session),
      async login(email, password) {
        const payload = await apiRequest<AuthPayload>("/auth/login/", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        saveSession(payload);
        setSession(payload);
      },
      async signup(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
      ) {
        const payload = await apiRequest<AuthPayload>("/auth/signup/", {
          method: "POST",
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            password_confirm: password,
          }),
        });
        saveSession(payload);
        setSession(payload);
      },
      logout() {
        clearSession();
        setSession(null);
        navigate("/login");
      },
      async updateProfile(profile) {
        if (!session?.token) {
          throw new Error("Please log in again.");
        }

        const user = await apiRequest<User>("/auth/profile/", {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify(profile),
        });
        const nextSession = {
          token: session.token,
          refresh: session.refresh,
          user,
        };
        saveSession(nextSession);
        setSession(nextSession);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

