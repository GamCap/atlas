import { Column } from "./types";
import { TableRow } from "./TableRow";

interface TableBodyProps {
  data: any[];
  columns: Column[];
  visibleColumns: string[];
}

export const TableBody: React.FC<TableBodyProps> = ({
  data,
  columns,
  visibleColumns,
}) => {
  return (
    <tbody className="h-full overflow-y-auto text-basic-12-auto-regular">
      {data.map((item, index) => (
        <TableRow
          key={index}
          item={item}
          columns={columns}
          visibleColumns={visibleColumns}
        />
      ))}
    </tbody>
  );
};
