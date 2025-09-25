// 환경변수 설정
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://globber.store/api/v1",
} as const;
