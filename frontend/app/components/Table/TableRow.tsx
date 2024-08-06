import React from "react";
import { TableCell } from "./TableCell";
import { Column } from "./types";

interface TableRowProps {
  item: any;
  columns: Column[];
  visibleColumns: string[];
}

export const TableRow: React.FC<TableRowProps> = ({
  item,
  columns,
  visibleColumns,
}) => {
  return (
    <tr className=" border-b border-neutral-200 dark:border-neutral-900">
      {columns.map((column) => {
        if (visibleColumns.includes(column.id)) {
          return <TableCell key={column.id} item={item} column={column} />;
        }
        return null;
      })}
    </tr>
  );
};
