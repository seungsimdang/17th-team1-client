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
  onClusterSelect,
  clusteredData,
  shouldShowClusters,
  zoomLevel,
  selectedClusterData,
  snapZoomTo,
}) => {
  const globeRef = useRef<any>(null);
  const activeCountryFlagRef = useRef<string | null>(null);
  const [activeCountryFlag, setActiveCountryFlag] = useState<string | null>(null);
  const [activeCountryItemIdList, setActiveCountryItemIdList] = useState<string[] | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [globeLoading, setGlobeLoading] = useState(true);
  const [globeError, setGlobeError] = useState<string | null>(null);
  const currentPattern = travelPatterns[currentGlobeIndex];

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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setGlobeError(`국가 데이터 로드 실패: ${errorMessage}`);
        setGlobeLoading(false);
        setCountries([]);
      }
    };

    loadCountries();
  }, []);

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
    if (typeof window === "undefined") return [];

    // 항상 클러스터링된 데이터 사용 (줌 레벨/선택 상태에 따라 필터)
    if (clusteredData.length > 0) {
      if (selectedClusterData && selectedClusterData.length > 0) {
        const selectedIds = new Set(selectedClusterData.map((c) => c.id));

        // 단계1: 나라 단위 클러스터 라벨만 노출
        if (zoomLevel >= 0.32 && zoomLevel <= 0.7) {
          return clusteredData;
        }

        // 단계2: 선택된 나라의 단일 지역만 노출 → selectedClusterData를 직접 싱글 형태로 변환하여 사용
        return selectedClusterData.map((country) => ({
          ...country,
          items: [country],
          count: 1,
        }));
      }

      // 선택된 클러스터 데이터가 없더라도, 잠긴 국가 정보/ID목록이 있으면 그 나라의 선택된 도시들만 표시
      if (zoomLevel <= 0.25 && (activeCountryFlag || activeCountryFlagRef.current || (activeCountryItemIdList && activeCountryItemIdList.length > 0))) {
        const lockedFlag = activeCountryFlag || activeCountryFlagRef.current;
        const allowedIdSet = activeCountryItemIdList ? new Set(activeCountryItemIdList) : null;

        // ID 목록이 있으면 그 집합만 노출
        if (allowedIdSet && allowedIdSet.size > 0) {
          const baseList = selectedClusterData && selectedClusterData.length > 0
            ? selectedClusterData
            : currentPattern.countries;
          return baseList
            .filter((it: any) => allowedIdSet.has(it.id))
            .map((it: any) => ({ ...it, items: [it], count: 1 }));
        }

        // fallback: 국기 기반
        if (lockedFlag) {
          const base = selectedClusterData && selectedClusterData.length > 0
            ? selectedClusterData
            : clusteredData
                .filter((c: any) => c.count === 1 && c.items && c.items.length === 1)
                .map((c: any) => c.items[0]);
          return base
            .filter((it: any) => it.flag === lockedFlag)
            .map((it: any) => ({ ...it, items: [it], count: 1 }));
        }
      }

      return clusteredData;
    }

    return currentPattern.countries.map((country) => ({
      ...country,
      items: [country],
      count: 1,
    }));
  }, [clusteredData, currentPattern.countries, selectedClusterData, zoomLevel, activeCountryFlag]);

  // HTML 요소 렌더링 함수
  const getHtmlElement = useCallback(
    (d: any) => {
      if (typeof window === "undefined" || !document) {
        // SSR 환경에서는 빈 div 반환
        const el = document.createElement("div");
        el.style.display = "none";
        return el;
      }
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

      // 주변 라벨들을 그룹핑하여 균등 각도 배치
      const groupRadius = zoomLevel <= 0.2 ? 120 : 140; // 도시단계에서 조금 더 타이트하게
      const neighbors = htmlElements
        .filter((other) => {
          const otherPos = calculateScreenPosition(other.lat, other.lng);
          const distance = Math.sqrt(
            Math.pow(currentPos.x - otherPos.x, 2) +
              Math.pow(currentPos.y - otherPos.y, 2)
          );
          return distance < groupRadius;
        })
        .sort((a, b) => {
          // 안정적인 순서를 위해 id 기준 정렬
          const aId = String(a.id);
          const bId = String(b.id);
          return aId < bId ? -1 : aId > bId ? 1 : 0;
        });

      const groupSize = Math.max(neighbors.length, 1);
      const myGroupIndex = Math.max(
        neighbors.findIndex((item) => item.id === d.id),
        0
      );
      const angleStep = 360 / groupSize;
      // 도시(개별) 라벨 단계에서는 거리도 동적 조정 (혼잡할수록 더 밖으로 배치)
      const isCityLevel = d.count === 1;
      const angleOffset = myGroupIndex * angleStep;
      const dynamicDistance = isCityLevel
        ? Math.min(140, 60 + groupSize * 6) // 그룹 크기에 따라 60~140px
        : undefined;

      if (d.count === 1 || !d.items || d.items.length === 1) {
        const baseItem = d.items && d.items.length === 1 ? d.items[0] : d;
        const displayFlag = baseItem.flag ?? d.flag;
        const displayName = (baseItem.name ?? d.name).split(",")[0];
        const styles = createSingleLabelStyles(
          d,
          labelIndex,
          angleOffset,
          dynamicDistance
        );
        el.innerHTML = `
          <div style="${styles.centerPoint}"></div>
          <div style="${styles.dottedLine}"></div>
          <div style="${styles.label}">
            <span style="font-size: 14px; pointer-events: none;">${displayFlag}</span>
            <span style="pointer-events: none;">${displayName}</span>
          </div>
        `;
      } else {
        const styles = createClusterLabelStyles(d, labelIndex, angleOffset);

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

        console.log("클릭 이벤트 발생:", d);
        console.log("클러스터 정보:", { count: d.count, items: d.items?.length });

        if (globeRef.current) {
          const targetLat = d.lat;
          const targetLng = d.lng;

          if (d.count > 1 && d.items && d.items.length > 1) {
            // 클러스터 클릭 시 - 2단계 줌(국가단위 → 도시단위)
            const currentPov = globeRef.current.pointOfView();
            const currentAlt = currentPov && typeof currentPov.altitude === "number" ? currentPov.altitude : undefined;

            // 선택된 클러스터 내 국가가 여러 개인지 확인
            const uniqueFlags = new Set((d.items || []).map((it: any) => it.flag));
            const isMultiCountry = uniqueFlags.size > 1;

            // 단일 국가면 국가 플래그 잠금, 다국가면 잠금 해제
            if (isMultiCountry) {
              setActiveCountryFlag(null);
              activeCountryFlagRef.current = null;
            } else if (d.flag) {
              setActiveCountryFlag(d.flag);
              activeCountryFlagRef.current = d.flag;
            }

            let targetAltitude: number = GLOBE_CONFIG.CLUSTER_ZOOM_STAGE1;
            if (typeof currentAlt === "number") {
              if (isMultiCountry) {
                // 여러 국가가 섞여 있으면 1단계(국가 클러스터)부터 보여주기
                targetAltitude = GLOBE_CONFIG.CLUSTER_ZOOM_STAGE1;
              } else {
                // 단일 국가면 2단계(도시)로 이동
                targetAltitude = GLOBE_CONFIG.CLUSTER_ZOOM;
              }
            }

            if (onClusterSelect) {
              onClusterSelect(d);
            }
            // 국가 클러스터 클릭 시 ID 목록 저장 (단일 국가인 경우에만)
            if (!isMultiCountry) {
              const ids = (d.items || []).map((it: any) => it.id);
              setActiveCountryItemIdList(ids);
            } else {
              setActiveCountryItemIdList(null);
            }

            globeRef.current.pointOfView(
              {
                lat: targetLat,
                lng: targetLng,
                altitude: targetAltitude,
              },
              ANIMATION_DURATION.CAMERA_MOVE
            );

            setTimeout(() => {
              console.log("클러스터 줌 레벨 업데이트:", targetAltitude);
              onZoomChange(targetAltitude);
            }, ANIMATION_DURATION.ZOOM_UPDATE_DELAY);
          } else {
            // 개별 나라 클릭 시 - 가까이 줌인하면서 개별 표시
            console.log("개별 나라 클릭 - 줌 레벨:", GLOBE_CONFIG.FOCUS_ZOOM);
            // 현재 라벨이 국가/도시 라벨이면 국가 플래그 잠금(상태와 ref 모두)
            if (d.flag) {
              setActiveCountryFlag(d.flag);
              activeCountryFlagRef.current = d.flag;
              // 도시 라벨 클릭의 경우 단일 아이템만 유지
              if (d.items && d.items.length === 1) {
                setActiveCountryItemIdList([d.items[0].id]);
              }
            }
            globeRef.current.pointOfView(
              {
                lat: targetLat,
                lng: targetLng,
                altitude: GLOBE_CONFIG.FOCUS_ZOOM,
              },
              ANIMATION_DURATION.CAMERA_MOVE
            );

            setTimeout(() => {
              console.log("개별 나라 줌 레벨 업데이트:", GLOBE_CONFIG.FOCUS_ZOOM);
              onZoomChange(GLOBE_CONFIG.FOCUS_ZOOM);
            }, ANIMATION_DURATION.ZOOM_UPDATE_DELAY);
          }
        }

        // 나라 선택은 단일 아이템일 때만
        if (!(d.count > 1)) {
          const countryId = d.items && d.items.length === 1 ? d.items[0].id : d.id;
          console.log("나라 선택:", countryId);
          onCountrySelect(countryId);
        }
      };

      el.addEventListener("click", handleClick);
      el.addEventListener("mousedown", handleClick);
      el.onclick = handleClick;

      return el;
    },
    [onCountrySelect, htmlElements, currentPattern.countries, zoomLevel]
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

        // 외부에서 스냅 지시가 있으면 해당 값으로 고정
        if (typeof snapZoomTo === 'number') {
          newZoom = snapZoomTo;
          if (globeRef.current) {
            globeRef.current.pointOfView({ altitude: newZoom }, 0);
          }
        }

        onZoomChange(newZoom);
      }
    },
    [onZoomChange, snapZoomTo]
  );

  // 브라우저 줌 방지 및 Globe 초기 설정
  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, [globeLoading]);

  // 초기 시점 설정 (클라이언트에서만)
  useEffect(() => {
    if (
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
  }, [globeLoading, countries]);

  if (globeLoading) {
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
