import { apiPost, apiGet, apiPut, apiDelete } from "@/lib/apiClient";
import { City } from "@/types/city";

// 지구본 관련 API 서비스
export const globeService = {
  // 지구본 생성
  createGlobe: async (selectedCities: City[], token?: string) => {
    return apiPost("/globe/create", { cities: selectedCities }, token);
  },

  // 사용자의 지구본 목록 조회
  getUserGlobes: async (token: string) => {
    return apiGet("/globe/user", undefined, token);
  },

  // 특정 지구본 조회
  getGlobe: async (globeId: string, token?: string) => {
    return apiGet(`/globe/${globeId}`, undefined, token);
  },

  // 지구본 업데이트
  updateGlobe: async (globeId: string, data: any, token: string) => {
    return apiPut(`/globe/${globeId}`, data, token);
  },

  // 지구본 삭제
  deleteGlobe: async (globeId: string, token: string) => {
    return apiDelete(`/globe/${globeId}`, token);
  },

  // 지구본 공유
  shareGlobe: async (globeId: string, token: string) => {
    return apiPost(`/globe/${globeId}/share`, {}, token);
  },
};
