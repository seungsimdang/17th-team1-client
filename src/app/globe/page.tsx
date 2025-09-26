"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/common/button";
import { GlobeFooter } from "@/components/globe/GlobeFooter";
// Components
import { GlobeHeader } from "@/components/globe/GlobeHeader";
import { GlobeLoading } from "@/components/loading/GlobeLoading";
import type { CountryBasedGlobeRef } from "@/components/react-globe/CountryBasedGlobe";
import { useGlobeState } from "@/hooks/useGlobeState";
import { getGlobeData, getTravelInsight } from "@/services/memberService";
import type { TravelPattern } from "@/types/travelPatterns";
import { getAuthInfo } from "@/utils/cookies";
import { mapGlobeDataToTravelPatterns } from "@/utils/globeDataMapper";

// CountryBasedGlobe을 동적 import로 로드 (SSR 방지)
const CountryBasedGlobe = dynamic(() => import("@/components/react-globe/CountryBasedGlobe"), {
  ssr: false,
  // loading: () => <div>🌍 지구본 생성 중...</div>,
  loading: () => <div></div>,
});

const GlobePrototype = () => {
  const globeRef = useRef<CountryBasedGlobeRef>(null);
  const [travelPatterns, setTravelPatterns] = useState<TravelPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelInsight, setTravelInsight] = useState<string>("");

  // Globe 상태 관리
  const { isZoomed, selectedClusterData, handleClusterSelect, handleZoomChange, resetGlobe } =
    useGlobeState(travelPatterns);

  // 실제 API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const { uuid, memberId } = getAuthInfo();
        if (!uuid || !memberId) {
          return;
        }

        const [globeResponse, insightResponse] = await Promise.all([
          getGlobeData(uuid),
          getTravelInsight(parseInt(memberId, 10)),
        ]);

        if (globeResponse?.data) {
          const mappedPatterns = mapGlobeDataToTravelPatterns(globeResponse.data);
          setTravelPatterns(mappedPatterns);
        }

        setTravelInsight(insightResponse || "");
      } catch {
        // 에러 처리
      }
    };

    // API 데이터 로드
    loadData();
  }, []);

  const hasBackButton = isZoomed || selectedClusterData !== null;

  // 로딩 완료 콜백
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // 로딩 중이거나 데이터가 없는 경우
  if (isLoading) {
    return <GlobeLoading onComplete={handleLoadingComplete} />;
  }

  if (travelPatterns.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="text-white text-xl text-center">
          <div>🌍 여행 데이터가 없습니다</div>
          <div className="text-sm text-gray-400 mt-2">사진을 업로드하여 여행 기록을 만들어보세요</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-text-primary relative font-sans"
      style={{
        height: "100dvh", // Dynamic Viewport Height - 모바일 브라우저의 실제 보이는 영역
      }}
    >
      {/* 상단 헤더 - position absolute */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4">
        <GlobeHeader isZoomed={isZoomed || selectedClusterData !== null} travelInsight={travelInsight} />
      </div>

      {/* Country Based Globe 컴포넌트 - 전체 화면 사용 */}
      <div className="w-full h-full relative">
        <div className="w-full h-full">
          <CountryBasedGlobe
            ref={globeRef}
            travelPatterns={travelPatterns}
            currentGlobeIndex={0}
            onClusterSelect={handleClusterSelect}
            onZoomChange={handleZoomChange}
          />
        </div>
      </div>

      {/* 하단 버튼들 - position absolute */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4">
        <GlobeFooter isZoomed={isZoomed} />
      </div>

      {/* 돌아가기 버튼 */}
      <BackButton isZoomed={hasBackButton} globeRef={globeRef} onReset={resetGlobe} />
    </div>
  );
};

export default GlobePrototype;
