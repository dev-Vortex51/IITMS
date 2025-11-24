import { useMemo } from "react";

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
  boundaryCount?: number;
}

interface PaginationItem {
  type: "page" | "ellipsis" | "previous" | "next";
  page?: number;
  disabled?: boolean;
  isActive?: boolean;
}

export function usePagination({
  currentPage,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}: UsePaginationProps) {
  const paginationRange = useMemo(() => {
    if (totalPages <= 0) return [];

    const totalPageNumbers = siblingCount + 5; // start ellipsis + end ellipsis + first + last + current

    // Case 1: If the number of pages is less than the page numbers we want to show in our paginationComponent
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but rights dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, "ellipsis", totalPages];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, "ellipsis", ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [
        firstPageIndex,
        "ellipsis",
        ...middleRange,
        "ellipsis",
        lastPageIndex,
      ];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);

  const items: PaginationItem[] = useMemo(() => {
    const result: PaginationItem[] = [];

    // Previous button
    result.push({
      type: "previous",
      disabled: currentPage <= 1,
    });

    // Page numbers and ellipsis
    paginationRange.forEach((pageNumber) => {
      if (pageNumber === "ellipsis") {
        result.push({
          type: "ellipsis",
        });
      } else {
        result.push({
          type: "page",
          page: pageNumber as number,
          isActive: pageNumber === currentPage,
        });
      }
    });

    // Next button
    result.push({
      type: "next",
      disabled: currentPage >= totalPages,
    });

    return result;
  }, [paginationRange, currentPage, totalPages]);

  return items;
}

function range(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

export default usePagination;
