import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("accessToken");
  const firstLogin = searchParams.get("firstLogin");

  if (!accessToken) {
    console.error("URL에서 accessToken을 찾을 수 없습니다.");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const cleanToken = accessToken.startsWith("Bearer ")
    ? accessToken.substring(7)
    : accessToken;

  // 서버사이드에서 쿠키 설정
  const cookieStore = await cookies();
  const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days

  cookieStore.set("kakao_access_token", cleanToken, {
    path: "/",
    maxAge: maxAgeSeconds,
    httpOnly: false, // 클라이언트에서도 접근 가능하도록
  });

  // 리다이렉트
  if (firstLogin === "true") {
    return NextResponse.redirect(new URL("/nation-select", request.url));
  } else {
    return NextResponse.redirect(new URL("/globe", request.url));
  }
}
