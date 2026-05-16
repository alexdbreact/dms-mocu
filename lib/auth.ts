import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { findUser, type StaticUser, type UserRole } from "@/lib/users";

const COOKIE_NAME = "dms_session";

export type SessionUser = Pick<StaticUser, "username" | "name" | "role">;

type TokenPayload = {
  username: string;
  role: UserRole;
};

function getSecret() {
  return process.env.JWT_SECRET || "local-development-secret";
}

export async function createSession(user: StaticUser) {
  const token = jwt.sign({ username: user.username, role: user.role }, getSecret(), {
    expiresIn: "8h"
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getSecret()) as TokenPayload;
    const user = findUser(payload.username);

    if (!user || user.role !== payload.role) {
      return null;
    }

    return {
      username: user.username,
      name: user.name,
      role: user.role
    };
  } catch {
    return null;
  }
}
