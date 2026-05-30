export type Route = "/login" | "/signup" | "/dashboard" | "/profile";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  bio: string;
};

export type AuthPayload = {
  token: string;
  refresh: string;
  user: User;
};

