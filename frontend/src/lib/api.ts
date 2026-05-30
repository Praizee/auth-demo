import type { AuthPayload, User } from "../types";

type DemoUserRecord = User & {
  password: string;
};

const TOKEN_COOKIE = "auth_demo_token";
const DEMO_USERS_KEY = "auth_demo_users";
const DEMO_SESSION_KEY = "auth_demo_session";
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
  (import.meta.env.DEV ? "/api" : "");

const starterUsers: DemoUserRecord[] = [
  {
    id: "demo-user",
    name: "Mira Stone",
    email: "mira@example.com",
    password: "password123",
    role: "Member",
    bio: "This is a basic auth demo account.",
  },
];

export function setTokenCookie(token: string) {
  const oneWeek = 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(
    token,
  )}; max-age=${oneWeek}; path=/; samesite=lax`;
}

export function getTokenCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`))
    ?.split("=")[1];
}

export function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE}=; max-age=0; path=/; samesite=lax`;
}

export function saveSession(payload: AuthPayload) {
  setTokenCookie(payload.token);
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(payload));
}

export function clearSession() {
  clearTokenCookie();
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function getSavedSession() {
  const token = getTokenCookie();
  const saved = localStorage.getItem(DEMO_SESSION_KEY);
  if (!token || !saved) {
    return null;
  }

  const session = JSON.parse(saved) as AuthPayload;
  return session.token === decodeURIComponent(token) ? session : null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  if (!API_URL) {
    return runDemoRequest<T>(path, options);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(error?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

async function runDemoRequest<T>(
  path: string,
  options: RequestInit & { token?: string },
) {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const body = options.body ? JSON.parse(String(options.body)) : {};
  const users = getDemoUsers();

  if (path === "/auth/signup/") {
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === body.email.toLowerCase(),
    );

    if (existingUser) {
      throw new Error("That email already has an account.");
    }

    const user: DemoUserRecord = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      password: body.password,
      role: "Member",
      bio: "New account.",
    };
    saveDemoUsers([...users, user]);

    return {
      token: makeDemoToken(user.id),
      refresh: makeDemoToken(user.id),
      user: stripPassword(user),
    } as T;
  }

  if (path === "/auth/login/") {
    const user = users.find(
      (record) =>
        record.email.toLowerCase() === body.email.toLowerCase() &&
        record.password === body.password,
    );

    if (!user) {
      throw new Error("Email or password is not right.");
    }

    return {
      token: makeDemoToken(user.id),
      refresh: makeDemoToken(user.id),
      user: stripPassword(user),
    } as T;
  }

  if (path === "/auth/profile/" && options.method === "PATCH") {
    const session = getSavedSession();
    if (!session || !options.token) {
      throw new Error("Please log in again.");
    }

    const nextUsers = users.map((record) =>
      record.id === session.user.id
        ? { ...record, name: body.name, bio: body.bio }
        : record,
    );
    saveDemoUsers(nextUsers);

    const updatedUser = nextUsers.find(
      (record) => record.id === session.user.id,
    );

    if (!updatedUser) {
      throw new Error("Could not find this profile.");
    }

    return stripPassword(updatedUser) as T;
  }

  throw new Error("Demo endpoint not found.");
}

function getDemoUsers() {
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  if (!stored) {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(starterUsers));
    return starterUsers;
  }

  return JSON.parse(stored) as DemoUserRecord[];
}

function saveDemoUsers(users: DemoUserRecord[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function makeDemoToken(userId: string) {
  return `demo.${userId}.${crypto.randomUUID()}`;
}

function stripPassword(record: DemoUserRecord): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    bio: record.bio,
  };
}
