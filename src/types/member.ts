// 멤버 ID 조회 응답
export interface MemberIdResponse {
  status: string;
  data: number;
}

// 여행 기록 생성 API
export interface TravelRecord {
  countryName: string;
  cityName: string;
  lat: number;
  lng: number;
  countryCode: string;
}

// 여행 기록 생성 API 응답
export interface CreateTravelRecordsResponse {
  status: string;
  message: string;
  data?: any;
}
