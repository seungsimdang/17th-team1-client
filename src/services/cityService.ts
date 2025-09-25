import { CityApiResponse, CityApiParams, City } from "@/types/city";
import { transformApiDataToCity } from "@/utils/countryFlagMapping";
import { apiGet } from "@/lib/apiClient";

/**
 * 도시 목록을 가져오는 API 함수
 * @param params API 요청 파라미터
 * @returns 도시 목록 데이터
 */
export const fetchCities = async (
  params: CityApiParams = {}
): Promise<City[]> => {
  try {
    const data: CityApiResponse = await apiGet<CityApiResponse>(
      "/cities/favorites",
      params
    );

    // API 응답 데이터를 프론트엔드 City 타입으로 변환
    return data.cityResponseList.map(transformApiDataToCity);
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    throw error;
  }
};

/**
 * SSR에서 사용할 도시 목록 가져오기 함수
 * Next.js API 라우트를 통해 프록시하여 호출
 * @param limit 가져올 도시 수 (기본값: 20)
 * @returns 도시 목록 데이터
 */
export const getCitiesForSSR = async (limit: number = 20): Promise<City[]> => {
  try {
    // 서버 사이드에서는 내부 API 라우트를 통해 호출
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/cities?limit=${limit}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.cities || [];
  } catch (error) {
    console.error("SSR fetch failed, returning empty array:", error);
    // SSR에서 API 호출이 실패하면 빈 배열을 반환
    return [];
  }
};
