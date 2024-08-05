import { CalendarHeatmapData, HeatmapData, SeriesType } from "../types";
import { Text } from "@/components/ui/Typography";

const CalendarTooltipRenderer: React.FC<{
  data: CalendarHeatmapData;
  color: string;
  label?: string;
}> = ({ data, color, label = "" }) => {
  // format date to look like 18 Jan 2022
  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  return (
    <div className="bg-white shadow-small-elements rounded-sm p-3">
      <div className={`flex flex-col gap-2 items-center justify-center`}>
        <div className="flex flex-row gap-1 items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white dark:bg-black">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
          </div>
          <div className="text-[11px] font-bold text-neutral-800">
            {formatDate(data.date)}
          </div>
        </div>
        <div className="text-[11px] font-bold text-neutral-800">
          {"Change: "}
          {data.change.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
        <p className="text-[11px] font-bold text-neutral-800">
          {"Insert Count: "}
          {data.counts.insert.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className="text-[11px] font-bold text-neutral-800">
          {"Remove Count: "}
          {data.counts.remove.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      </div>
    </div>
  );
};

const HeatmapTooltipRenderer: React.FC<{
  data: HeatmapData;
  color: string;
}> = ({ data, color }) => (
  <div className="bg-white  shadow-small-elements rounded-sm p-3">
    <div className="flex flex-row gap-4 items-center justify-center">
      <div className="flex flex-row gap-1 items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white dark:bg-black">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: color,
            }}
          />
        </div>
        <Text className=" text-[11px] font-bold text-neutral-800 ">
          {data.x}
        </Text>
      </div>
      <Text className=" text-[11px] font-bold text-neutral-800 ">
        {data.value}
      </Text>
    </div>
  </div>
);

const MultiSeriesTooltipRenderer: React.FC<{
  data: {
    x: number;
    tooltipData: {
      name: string;
      value: number;
      color: string;
      type: SeriesType;
    }[];
  };
  format: {
    x: (value: number) => string;
    y: (value: number) => string;
  };
}> = ({ data, format }) => {
  const leadingIcon = (type: SeriesType, color: string) => {
    switch (type) {
      case "line":
        return (
          <div
            className="w-4 h-0.5 rounded-sm transform"
            style={{
              backgroundColor: color,
            }}
          />
        );
      case "bar":
        return (
          <div
            className="w-4 h-1 rounded-sm"
            style={{
              backgroundColor: color,
            }}
          />
        );
      case "scatter":
        return (
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: color,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-small-elements rounded-sm p-3">
      <div className="text-[11px] font-bold text-neutral-800">
        {format.x(data.x)}
      </div>
      <div className="flex flex-col gap-2">
        {data.tooltipData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-4 flex items-center justify-center">
              {leadingIcon(item.type, item.color)}
            </div>
            <div className="text-[11px] font-bold text-neutral-800">
              {item.name}: {format.y(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PieTooltipRenderer: React.FC<{
  data: {
    label: string;
    value: string;
  };
}> = ({ data }): JSX.Element => (
  <div className="bg-white  shadow-small-elements rounded-sm p-3">
    <Text className=" text-[11px] font-bold text-neutral-800 ">
      {data.value}
    </Text>
  </div>
);

export {
  CalendarTooltipRenderer,
  HeatmapTooltipRenderer,
  MultiSeriesTooltipRenderer,
  PieTooltipRenderer,
};
