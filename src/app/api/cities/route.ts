import { NextRequest, NextResponse } from "next/server";
import { CityApiResponse, CityApiParams, City } from "@/types/city";
import { transformApiDataToCity } from "@/utils/countryFlagMapping";
import { env } from "@/config/env";

const API_BASE_URL = env.API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // API 라우트에서 직접 외부 API 호출
    const searchParamsObj = new URLSearchParams();

    if (limit) {
      searchParamsObj.append("limit", limit);
    }
    if (offset) {
      searchParamsObj.append("offset", offset);
    }

    const url = `${API_BASE_URL}/cities/favorites?${searchParamsObj.toString()}`;

    console.log(`API Route calling: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CityApiResponse = await response.json();

    // API 응답 데이터를 프론트엔드 City 타입으로 변환
    const cities: City[] = data.cityResponseList.map(transformApiDataToCity);

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
