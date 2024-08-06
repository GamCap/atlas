interface DashboardItemProps {
  children: React.ReactNode;
  title?: string;
  zoomProps?: React.ReactNode;
}
export const DashboardItem = ({
  children,
  title,
  zoomProps,
}: DashboardItemProps) => {
  return (
    <div className="rounded-md bg-white dark:bg-black shadow-sm p-4 w-full h-full flex flex-col gap-2 box-border">
      <div className="flex items-center justify-between sm:px-2 lg:px-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {zoomProps}
      </div>
      <div className="w-full h-full items-center justify-center flex overflow-hidden box-border">
        {children}
      </div>
    </div>
  );
};
