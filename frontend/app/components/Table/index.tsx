"use client";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";
import { TableColumnVisibility } from "./TableColumnVisibility";
import { useState } from "react";
import { sortData } from "./tableUtils";
import Fuse, { IFuseOptions } from "fuse.js";

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  renderer?: (value: any) => React.ReactNode;
}

export interface TableProps {
  data: any[];
  columns: Column[];
  pageSize?: number;
}

export const Table: React.FC<TableProps> = ({
  data,
  columns,
  pageSize = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((column) => column.id)
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "desc") {
        setSortColumn(null);
      }
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    if (query === searchQuery) return;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    if (visible) {
      setVisibleColumns([...visibleColumns, columnId]);
    } else {
      setVisibleColumns(visibleColumns.filter((id) => id !== columnId));
    }
  };

  const fuseOptions: IFuseOptions<any> = {
    keys: columns.map((column) => column.id),
    threshold: 0.3,
    ignoreLocation: true,
  };

  const fuse = new Fuse(data, fuseOptions);

  const filteredData = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : data;

  const sortedData = sortColumn
    ? sortData(filteredData, sortColumn, sortDirection)
    : filteredData;

  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full h-full flex flex-col dark:text-neutral-300 text-neutral-800">
      <div className=" shrink-0 flex flex-row justify-between items-center">
        <TableSearch onSearch={handleSearch} />
        <TableColumnVisibility
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      </div>
      <div className="w-full h-full flex-1 overflow-y-scroll scrollbar">
        <table className="w-full">
          <TableHeader
            columns={columns}
            visibleColumns={visibleColumns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <TableBody
            data={paginatedData}
            columns={columns}
            visibleColumns={visibleColumns}
          />
        </table>
      </div>
      <div className="shrink-0">
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={filteredData.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
