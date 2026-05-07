import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Routes that require an active session.
 * Unauthenticated users are redirected to /login.
 */
const PROTECTED_PATHS = ["/agent", "/app", "/admin"];

/**
 * Routes only for unauthenticated users (redirect to dashboard if logged in).
 */
const AUTH_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Extract session from cookies manually (updateSession already refreshed it)
  const sessionCookie = request.cookies.get("sb-access-token")?.value;
  const hasSession = !!sessionCookie;

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/agent/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
