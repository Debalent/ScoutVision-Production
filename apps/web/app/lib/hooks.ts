// ─── ScoutVision Custom Hooks ───────────────────────────────────────
// Reusable React hooks for common platform patterns

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ─── useDebounce ────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ─── useLocalStorage ────────────────────────────────────────────────

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      }
      return nextValue;
    });
  }, [key]);

  return [storedValue, setValue];
}

// ─── useMediaQuery ──────────────────────────────────────────────────

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// ─── useClickOutside ────────────────────────────────────────────────

export function useClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}

// ─── useKeyboardShortcut ────────────────────────────────────────────

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (options.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (options.shift && !e.shiftKey) return;
      if (options.alt && !e.altKey) return;
      if (options.meta && !e.metaKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}

// ─── usePagination ──────────────────────────────────────────────────

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(page + 1), [page, goToPage]);
  const prevPage = useCallback(() => goToPage(page - 1), [page, goToPage]);

  // Reset to page 1 when items change
  useEffect(() => { setPage(1); }, [items.length]);

  return {
    items: paginatedItems,
    page,
    totalPages,
    totalItems: items.length,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goToPage,
    nextPage,
    prevPage,
  };
}

// ─── useSort ────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export function useSort<T>(items: T[], defaultKey?: keyof T, defaultDir: SortDirection = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultDir);

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const toggleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  return { items: sorted, sortKey, sortDir, toggleSort };
}

// ─── useFilter ──────────────────────────────────────────────────────

export function useFilter<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return items;
    return items.filter((item) => filterFn(item, debouncedQuery));
  }, [items, debouncedQuery, filterFn]);

  return { items: filtered, query, setQuery, resultCount: filtered.length };
}

// ─── useAsyncAction ─────────────────────────────────────────────────

export function useAsyncAction<T, A extends unknown[]>(
  action: (...args: A) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (...args: A) => {
    setLoading(true);
    setError(null);
    try {
      const result = await action(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [action]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}

// ─── useInterval ────────────────────────────────────────────────────

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ─── useOnlineStatus ────────────────────────────────────────────────

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
