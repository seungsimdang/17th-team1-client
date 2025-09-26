import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getMemberId } from "@/services/memberService";

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

  try {
    // 멤버 ID 조회 API 호출
    const memberId = await getMemberId(cleanToken);

    // 서버사이드에서 쿠키 설정
    const cookieStore = await cookies();
    const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days

    // 토큰과 멤버 ID 모두 쿠키에 저장
    cookieStore.set("kakao_access_token", cleanToken, {
      path: "/",
      maxAge: maxAgeSeconds,
      httpOnly: false,
    });

    cookieStore.set("member_id", memberId.toString(), {
      path: "/",
      maxAge: maxAgeSeconds,
      httpOnly: false,
    });

    console.log(`멤버 ID 저장 완료: ${memberId}`);

    if (firstLogin === "true") {
      return NextResponse.redirect(new URL("/nation-select", request.url));
    } else {
      return NextResponse.redirect(new URL("/globe", request.url));
    }
  } catch (error) {
    console.error("멤버 ID 조회 중 오류:", error);
    // API 호출 실패 시에도 토큰은 저장하고 진행
    const cookieStore = await cookies();
    const maxAgeSeconds = 60 * 60 * 24 * 7;

    cookieStore.set("kakao_access_token", cleanToken, {
      path: "/",
      maxAge: maxAgeSeconds,
      httpOnly: false,
    });

    if (firstLogin === "true") {
      return NextResponse.redirect(new URL("/nation-select", request.url));
    } else {
      return NextResponse.redirect(new URL("/globe", request.url));
    }
  }
}
