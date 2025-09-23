import type { ReactGlobeRef } from "@/components/react-globe/ReactGlobe";

// BackButton Component
export interface BackButtonProps {
  isZoomed: boolean;
  globeRef: React.RefObject<ReactGlobeRef | null>;
  onReset: () => void;
}
