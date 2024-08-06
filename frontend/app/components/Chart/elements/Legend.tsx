import { SeriesType } from "../types";
import { Text } from "@/components/ui/Typography";
import cx from "classnames";

export const MultiSeriesLegend: React.FC<{
  data: { label: string; color: string; type: SeriesType }[];
}> = ({ data }) => {
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
            className="w-4 h-1  rounded-sm"
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
    }
  };

  return (
    <div className="flex gap-8">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {leadingIcon(item.type, item.color)}
          <Text className=" text-neutral-200 text-basic-10-auto-regular">
            {item.label}
          </Text>
        </div>
      ))}
    </div>
  );
};

export type LegendPosition = "top" | "bottom" | "left" | "right";

type LegendDataType = { label: string; value: string; color: string };

export const PieChartLegend: React.FC<{
  data: { label: string; value: string; color: string }[];
  position: LegendPosition;
}> = ({ data, position }) => {
  const isHorizontal = position === "top" || position === "bottom";

  return (
    <div
      className={`flex items-center justify-center ${isHorizontal ? "h-full w-fit" : "w-full h-fit"}`}
    >
      <ul
        className={cx(
          "grid",
          {
            "grid-cols-2": !isHorizontal,
            " grid-flow-col grid-rows-2": isHorizontal,
          },
          "gap-6",
          "w-full h-full"
        )}
      >
        {data.map((item, index) => (
          <li key={index} className="flex flex-row gap-2">
            <div
              className="w-1 h-full rounded-sm"
              style={{ background: item.color }}
            />
            <div className="flex flex-col">
              <Text className="text-basic-10-145-regular text-neutral-600 dark:text-neutral-200">
                {item.label}
              </Text>
              <Text className="text-basic-14-150-regular text-neutral-800 dark:text-neutral-600">
                {item.value}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
