import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type AdminSession } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", req.url));
  const session = await getIronSession<AdminSession>(
    req,
    response,
    sessionOptions,
  );
  session.destroy();
  return response;
}
