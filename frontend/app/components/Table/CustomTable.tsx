"use client";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";
import { TableColumnVisibility } from "./TableColumnVisibility";
import { useState } from "react";
import Fuse, { IFuseOptions } from "fuse.js";
import { sortData } from "./tableUtils";

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  renderer?: (value: any) => React.ReactNode;
}

export interface InjectedProps {
  data: any[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (columnId: string) => void;
  handlePageChange: (page: number) => void;
  handleSearch: (query: string) => void;
}

export interface TableProps extends Partial<InjectedProps> {
  columns: Column[];
}

export const CustomTable: React.FC<TableProps> = ({
  data: initialData = [],
  totalRows: initialTotalRows = 0,
  currentPage: initialCurrentPage = 1,
  pageSize: initialPageSize = 5,
  searchQuery: initialSearchQuery = "",
  sortColumn: initialSortColumn = null,
  sortDirection: initialSortDirection = "asc",
  handleSort: initialHandleSort,
  handlePageChange: initialHandlePageChange,
  handleSearch: initialHandleSearch,
  columns,
}) => {
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortColumn, setSortColumn] = useState<string | null>(
    initialSortColumn
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection
  );
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((column) => column.id)
  );

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
    if (initialHandleSort) initialHandleSort(columnId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (initialHandlePageChange) initialHandlePageChange(page);
  };

  const handleSearch = (query: string) => {
    if (query === searchQuery) return;
    setSearchQuery(query);
    setCurrentPage(1);
    if (initialHandleSearch) initialHandleSearch(query);
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

  const fuse = new Fuse(initialData, fuseOptions);

  const filteredData = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : initialData;

  const sortedData = sortColumn
    ? sortData(filteredData, sortColumn, sortDirection)
    : filteredData;

  const paginatedData = sortedData.slice(
    (currentPage - 1) * initialPageSize,
    currentPage * initialPageSize
  );

  return (
    <div className="w-full h-full flex flex-col dark:text-neutral-300 text-neutral-800">
      <div className="shrink-0 flex flex-row justify-between items-center">
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
          pageSize={initialPageSize}
          totalCount={initialTotalRows}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
