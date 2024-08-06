import React from "react";
import { Column } from "./types";

interface TableCellProps {
  item: any;
  column: Column;
}

export const TableCell: React.FC<TableCellProps> = ({ item, column }) => {
  const value = item[column.id];

  if (column.renderer) {
    return <td>{column.renderer(value)}</td>;
  }

  return <td className="p-2">{value}</td>;
};
