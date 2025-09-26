import { apiGet } from "@/lib/apiClient";

// 멤버 ID 조회 API
export const getMemberId = async (token: string): Promise<number> => {
  try {
    const data = await apiGet<{ status: string; data: number }>(
      "/id",
      {},
      token
    );
    return data.data;
  } catch (error) {
    console.error("Failed to fetch member ID:", error);
    throw error;
  }
};
