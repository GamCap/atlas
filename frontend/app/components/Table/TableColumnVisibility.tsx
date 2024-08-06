"use client";
import { useState } from "react";
import { Column } from "./types";
import { Button } from "@/components/ui/Button";

interface TableColumnVisibilityProps {
  columns: Column[];
  visibleColumns: string[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export const TableColumnVisibility: React.FC<TableColumnVisibilityProps> = ({
  columns,
  visibleColumns,
  onColumnVisibilityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="active" size="small" onClick={() => setIsOpen(!isOpen)}>
        Columns
      </Button>
      {isOpen && (
        <div className="absolute top-10 w-fit right-0 max-h-40 overflow-y-scroll scrollbar dark:bg-neutral-900 rounded-md bg-neutral-200 z-10">
          {columns.map((column) => (
            <button
              key={column.id}
              className={
                "w-full p-2 text-left text-title-12-auto-regular " +
                (visibleColumns.includes(column.id)
                  ? "bg-green-primary dark:bg-green-primary-dark text-white dark:text-black hover:bg-green-secondary hover:dark:bg-green-secondary-dark"
                  : " hover:bg-neutral-100 dark:hover:bg-neutral-800")
              }
              onClick={() =>
                onColumnVisibilityChange(
                  column.id,
                  !visibleColumns.includes(column.id)
                )
              }
            >
              {column.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
