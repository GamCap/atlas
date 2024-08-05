export const sortData = (
  data: any[],
  columnId: string,
  sortDirection: "asc" | "desc"
) => {
  return data.sort((a, b) => {
    const valueA = a[columnId];
    const valueB = b[columnId];

    if (valueA < valueB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
};
