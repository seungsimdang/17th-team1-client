"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import {
  GLOBE_CONFIG,
  ANIMATION_DURATION,
  COLORS,
  EXTERNAL_URLS,
} from "./ReactGlobe/constants";
import {
  getISOCode,
  getPolygonColor,
  getPolygonLabel,
  createZoomPreventListeners,
} from "./ReactGlobe/utils";
import {
  createSingleLabelStyles,
  createClusterLabelStyles,
} from "./ReactGlobe/styles";
import type { ReactGlobeProps, CountryData } from "../types/globe";
import * as THREE from "three";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: GLOBE_CONFIG.WIDTH,
        height: GLOBE_CONFIG.HEIGHT,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "14px",
      }}
    >
      🌍 Globe 로딩 중...
    </div>
  ),
});

const ReactGlobe: React.FC<ReactGlobeProps> = ({
  travelPatterns,
  currentGlobeIndex,
  selectedCountry,
  onCountrySelect,
  onZoomChange,
  clusteredData,
  shouldShowClusters,
  zoomLevel,
}) => {
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [globeLoading, setGlobeLoading] = useState(true);
  const [globeError, setGlobeError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const currentPattern = travelPatterns[currentGlobeIndex];

  // 클라이언트 마운트 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  // ISO 코드 매핑 함수
  const getISOCodeMapped = useCallback(getISOCode, []);

  // 국가 데이터 로드
  useEffect(() => {
    if (!isMounted) return;

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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setGlobeError(`국가 데이터 로드 실패: ${errorMessage}`);
        setGlobeLoading(false);
        setCountries([]);
      }
    };

    loadCountries();
  }, [isMounted]);

  // 폴리곤 색상 계산 함수
  const getPolygonColorMapped = useCallback(
    (feature: any) =>
      getPolygonColor(
        feature,
        currentPattern.countries,
        selectedCountry,
        getISOCodeMapped
      ),
    [currentPattern.countries, selectedCountry, getISOCodeMapped]
  );

  // 폴리곤 레이블 함수
  const getPolygonLabelMapped = useCallback(
    (feature: any) =>
      getPolygonLabel(feature, currentPattern.countries, getISOCodeMapped),
    [currentPattern.countries, getISOCodeMapped]
  );

  // 폴리곤 클릭 핸들러
  const handlePolygonClick = useCallback(
    (polygon: any) => {
      const countryISOCode = polygon.properties?.ISO_A3 || polygon.id;
      const clickedCountry = currentPattern.countries.find(
        (c: any) => getISOCodeMapped(c.id) === countryISOCode
      );
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
            1000
          );
        }
      }
    },
    [currentPattern.countries, getISOCode, onCountrySelect]
  );

  // HTML 요소 데이터
  const htmlElements = useMemo(() => {
    if (!isMounted) return [];

    if (shouldShowClusters && clusteredData.length > 0) {
      return clusteredData;
    }

    return currentPattern.countries.map((country) => ({
      ...country,
      items: [country],
      count: 1,
    }));
  }, [shouldShowClusters, clusteredData, currentPattern.countries, isMounted]);

  // HTML 요소 렌더링 함수
  const getHtmlElement = useCallback(
    (d: any) => {
      const el = document.createElement("div");
      const labelIndex = htmlElements.findIndex((item) => item.id === d.id);

      // Globe의 현재 카메라 정보를 이용해 화면상 위치 계산
      const calculateScreenPosition = (lat: number, lng: number) => {
        if (!globeRef.current) return { x: 0, y: 0 };

        // Globe 내부 Three.js 카메라 정보 접근
        const globe = globeRef.current;
        const camera = globe.camera();
        const renderer = globe.renderer();

        // 위도/경도를 3D 좌표로 변환
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const radius = 100; // Globe 반지름

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // 3D 좌표를 화면 좌표로 투영
        const vector = new THREE.Vector3(x, y, z);
        vector.project(camera);

        const screenX =
          (vector.x * renderer.domElement.width) / 2 +
          renderer.domElement.width / 2;
        const screenY =
          -(vector.y * renderer.domElement.height) / 2 +
          renderer.domElement.height / 2;

        return { x: screenX, y: screenY };
      };

      const currentPos = calculateScreenPosition(d.lat, d.lng);

      // 다른 라벨들과의 화면상 거리 계산
      const conflicts = htmlElements.filter((other) => {
        if (other.id === d.id) return false;
        const otherPos = calculateScreenPosition(other.lat, other.lng);
        const distance = Math.sqrt(
          Math.pow(currentPos.x - otherPos.x, 2) +
            Math.pow(currentPos.y - otherPos.y, 2)
        );
        return distance < 100;
      });

      // 충돌하는 라벨 수에 따라 각도 조정
      let angleOffset = 0;
      if (conflicts.length > 0) {
        const labelIndex = htmlElements.findIndex((item) => item.id === d.id);

        // 현재 라벨의 전체 인덱스를 사용
        const myIndex = conflicts.filter(
          (conflict) =>
            htmlElements.findIndex((item) => item.id === conflict.id) <
            labelIndex
        ).length;

        angleOffset = myIndex * (360 / (conflicts.length + 1));
      }

      if (d.count === 1 || !d.items || d.items.length === 1) {
        const styles = createSingleLabelStyles(d, labelIndex, angleOffset);
        el.innerHTML = `
          <div style="${styles.centerPoint}"></div>
          <div style="${styles.dottedLine}"></div>
          <div style="${styles.label}">
            <span style="font-size: 14px; pointer-events: none;">${
              d.flag
            }</span>
            <span style="pointer-events: none;">${d.name.split(",")[0]}</span>
          </div>
        `;
      } else {
        const styles = createClusterLabelStyles(d);

        el.innerHTML = `
          <div style="${styles.centerPoint}"></div>
          <div style="${styles.dottedLine}"></div>
          <div style="${styles.label}">
            <span style="font-size: 14px; font-weight: bold; pointer-events: none; margin-right: 8px;">
              ${d.count}개 지역
            </span>
            <span style="font-size: 11px; opacity: 0.8; pointer-events: none;">
              ${d.items
                .slice(0, 2)
                .map((item: any) => item.name.split(",")[0])
                .join(", ")}${d.count > 2 ? " 등" : ""}
            </span>
          </div>
        `;
      }

      // 클릭 핸들러
      const handleClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if (globeRef.current) {
          const targetLat = d.lat;
          const targetLng = d.lng;

          if (d.count > 1 && d.items && d.items.length > 1) {
            globeRef.current.pointOfView(
              {
                lat: targetLat,
                lng: targetLng,
                altitude: GLOBE_CONFIG.CLUSTER_ZOOM,
              },
              ANIMATION_DURATION.CAMERA_MOVE
            );

            setTimeout(() => {
              onZoomChange(GLOBE_CONFIG.CLUSTER_ZOOM);
            }, ANIMATION_DURATION.ZOOM_UPDATE_DELAY);
          } else {
            globeRef.current.pointOfView(
              {
                lat: targetLat,
                lng: targetLng,
                altitude: GLOBE_CONFIG.FOCUS_ZOOM,
              },
              ANIMATION_DURATION.CAMERA_MOVE
            );
          }
        }

        if (d.items && d.items.length > 0) {
          onCountrySelect(d.items[0].id);
        } else {
          onCountrySelect(d.id);
        }
      };

      el.addEventListener("click", handleClick);
      el.addEventListener("mousedown", handleClick);
      el.onclick = handleClick;

      return el;
    },
    [onCountrySelect, htmlElements, currentPattern.countries]
  );

  // 줌 변경 감지
  const handleZoomChange = useCallback(
    (pov: any) => {
      if (pov && typeof pov.altitude === "number") {
        let newZoom = pov.altitude;

        if (newZoom < GLOBE_CONFIG.MIN_ZOOM) {
          newZoom = GLOBE_CONFIG.MIN_ZOOM;
          if (globeRef.current) {
            globeRef.current.pointOfView(
              { altitude: GLOBE_CONFIG.MIN_ZOOM },
              0
            );
          }
        } else if (newZoom > GLOBE_CONFIG.MAX_ZOOM) {
          newZoom = GLOBE_CONFIG.MAX_ZOOM;
          if (globeRef.current) {
            globeRef.current.pointOfView(
              { altitude: GLOBE_CONFIG.MAX_ZOOM },
              0
            );
          }
        }

        onZoomChange(newZoom);
      }
    },
    [onZoomChange]
  );

  // 브라우저 줌 방지 및 Globe 초기 설정
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    const timer = setTimeout(() => {
      if (globeRef.current && !globeLoading) {
        globeRef.current.pointOfView(
          { altitude: GLOBE_CONFIG.INITIAL_ALTITUDE },
          ANIMATION_DURATION.INITIAL_SETUP
        );

        if (globeRef.current.controls) {
          globeRef.current.controls().minDistance = GLOBE_CONFIG.MIN_DISTANCE;
          globeRef.current.controls().maxDistance = GLOBE_CONFIG.MAX_DISTANCE;
        }
      }
    }, ANIMATION_DURATION.SETUP_DELAY);

    const { preventZoom, preventKeyboardZoom, preventTouchZoom } =
      createZoomPreventListeners();

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
  }, [isMounted, globeLoading]);

  // 초기 시점 설정 (클라이언트에서만)
  useEffect(() => {
    if (
      !isMounted ||
      !globeRef.current ||
      globeLoading ||
      countries.length === 0
    )
      return;

    // Globe가 완전히 로드된 후 초기 시점 설정
    setTimeout(() => {
      if (globeRef.current && typeof window !== "undefined") {
        globeRef.current.pointOfView({
          altitude: GLOBE_CONFIG.INITIAL_ALTITUDE,
        });
      }
    }, ANIMATION_DURATION.SETUP_DELAY);
  }, [isMounted, globeLoading, countries]);

  if (!isMounted || globeLoading) {
    return (
      <div
        style={{
          width: GLOBE_CONFIG.WIDTH,
          height: GLOBE_CONFIG.HEIGHT,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "14px",
        }}
      >
        🌍 Globe 로딩 중...
      </div>
    );
  }

  if (globeError) {
    return (
      <div
        style={{
          width: GLOBE_CONFIG.WIDTH,
          height: GLOBE_CONFIG.HEIGHT,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%)",
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
        <div>⚠️ Globe 로딩 실패</div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          인터넷 연결을 확인해주세요
        </div>
      </div>
    );
  }

  return (
    <Globe
      ref={globeRef}
      width={GLOBE_CONFIG.WIDTH}
      height={GLOBE_CONFIG.HEIGHT}
      backgroundColor="rgba(0,0,0,0)"
      backgroundImageUrl={EXTERNAL_URLS.NIGHT_SKY_IMAGE}
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
      htmlAltitude={() => GLOBE_CONFIG.HTML_ALTITUDE}
      enablePointerInteraction={true}
      onZoom={handleZoomChange}
    />
  );
};

export default ReactGlobe;
