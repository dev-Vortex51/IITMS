"use client";

import { useCallback, useEffect, useMemo, useState, type SetStateAction } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UseUrlSearchStateOptions = {
  paramKey?: string;
  defaultValue?: string;
};

export function useUrlSearchState(options: UseUrlSearchStateOptions = {}) {
  const { paramKey = "search", defaultValue = "" } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlValue = useMemo(
    () => searchParams.get(paramKey) ?? defaultValue,
    [defaultValue, paramKey, searchParams],
  );
  const [searchQuery, setSearchQueryState] = useState(urlValue);

  useEffect(() => {
    setSearchQueryState(urlValue);
  }, [urlValue]);

  const updateUrl = useCallback(
    (nextValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const normalized = nextValue.trim();

      if (normalized) {
        params.set(paramKey, normalized);
      } else {
        params.delete(paramKey);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [paramKey, pathname, router, searchParams],
  );

  const setSearchQuery = useCallback(
    (nextValue: SetStateAction<string>) => {
      setSearchQueryState((prevValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (value: string) => string)(prevValue)
            : nextValue;

        updateUrl(resolvedValue);
        return resolvedValue;
      });
    },
    [updateUrl],
  );

  const applySearch = useCallback(
    (value?: string) => updateUrl(value ?? searchQuery),
    [searchQuery, updateUrl],
  );

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
    updateUrl("");
  }, [updateUrl]);

  return {
    searchQuery,
    setSearchQuery,
    applySearch,
    clearSearch,
  };
}
