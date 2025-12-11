import { AuthUser } from "../auth/AuthContext";

export function getUserIdFromAuth(authUser: AuthUser | null): string | null {
  if (!authUser) return null;
  if (authUser.email) return authUser.email;
  if (authUser.sub) return authUser.sub;
  return null;
}
