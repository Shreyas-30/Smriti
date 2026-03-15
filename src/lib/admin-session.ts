import type { SessionOptions } from "iron-session";

export type AdminSession = {
  isAdmin: boolean;
};

export const sessionOptions: SessionOptions = {
  cookieName: "smriti_admin_session",
  password: process.env.ADMIN_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
};
