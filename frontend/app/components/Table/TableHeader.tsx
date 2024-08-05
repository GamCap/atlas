import React from "react";
import { Column } from "./types";
import { Icon } from "@/components/ui/Icon";

interface TableHeaderProps {
  columns: Column[];
  visibleColumns: string[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (columnId: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  visibleColumns,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  const handleSort = (columnId: string) => {
    if (onSort) {
      onSort(columnId);
    }
  };

  const renderSortIcon = (columnId: string) => {
    if (sortColumn === columnId) {
      return sortDirection === "asc" ? (
        <Icon name="Dropdown" />
      ) : (
        <Icon name="Dropdown" className=" rotate-180" />
      );
    }
    return <Icon name="Sorting" />;
  };

  return (
    <thead>
      <tr className="border-b border-neutral-200 dark:border-neutral-900 text-title-12-17-medium">
        {columns.map((column) => {
          if (visibleColumns.includes(column.id)) {
            return (
              <th
                key={column.id}
                onClick={() => column.sortable && handleSort(column.id)}
                style={{ cursor: column.sortable ? "pointer" : "default" }}
                className="sticky top-0 bg-white dark:bg-black"
              >
                <div className="flex flex-row justify-between items-center gap-1 p-2">
                  <p>{column.label}</p>
                  {column.sortable && (
                    <span style={{ marginLeft: "5px" }}>
                      {renderSortIcon(column.id)}
                    </span>
                  )}
                </div>
              </th>
            );
          }
          return null;
        })}
      </tr>
    </thead>
  );
};
