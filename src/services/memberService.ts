import { apiGet, apiPost } from "@/lib/apiClient";
import { MemberIdResponse, CreateTravelRecordsResponse } from "@/types/member";
import { City } from "@/types/city";
import { convertCitiesToTravelRecords } from "@/utils/travelUtils";

// 멤버 ID 조회 API
export const getMemberId = async (token: string): Promise<number> => {
  try {
    const data = await apiGet<MemberIdResponse>("/id", {}, token);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch member ID:", error);
    throw error;
  }
};

// 멤버 여행 기록 생성 API
export const createMemberTravels = async (
  cities: City[]
): Promise<CreateTravelRecordsResponse> => {
  try {
    // 쿠키에서 토큰과 멤버 ID 가져오기
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("kakao_access_token="))
      ?.split("=")[1];

    const memberId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("member_id="))
      ?.split("=")[1];

    if (!token || !memberId) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const travelRecords = convertCitiesToTravelRecords(cities);
    const data = await apiPost<CreateTravelRecordsResponse>(
      `/api/v1/member-travels/${parseInt(memberId)}`,
      travelRecords,
      token
    );
    return data;
  } catch (error) {
    console.error("Failed to create member travels:", error);
    throw error;
  }
};
