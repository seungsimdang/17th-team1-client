import { useState, useEffect, useCallback, useRef } from "react";
import { City } from "@/types/city";
import { fetchCities } from "@/services/cityService";

interface UseInfiniteScrollOptions {
  initialData?: City[];
  limit?: number;
  throttleDelay?: number;
}

interface UseInfiniteScrollReturn {
  cities: City[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

/**
 * 무한 스크롤을 위한 커스텀 훅
 * 스크롤 이벤트에 스로틀링을 적용하여 성능을 최적화합니다.
 */
export const useInfiniteScroll = ({
  initialData = [],
  limit = 20,
  throttleDelay = 300,
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn => {
  const [cities, setCities] = useState<City[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialData.length);

  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const newCities = await fetchCities({ limit, offset });

      if (newCities.length === 0) {
        setHasMore(false);
      } else {
        setCities((prev) => [...prev, ...newCities]);
        setOffset((prev) => prev + newCities.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cities");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [limit, offset, hasMore]);

  const refresh = useCallback(() => {
    setCities(initialData);
    setOffset(initialData.length);
    setHasMore(true);
    setError(null);
  }, [initialData]);

  // 스크롤 이벤트 핸들러 (스로틀링 적용)
  const handleScroll = useCallback(() => {
    if (throttleTimeoutRef.current) return;

    throttleTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom && hasMore && !isLoading) {
        loadMore();
      }

      throttleTimeoutRef.current = null;
    }, throttleDelay);
  }, [hasMore, isLoading, loadMore, throttleDelay]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return {
    cities,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};
