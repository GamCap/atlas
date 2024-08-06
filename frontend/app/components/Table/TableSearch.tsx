import { useEffect, useState } from "react";
import { TextInput } from "@/components/ui/TextInput";

interface TableSearchProps {
  onSearch: (query: string) => void;
}

export const TableSearch: React.FC<TableSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  //debounce search and handle search

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchQuery.length > 0;
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, onSearch]);

  return (
    <div>
      <TextInput
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
};
