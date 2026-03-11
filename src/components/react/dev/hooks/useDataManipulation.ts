import { useState, useMemo, useCallback } from "react";

interface UseDataManipulationProps {
  data: Record<string, unknown>[];
  itemsPerPage: number;
}

interface DataManipulationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  filterColumn: string | null;
  setFilterColumn: (column: string | null) => void;
  resetPagination: () => void;
  getFilteredData: () => Record<string, unknown>[];
  getPaginatedData: () => Record<string, unknown>[];
  getTotalPages: () => number;
}

/**
 * Custom hook for data filtering, sorting, and pagination logic
 * Memoizes expensive operations for performance optimization
 */
export function useDataManipulation({
  data,
  itemsPerPage,
}: UseDataManipulationProps): DataManipulationReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState("");
  const [filterColumn, setFilterColumn] = useState<string | null>(null);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const getFilteredData = useCallback((): Record<string, unknown>[] => {
    if (!filterText || !filterColumn) return data;

    return data.filter((row) => {
      const value = row[filterColumn];
      return String(value).toLowerCase().includes(filterText.toLowerCase());
    });
  }, [data, filterText, filterColumn]);

  // Memoize filtered data to avoid recalculating on every render
  const filteredData = useMemo(() => getFilteredData(), [getFilteredData]);

  const getPaginatedData = useCallback((): Record<string, unknown>[] => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filteredData.slice(startIdx, endIdx);
  }, [filteredData, currentPage, itemsPerPage]);

  const getTotalPages = useCallback((): number => {
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    filterText,
    setFilterText,
    filterColumn,
    setFilterColumn,
    resetPagination,
    getFilteredData,
    getPaginatedData,
    getTotalPages,
  };
}
