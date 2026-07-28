import type { PublicUser } from "../types";
import { api } from "./client";

// POST /api/auth/login
// { email, password }  →  { access_token }
export function login(body: { email: string; password: string }) {
  return api.post<{ access_token: string }>("/auth/login", body);
}

// POST /api/users
// { email, password, userName }  →  PublicUser  (토큰 미발급)
export function signup(body: {
  email: string;
  password: string;
  userName: string;
}) {
  return api.post<PublicUser>("/users", body);
}

// GET  /api/users/me
// →  PublicUser | 401
export function getMe() {
  return api.get<PublicUser>("/users/me");
}
