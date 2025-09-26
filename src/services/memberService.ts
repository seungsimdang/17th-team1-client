import { apiGet, apiPost } from "@/lib/apiClient";
import {
  MemberIdResponse,
  CreateTravelRecordsResponse,
  GlobeResponse,
  TravelInsightResponse,
} from "@/types/member";
import { City } from "@/types/city";
import { convertCitiesToTravelRecords } from "@/utils/travelUtils";
import { getAuthInfo } from "@/utils/cookies";

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
    const { token, memberId } = getAuthInfo();

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

// 지구본 조회 API
export const getGlobeData = async (
  uuid: string
): Promise<GlobeResponse | null> => {
  try {
    const { token } = getAuthInfo();

    if (!token) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const data = await apiGet<GlobeResponse>(
      `/api/v1/globes/${uuid}`,
      {},
      token
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch globe data:", error);
    return null;
  }
};

// AI 인사이트 API
export const getTravelInsight = async (memberId: number): Promise<string> => {
  try {
    const { token } = getAuthInfo();
    if (!token) throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");

    const data = await apiGet<TravelInsightResponse>(
      `/api/v1/travel-insights/${memberId}`,
      {},
      token
    );
    return data.data.title;
  } catch (error) {
    console.error("Failed to fetch travel insight:", error);
    return ""; 
  }
};