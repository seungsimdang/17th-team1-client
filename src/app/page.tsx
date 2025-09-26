import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kakao_access_token")?.value;

  if (token) {
    // 토큰이 있으면 지구본 페이지로 이동
    redirect("/globe");
  } else {
    // 토큰이 없으면 로그인 페이지로 이동
    redirect("/login");
  }
}
