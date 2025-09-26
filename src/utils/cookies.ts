// 쿠키에서 값을 가져오는 유틸 함수
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value || null;
};

// 쿠키에서 토큰과 멤버 ID를 가져오는 함수
export const getAuthInfo = () => {
  const token = getCookie("kakao_access_token");
  const memberId = getCookie("member_id");
  const uuid = getCookie("uuid");

  return { token, memberId, uuid };
};
