"use client";

import dynamic from "next/dynamic";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { CountryData, ReactGlobeProps } from "../types/globe";
import { ANIMATION_DURATION, COLORS, EXTERNAL_URLS, GLOBE_CONFIG } from "./ReactGlobe/constants";
import { createClusterLabelStyles, createSingleLabelStyles } from "./ReactGlobe/styles";
import { createZoomPreventListeners, getISOCode, getPolygonColor, getPolygonLabel } from "./ReactGlobe/utils";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
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
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 600,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const currentPattern = travelPatterns[currentGlobeIndex];

  // Create gradient texture for globe from Figma design
  const globeImageUrl = useMemo(() => {
    if (typeof window === "undefined") return "";

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    // First gradient: Main background (black to #032F59)
    // Based on Figma: gradientHandlePositions [0.5, 0.8113], [0.5, 0.1069], [1.2045, 0.8113]
    const gradient1 = ctx.createRadialGradient(
      256,
      415, // center at 50%, 81.13%
      0, // inner radius
      256,
      415, // outer center
      361, // outer radius (70.45% of 512)
    );
    gradient1.addColorStop(0, "#000000");
    gradient1.addColorStop(1, "#032f59");

    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, 512, 512);

    // Second gradient: White overlay with transparency
    // Based on Figma: gradientHandlePositions [0.5, 0.5], [0.5, 1], [0, 0.5]
    ctx.globalCompositeOperation = "source-over";
    const gradient2 = ctx.createRadialGradient(
      256,
      256, // center at 50%, 50%
      0, // inner radius
      256,
      256, // outer center
      256, // outer radius (50% of 512)
    );
    gradient2.addColorStop(0, "rgba(255, 255, 255, 0.1)"); // 10% opacity
    gradient2.addColorStop(0.1577, "rgba(255, 255, 255, 0)");
    gradient2.addColorStop(0.8361, "rgba(255, 255, 255, 0)");
    gradient2.addColorStop(1, "rgba(255, 255, 255, 0.1)");

    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, 512, 512);

    return canvas.toDataURL();
  }, []);
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
    (feature: any) => getPolygonColor(feature, currentPattern.countries, selectedCountry, getISOCodeMapped),
    [currentPattern.countries, selectedCountry, getISOCodeMapped],
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
    [currentPattern.countries, getISOCode, onCountrySelect],
  );

  // HTML 요소 데이터
  const htmlElements = useMemo(() => {
    if (typeof window === "undefined") return [];

    // During camera animation: freeze labels to previous phase to avoid flicker
    const effectivePhase = isAnimating ? displayPhase : (phaseTargetRef.current ?? displayPhase);

    // Snap back to the last known phase when crossing thresholds via wheel (hysteresis)
    if (!isAnimating && prevZoomRef.current !== null) {
      const prev = prevZoomRef.current;
      const curr = zoomLevel;
      // zooming in
      if (curr < prev) {
        // allow advancing phase only when going in
      } else if (curr > prev) {
        // zooming out: do not advance phase forward
        // phase changes down are handled in zoom handler thresholds
      }
    }

    // Phase-driven rendering to avoid flicker between transitions
    if (effectivePhase === "city") {
      if (selectedClusterData && selectedClusterData.length > 0) {
        return selectedClusterData.map((country) => ({
          ...country,
          items: [country],
          count: 1,
        }));
      }
      // no selection -> fall back to clusters
      return clusteredData;
    }

    if (effectivePhase === "country") {
      // Show clustered view (country-level) regardless of zoom
      return clusteredData;
    }

    // root/default: clustered view
    if (clusteredData.length > 0) {
      return clusteredData;
    }

    return currentPattern.countries.map((country) => ({
      ...country,
      items: [country],
      count: 1,
    }));
  }, [clusteredData, currentPattern.countries, selectedClusterData, displayPhase]);

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
      // ensure positioned container so absolute children (+ button) place correctly
      el.style.position = "relative";
      el.style.zIndex = "999";
      el.style.pointerEvents = "auto";
      el.style.position = "relative";
      el.style.pointerEvents = "auto";
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

        const screenX = (vector.x * renderer.domElement.width) / 2 + renderer.domElement.width / 2;
        const screenY = -(vector.y * renderer.domElement.height) / 2 + renderer.domElement.height / 2;

        return { x: screenX, y: screenY };
      };

      const currentPos = calculateScreenPosition(d.lat, d.lng);

      // 주변 라벨들을 그룹핑하여 균등 각도 배치
      const groupRadius = zoomLevel <= 0.2 ? 120 : 140; // 도시단계에서 조금 더 타이트하게
      const neighbors = htmlElements
        .filter((other) => {
          const otherPos = calculateScreenPosition(other.lat, other.lng);
          const distance = Math.sqrt((currentPos.x - otherPos.x) ** 2 + (currentPos.y - otherPos.y) ** 2);
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
        0,
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
        const styles = createSingleLabelStyles(d, labelIndex, angleOffset, dynamicDistance);
        el.innerHTML = `
          <div style="${styles.centerPoint}"></div>
          <div style="${styles.dottedLine}"></div>
          <div style="${styles.label} position: absolute;">
            <img 
              src="/add_image_btn.svg" 
              alt="add" 
              data-city="${displayName}"
              style="position:absolute; left:0; top:0; transform:translate(-40%,-40%); width:24px; height:24px; cursor:pointer; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); z-index:9999;"
            />
            <span style="font-size: 14px; pointer-events: none;">${displayFlag}</span>
            <span style="pointer-events: none;">${displayName}</span>
          </div>
        `;
        const navigateToMetadata = () => {
          const q = encodeURIComponent(displayName);
          window.location.href = `/image-metadata?city=${q}`;
        };

        const handler = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          navigateToMetadata();
        };
        const bind = () => {
          const node = el.querySelector("img[data-city]") as HTMLImageElement | null;
          if (node) {
            node.onclick = handler;
            node.onerror = () => {
              node.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="%230099ff"/><path d="M24 12v24M12 24h24" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';
            };
            node.addEventListener("mousedown", (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener("pointerdown", (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener("touchstart", (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener("wheel", (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.draggable = false;
          }
        };
        setTimeout(bind, 0);
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

        const rad = (angleOffset * Math.PI) / 180;
        const dist = 120;
        const offsetX = Math.cos(rad) * dist;
        const offsetY = Math.sin(rad) * dist;
        const plus = document.createElement("img");
        plus.src = "/add_image_btn.svg";
        plus.alt = "add";
        plus.setAttribute("data-city", "");
        plus.style.position = "absolute";
        plus.style.width = "42px";
        plus.style.height = "42px";
        plus.style.left = `${offsetX - 60}px`;
        plus.style.top = `${offsetY}px`;
        plus.style.transform = "translate(-50%, -50%)";
        plus.style.cursor = "pointer";
        plus.style.zIndex = "999";
        plus.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.4))";
        plus.addEventListener("click", (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          // cluster 클릭 -> 이미지 메타 페이지로 이동하되 첫번째 아이템 이름 사용
          const name = d.items && d.items[0]?.name ? d.items[0].name.split(",")[0] : "";
          if (name) {
            const q = encodeURIComponent(name);
            window.location.href = `/image-metadata?city=${q}`;
          }
        });
        el.appendChild(plus);
      }

      // 클릭 핸들러
      const handleClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if (!globeRef.current) return;

        const targetLat = d.lat;
        const targetLng = d.lng;

        if (d.count > 1 && d.items && d.items.length > 1) {
          // 클러스터 클릭 시
          const uniqueFlags = new Set((d.items || []).map((it: any) => it.flag));
          const isMultiCountry = uniqueFlags.size > 1;

          // 상태 업데이트를 먼저 실행
          if (isMultiCountry) {
            setActiveCountryFlag(null);
            activeCountryFlagRef.current = null;
            setActiveCountryItemIdList(null);
            setDisplayPhase("country");
          } else if (d.flag) {
            setActiveCountryFlag(d.flag);
            activeCountryFlagRef.current = d.flag;
            const ids = (d.items || []).map((it: any) => it.id);
            setActiveCountryItemIdList(ids);
            setDisplayPhase("city");
          }

          // 클러스터 선택 콜백 호출
          if (onClusterSelect) {
            onClusterSelect(d);
          }

          // 타겟 줌 레벨 및 목표 phase 결정
          const targetAltitude = isMultiCountry ? GLOBE_CONFIG.CLUSTER_ZOOM_STAGE1 : GLOBE_CONFIG.CLUSTER_ZOOM;
          phaseTargetRef.current = isMultiCountry ? "country" : "city";

          // 애니메이션 중에는 기존 phase 유지 → 깜빡임 방지
          setIsAnimating(true);
          globeRef.current.pointOfView(
            {
              lat: targetLat,
              lng: targetLng,
              altitude: targetAltitude,
            },
            ANIMATION_DURATION.CAMERA_MOVE,
          );
          setTimeout(() => {
            setIsAnimating(false);
            setDisplayPhase(phaseTargetRef.current || displayPhase);
            phaseTargetRef.current = null;
            onZoomChange(targetAltitude);
          }, ANIMATION_DURATION.CAMERA_MOVE + 30);
        } else {
          // 개별 나라 클릭 시
          if (d.flag) {
            setActiveCountryFlag(d.flag);
            activeCountryFlagRef.current = d.flag;
            if (d.items && d.items.length === 1) {
              setActiveCountryItemIdList([d.items[0].id]);
            }
          }

          // 부드러운 카메라 이동: 목표 phase/zoom을 애니 종료 시 반영
          phaseTargetRef.current = "city";
          setIsAnimating(true);
          globeRef.current.pointOfView(
            {
              lat: targetLat,
              lng: targetLng,
              altitude: GLOBE_CONFIG.FOCUS_ZOOM,
            },
            ANIMATION_DURATION.CAMERA_MOVE,
          );
          setTimeout(() => {
            setIsAnimating(false);
            setDisplayPhase("city");
            phaseTargetRef.current = null;
            onZoomChange(GLOBE_CONFIG.FOCUS_ZOOM);
          }, ANIMATION_DURATION.CAMERA_MOVE + 30);

          // 나라 선택
          const countryId = d.items && d.items.length === 1 ? d.items[0].id : d.id;
          onCountrySelect(countryId);
        }
      };

      el.addEventListener("click", handleClick);
      el.addEventListener("mousedown", handleClick);
      el.onclick = handleClick;

      return el;
    },
    [onCountrySelect, htmlElements, currentPattern.countries, zoomLevel],
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

        // Phase demotion and selection reset on zoom-out
        if (!isAnimating && displayPhase === "city" && newZoom > 0.22) {
          setDisplayPhase("country");
        }
        if (!isAnimating && newZoom > 0.45) {
          setDisplayPhase("root");
        }
        if (!isAnimating && newZoom > 0.3) {
          setActiveCountryItemIdList(null);
          setActiveCountryFlag(null);
          activeCountryFlagRef.current = null;
        }

        // remember for hysteresis
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
      <div className="text-text-secondary text-sm">
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
        <div>⚠️ Globe 로딩 실패</div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>인터넷 연결을 확인해주세요</div>
      </div>
    );
  }

  return (
    <Globe
      ref={globeRef}
      width={Math.min(600, windowSize.width)}
      height={Math.min(800, windowSize.width)}
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
      htmlAltitude={() => GLOBE_CONFIG.HTML_ALTITUDE}
      enablePointerInteraction={true}
      onZoom={handleZoomChange}
    />
  );
};

export default ReactGlobe;
