import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getIronSession } from "iron-session";
import type { AdminSession } from "@/lib/admin-session";

const PROTECTED_PREFIXES = ["/dashboard", "/elders", "/stories", "/projects"];

const ADMIN_SESSION_OPTS = {
  cookieName: "smriti_admin_session",
  password: process.env.ADMIN_SESSION_PASSWORD ?? "fallback-not-used",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
} as const;

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const tmpRes = new Response();
    const session = await getIronSession<AdminSession>(
      request,
      tmpRes,
      ADMIN_SESSION_OPTS,
    );
    const isAdmin = session.isAdmin === true;

    if (pathname === "/admin/login") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next({ request });
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next({ request });
  }

  // ── Supabase / user routes ────────────────────────────────────────────────
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror onto the request so downstream server components see fresh tokens
          cookiesToSet.forEach(({ name, value }: any) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: any) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();

  // Stale / invalidated refresh token — clear it so the error stops repeating
  if (error?.name === "AuthApiError") {
    await supabase.auth.signOut({ scope: "local" });
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtected && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
