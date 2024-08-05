import React from "react";
import { Icon } from "@/components/ui/Icon";

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className=" flex flex-row items-center w-full justify-center p-2">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="enabled:hover:text-green-primary enabled:dark:hover:text-green-primary-dark disabled:text-neutral-400 disabled:dark:text-neutral-700"
      >
        <Icon name="ExpandLeft" className="w-[18px] h-[18px]" />
      </button>
      <span className="flex flex-row gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .reduce((result: (number | string)[], page) => {
            if (
              page === 1 ||
              page === currentPage ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              if (
                result.length === 0 ||
                page === (result[result.length - 1] as number) + 1
              ) {
                result.push(page);
              } else {
                result.push("...", page);
              }
            }
            return result;
          }, [])
          .map((page, index) => {
            if (typeof page === "string") {
              return (
                <span
                  className="text-basic-12-auto-regular"
                  key={`ellipsis-${index}`}
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={
                  "px-[10px] py-[3px] rounded-sm text-center transition-colors duration-200 text-basic-12-auto-regular" +
                  (page === currentPage
                    ? " bg-green-primary dark:bg-green-primary-dark text-white dark:text-black cursor-not-allowed"
                    : "  hover:bg-neutral-200 hover:dark:bg-neutral-900")
                }
              >
                {page}
              </button>
            );
          })}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="enabled:hover:text-green-primary enabled:dark:hover:text-green-primary-dark disabled:text-neutral-400 disabled:dark:text-neutral-700"
      >
        <Icon name="ExpandLeft" className="rotate-180 w-[18px] h-[18px]" />
      </button>
    </div>
  );
};
