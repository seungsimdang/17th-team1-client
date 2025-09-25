import { apiPost, apiGet } from "@/lib/apiClient";

// 인증 관련 API 서비스
export const authService = {
  // 로그인
  login: async (credentials: { email: string; password: string }) => {
    return apiPost("/auth/login", credentials);
  },

  // 회원가입
  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }) => {
    return apiPost("/auth/register", userData);
  },

  // 토큰 갱신
  refreshToken: async (refreshToken: string) => {
    return apiPost("/auth/refresh", { refreshToken });
  },

  // 로그아웃
  logout: async (token: string) => {
    return apiPost("/auth/logout", {}, token);
  },

  // 사용자 정보 조회
  getProfile: async (token: string) => {
    return apiGet("/auth/profile", undefined, token);
  },
};
