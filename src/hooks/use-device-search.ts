'use client';

import type { DeviceTier } from '@prisma/client';
import { useState, useEffect, useRef } from 'react';

import { useDebounce } from './use-debounce';

interface DeviceResult {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  ramGb: number;
  isPopular: boolean;
}

interface UseDeviceSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: DeviceResult[];
  isSearching: boolean;
  popular: DeviceResult[];
  popularLoading: boolean;
}

const cache = new Map<string, DeviceResult[]>();

export function useDeviceSearch(): UseDeviceSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DeviceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popular, setPopular] = useState<DeviceResult[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Cargar populares al montar
  useEffect(() => {
    fetch('/api/devices?popular=true&limit=12')
      .then((r) => r.json())
      .then((data: { data?: DeviceResult[] }) => setPopular(data.data ?? []))
      .catch(() => {})
      .finally(() => setPopularLoading(false));
  }, []);

  // Buscar al cambiar el query debounced
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const cacheKey = debouncedQuery.toLowerCase();
    if (cache.has(cacheKey)) {
      setResults(cache.get(cacheKey)!);
      setIsSearching(false);
      return;
    }

    // Cancelar request anterior
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);

    fetch(`/api/devices?search=${encodeURIComponent(debouncedQuery)}&limit=20`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { data?: DeviceResult[] }) => {
        const items = data.data ?? [];
        cache.set(cacheKey, items);
        setResults(items);
      })
      .catch(() => {})
      .finally(() => setIsSearching(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  return { query, setQuery, results, isSearching, popular, popularLoading };
}
