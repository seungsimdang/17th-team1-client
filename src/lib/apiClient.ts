import { env } from "@/config/env";

// 기본 API 클라이언트 설정
const API_BASE_URL = env.API_BASE_URL;

// API 에러 타입
export class ApiError extends Error {
  constructor(message: string, public status: number, public endpoint: string) {
    super(message);
    this.name = "ApiError";
  }
}

// 공통 헤더 설정
const getDefaultHeaders = () => ({
  accept: "*/*",
  "Content-Type": "application/json",
});

// 인증이 필요한 경우의 헤더 (향후 토큰 추가 시 사용)
const getAuthHeaders = (token?: string) => ({
  ...getDefaultHeaders(),
  ...(token && { Authorization: `Bearer ${token}` }),
});

// GET 요청
export const apiGet = async <T = any>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
  token?: string
): Promise<T> => {
  try {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}${endpoint}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      // 서버 사이드에서 더 안정적인 요청을 위한 옵션
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API GET Error (${endpoint}):`, error);
    throw error;
  }
};

// POST 요청
export const apiPost = async <T = any>(
  endpoint: string,
  data?: any,
  token?: string
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    throw error;
  }
};

// PUT 요청
export const apiPut = async <T = any>(
  endpoint: string,
  data?: any,
  token?: string
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API PUT Error (${endpoint}):`, error);
    throw error;
  }
};

// DELETE 요청
export const apiDelete = async <T = any>(
  endpoint: string,
  token?: string
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API DELETE Error (${endpoint}):`, error);
    throw error;
  }
};
