import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS: readonly string[] = [
  "/",
  "/login",
  "/login/oauth/success",
  "/_next",
  "/api",
  "/favicon.ico",
  "/favicon.png",
  "/robots.txt",
  "/sitemap.xml",
  "/public",
  "/test",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kakao_access_token")?.value;
  const memberId = request.cookies.get("member_id")?.value;

  if (token && pathname === "/login") {
    console.log(
      `[Middleware] Redirecting authenticated user from /login to /globe`
    );
    const url = request.nextUrl.clone();
    url.pathname = "/globe";
    return NextResponse.redirect(url);
  }

  if (!token && !isPublicPath(pathname)) {
    console.log(
      `[Middleware] Redirecting unauthenticated user from ${pathname} to /login`
    );
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
