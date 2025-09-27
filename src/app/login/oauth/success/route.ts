import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { getMemberId } from "@/services/memberService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("accessToken");
  const firstLogin = searchParams.get("firstLogin");
  const uuid = searchParams.get("uuid");

  if (!accessToken) {
    console.error("URL에서 accessToken을 찾을 수 없습니다.");
    return NextResponse.redirect(new URL("/login", env.REDIRECT_ORIGIN));
  }

  const cleanToken = accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken;

  try {
    // 멤버 ID 조회 API 호출
    const memberId = await getMemberId(cleanToken);

    // 서버사이드에서 쿠키 설정
    const cookieStore = await cookies();
    const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days

    // 토큰, 멤버 ID, UUID 모두 쿠키에 저장
    cookieStore.set("kakao_access_token", cleanToken, {
      path: "/",
      maxAge: maxAgeSeconds,
      httpOnly: false,
      domain: ".globber-fe.store",
    });

    cookieStore.set("member_id", memberId.toString(), {
      path: "/",
      maxAge: maxAgeSeconds,
      httpOnly: false,
      domain: ".globber-fe.store",
    });

    if (uuid) {
      cookieStore.set("uuid", uuid, {
        path: "/",
        maxAge: maxAgeSeconds,
        httpOnly: false,
        domain: ".globber-fe.store",
      });
    }

    console.log(`멤버 ID 저장 완료: ${memberId}${uuid ? `, UUID: ${uuid}` : ""}`);

    if (firstLogin === "true") {
      // 신규 사용자 - 도시 선택 페이지로 이동
      return NextResponse.redirect(new URL("/nation-select", env.REDIRECT_ORIGIN));
    } else {
      // 기존 사용자 - 홈 페이지로 이동하여 여행 데이터 확인 후 라우팅
      return NextResponse.redirect(new URL("/", env.REDIRECT_ORIGIN));
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
      domain: ".globber-fe.store",
    });

    if (uuid) {
      cookieStore.set("uuid", uuid, {
        path: "/",
        maxAge: maxAgeSeconds,
        httpOnly: false,
        domain: ".globber-fe.store",
      });
    }

    if (firstLogin === "true") {
      // 신규 사용자 - 도시 선택 페이지로 이동
      return NextResponse.redirect(new URL("/nation-select", env.REDIRECT_ORIGIN));
    } else {
      // 기존 사용자 - 홈 페이지로 이동하여 여행 데이터 확인 후 라우팅
      return NextResponse.redirect(new URL("/", env.REDIRECT_ORIGIN));
    }
  }
}
