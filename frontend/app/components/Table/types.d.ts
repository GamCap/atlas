interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  renderer?: (value: any) => React.ReactNode;
}

interface TableProps {
  data: any[];
  columns: Column[];
  pageSize?: number;
}

export { Column, TableProps };
