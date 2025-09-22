import type { ReactGlobeRef } from "@/components/ReactGlobe";

interface BackButtonProps {
  isZoomed: boolean;
  globeRef: React.RefObject<ReactGlobeRef | null>;
  onReset: () => void;
}

export const BackButton = ({ isZoomed, globeRef, onReset }: BackButtonProps) => {
  const handleBackClick = () => {
    // Globe ref를 통해 직접 카메라 이동
    if (globeRef.current?.globeRef?.current) {
      globeRef.current.globeRef.current.pointOfView({ altitude: 2.5 }, 1000);

      // 애니메이션 완료 후 상태 업데이트
      setTimeout(() => {
        onReset();
      }, 1100); // 애니메이션 시간보다 약간 더 긴 시간
    } else {
      // fallback - ref가 없는 경우 즉시 상태 업데이트
      onReset();
    }
  };

  return (
    <div
      className={`absolute bottom-4 right-4 transition-opacity duration-500 ${isZoomed ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <button
        type="button"
        onClick={handleBackClick}
        className="flex items-center gap-2 bg-surface-placeholder--16 backdrop-blur-sm text-text-primary px-4 py-3 rounded-full font-medium text-sm hover:bg-surface-placeholder--8 transition-all duration-200"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M12 5L5 12L12 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        돌아가기
      </button>
    </div>
  );
};