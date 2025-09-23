"use client";

import { ANIMATION_DURATION, COLORS, EXTERNAL_URLS, GLOBE_CONFIG } from "@/constants/globe";
import { GLOBE_SIZE_LIMITS, VIEWPORT_DEFAULTS, ZOOM_LEVELS } from "@/constants/zoomLevels";
import { useHtmlElements } from "@/hooks/useHtmlElements";
import { createGlobeImageUrl } from "@/utils/globeImageGenerator";
import { createZoomPreventListeners, getISOCode, getPolygonColor, getPolygonLabel } from "@/utils/globeUtils";
import type { GlobeInstance } from "globe.gl";
import dynamic from "next/dynamic";
import type React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ReactGlobeProps } from "../../types/globe";
import { renderHtmlElement } from "./htmlElementRenderer";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

export interface ReactGlobeRef {
  globeRef: React.RefObject<any>;
}

const ReactGlobe = forwardRef<ReactGlobeRef, ReactGlobeProps>(
  (
    {
      travelPatterns,
      currentGlobeIndex,
      selectedCountry,
      onCountrySelect,
      onZoomChange,
      onClusterSelect,
      clusteredData,
      zoomLevel,
      selectedClusterData,
      snapZoomTo,
    },
    ref,
  ) => {
    const globeRef = useRef<GlobeInstance | null>(null);
    const activeCountryFlagRef = useRef<string | null>(null);
    const [activeCountryFlag, setActiveCountryFlag] = useState<string | null>(null);
    const [activeCountryItemIdList, setActiveCountryItemIdList] = useState<string[] | null>(null);
    const [countries, setCountries] = useState<any[]>([]);
    const [globeLoading, setGlobeLoading] = useState(true);
    const [globeError, setGlobeError] = useState<string | null>(null);
    const [windowSize, setWindowSize] = useState({
      width: typeof window !== "undefined" ? window.innerWidth : VIEWPORT_DEFAULTS.WIDTH,
      height: typeof window !== "undefined" ? window.innerHeight : VIEWPORT_DEFAULTS.HEIGHT,
    });
    const currentPattern = travelPatterns[currentGlobeIndex];

    // 부모 컴포넌트에 globeRef 노출
    useImperativeHandle(ref, () => ({
      globeRef,
    }));

    // Figma 디자인에서 지구본 그라디언트 텍스처 생성
    const globeImageUrl = useMemo(() => createGlobeImageUrl(), []);
    const [displayPhase, setDisplayPhase] = useState<"root" | "country" | "city">("root");
    const [isAnimating, setIsAnimating] = useState(false);
    const phaseTargetRef = useRef<"root" | "country" | "city" | null>(null);
    const prevZoomRef = useRef<number | null>(null);

    // ISO 코드 매핑 함수
    const getISOCodeMapped = useCallback(getISOCode, []);

    // 국가 데이터 로드
    useEffect(() => {
      const loadCountries = async () => {
        try {
          setGlobeLoading(true);
          setGlobeError(null);

          const response = await fetch(EXTERNAL_URLS.WORLD_GEOJSON);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const countriesData = await response.json();
          const features = countriesData?.features || [];

          setCountries(features);
          setGlobeLoading(false);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setGlobeError(`국가 데이터 로드 실패: ${errorMessage}`);
          setGlobeLoading(false);
          setCountries([]);
        }
      };

      loadCountries();
    }, []);

    // 폴리곤 색상 계산 함수
    const getPolygonColorMapped = useCallback(
      (feature: any) => getPolygonColor(feature, currentPattern.countries, getISOCodeMapped),
      [currentPattern.countries, getISOCodeMapped],
    );

    // 폴리곤 레이블 함수
    const getPolygonLabelMapped = useCallback(
      (feature: any) => getPolygonLabel(feature, currentPattern.countries, getISOCodeMapped),
      [currentPattern.countries, getISOCodeMapped],
    );

    // 폴리곤 클릭 핸들러
    const handlePolygonClick = useCallback(
      (polygon: any) => {
        const countryISOCode = polygon.properties?.ISO_A3 || polygon.id;
        const clickedCountry = currentPattern.countries.find((c: any) => getISOCodeMapped(c.id) === countryISOCode);
        if (clickedCountry) {
          onCountrySelect(clickedCountry.id);

          // 선택된 국가로 카메라 이동
          if (globeRef.current) {
            globeRef.current.pointOfView(
              {
                lat: clickedCountry.lat,
                lng: clickedCountry.lng,
                altitude: 1.5,
              },
              1000,
            );
          }
        }
      },
      [currentPattern.countries, getISOCodeMapped, onCountrySelect],
    );

    // HTML 요소 데이터
    const htmlElements = useHtmlElements({
      isAnimating,
      displayPhase,
      phaseTargetRef,
      prevZoomRef,
      zoomLevel,
      selectedClusterData: selectedClusterData || null,
      clusteredData,
      currentPatternCountries: currentPattern.countries,
    });

    // HTML 요소 렌더링 함수
    const getHtmlElement = useCallback(
      (d: any) => {
        return renderHtmlElement({
          d,
          htmlElements,
          zoomLevel,
          globeRef,
          displayPhase,
          isAnimating,
          phaseTargetRef,
          setActiveCountryFlag,
          activeCountryFlagRef,
          setActiveCountryItemIdList,
          setDisplayPhase,
          setIsAnimating,
          onClusterSelect,
          onZoomChange,
          onCountrySelect,
        });
      },
      [htmlElements, zoomLevel, displayPhase, isAnimating, onClusterSelect, onZoomChange, onCountrySelect],
    );

    // 줌 변경 감지
    const handleZoomChange = useCallback(
      (pov: any) => {
        if (pov && typeof pov.altitude === "number") {
          let newZoom = pov.altitude;

          if (newZoom < GLOBE_CONFIG.MIN_ZOOM) {
            newZoom = GLOBE_CONFIG.MIN_ZOOM;
            if (globeRef.current) {
              globeRef.current.pointOfView({ altitude: GLOBE_CONFIG.MIN_ZOOM }, 0);
            }
          } else if (newZoom > GLOBE_CONFIG.MAX_ZOOM) {
            newZoom = GLOBE_CONFIG.MAX_ZOOM;
            if (globeRef.current) {
              globeRef.current.pointOfView({ altitude: GLOBE_CONFIG.MAX_ZOOM }, 0);
            }
          }

          // 외부에서 스냅 지시가 있으면 해당 값으로 고정
          if (typeof snapZoomTo === "number") {
            newZoom = snapZoomTo;
            if (globeRef.current) {
              globeRef.current.pointOfView({ altitude: newZoom }, 0);
            }
          }

          // 줌 아웃 시 단계별 뷰 변경 및 선택 초기화
          if (!isAnimating && displayPhase === "city" && newZoom > ZOOM_LEVELS.RENDERING.CITY_TO_COUNTRY) {
            setDisplayPhase("country");
          }
          if (!isAnimating && newZoom > ZOOM_LEVELS.RENDERING.COUNTRY_TO_ROOT) {
            setDisplayPhase("root");
          }
          if (!isAnimating && newZoom > ZOOM_LEVELS.RENDERING.COUNTRY_MIN) {
            setActiveCountryItemIdList(null);
            setActiveCountryFlag(null);
            activeCountryFlagRef.current = null;
          }

          // 히스테리시스를 위한 이전 값 저장
          prevZoomRef.current = newZoom;
          onZoomChange(newZoom);
        }
      },
      [onZoomChange, snapZoomTo, displayPhase, isAnimating],
    );

    // 윈도우 리사이즈 감지
    useEffect(() => {
      if (typeof window === "undefined") return;

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 브라우저 줌 방지 및 Globe 초기 설정
    useEffect(() => {
      if (typeof window === "undefined") return;

      const timer = setTimeout(() => {
        if (globeRef.current && !globeLoading) {
          globeRef.current.pointOfView({ altitude: GLOBE_CONFIG.INITIAL_ALTITUDE }, ANIMATION_DURATION.INITIAL_SETUP);

          if (globeRef.current.controls) {
            globeRef.current.controls().minDistance = GLOBE_CONFIG.MIN_DISTANCE;
            globeRef.current.controls().maxDistance = GLOBE_CONFIG.MAX_DISTANCE;
          }
        }
      }, ANIMATION_DURATION.SETUP_DELAY);

      const { preventZoom, preventKeyboardZoom, preventTouchZoom } = createZoomPreventListeners();

      document.addEventListener("wheel", preventZoom, { passive: false });
      document.addEventListener("keydown", preventKeyboardZoom);
      document.addEventListener("touchstart", preventTouchZoom, {
        passive: false,
      });

      return () => {
        document.removeEventListener("wheel", preventZoom);
        document.removeEventListener("keydown", preventKeyboardZoom);
        document.removeEventListener("touchstart", preventTouchZoom);
        clearTimeout(timer);
      };
    }, [globeLoading]);

    // 초기 시점 설정 (클라이언트에서만)
    useEffect(() => {
      if (!globeRef.current || globeLoading || countries.length === 0) return;

      // 지구본이 완전히 로드된 후 초기 시점 설정
      setTimeout(() => {
        if (globeRef.current && typeof window !== "undefined") {
          globeRef.current.pointOfView({
            altitude: GLOBE_CONFIG.INITIAL_ALTITUDE,
          });
        }
      }, ANIMATION_DURATION.SETUP_DELAY);
    }, [globeLoading, countries]);

    if (globeLoading) {
      return <div className="text-text-secondary text-sm">🌍 지구본 로딩 중...</div>;
    }

    if (globeError) {
      return (
        <div
          style={{
            width: GLOBE_CONFIG.WIDTH,
            height: GLOBE_CONFIG.HEIGHT,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "14px",
            textAlign: "center",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div>⚠️ 지구본 로딩 실패</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>인터넷 연결을 확인해주세요</div>
        </div>
      );
    }

    return (
      <Globe
        ref={globeRef}
        width={Math.min(GLOBE_SIZE_LIMITS.MAX_WIDTH, windowSize.width)}
        height={Math.min(GLOBE_SIZE_LIMITS.MAX_WIDTH, windowSize.width)}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={globeImageUrl}
        showAtmosphere={true}
        atmosphereColor={COLORS.ATMOSPHERE}
        atmosphereAltitude={GLOBE_CONFIG.ATMOSPHERE_ALTITUDE}
        polygonsData={countries}
        polygonCapColor={getPolygonColorMapped}
        polygonSideColor={() => COLORS.POLYGON_SIDE}
        polygonStrokeColor={() => COLORS.POLYGON_STROKE}
        polygonAltitude={GLOBE_CONFIG.POLYGON_ALTITUDE}
        polygonLabel={getPolygonLabelMapped}
        onPolygonClick={handlePolygonClick}
        htmlElementsData={htmlElements}
        htmlElement={getHtmlElement}
        htmlAltitude={() => 0}
        enablePointerInteraction={true}
        onZoom={handleZoomChange}
      />
    );
  },
);

ReactGlobe.displayName = "ReactGlobe";

export default ReactGlobe;
