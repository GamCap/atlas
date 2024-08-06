"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import cx from "classnames";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import { PieChartData } from "./types";
import useChartColors from "@/hooks/useChartColors";
import useResizeObserver from "@/hooks/useResizeObserver";
import { PieTooltipRenderer as DefaultTooltipRenderer } from "./elements/TooltipRenderer";

interface ChartConfig {
  width: number;
  height: number;
  innerRadius: number;
  outerRadius: number;
  themeColors: {
    dark: string[];
    light: string[];
    hoverDark: string;
    hoverLight: string;
  };
  cornerRadius: number;
  padAngle: number;
  startAngle: number;
}

const defaultConfig: ChartConfig = {
  width: 250,
  height: 250,
  innerRadius: 60,
  outerRadius: 80,
  themeColors: {
    dark: [
      "#00866e",
      "#1ed1b1",
      "#93e5d7",
      "#b7c7c3",
      "#f9fcfb",
      "#76d0be",
      "#0affd3",
      "#d0fef6",
      "#347467",
    ],
    light: [
      "#00866e",
      "#024c38",
      "#93e5d7",
      "#00b393",
      "#7fc9ba",
      "#3ba272",
      "#0affd3",
      "#b7c7c3",
      "#707d7a",
    ],
    hoverDark: "rgba(255, 255, 255, 0.2)",
    hoverLight: "rgba(0, 0, 0, 0.2)",
  },
  cornerRadius: 5,
  padAngle: 0.01,
  startAngle: -90,
};

export interface PieChartProps {
  data: PieChartData[];
  tooltipRenderer?: ({
    data,
  }: {
    data: {
      label: string;
      value: string;
    };
  }) => JSX.Element;
  valueFormatter?: (value: number, data: PieChartData[]) => string;
  config?: ChartConfig;
}

const DefaultValueFormatter = (value: number, data: PieChartData[]): string => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const percentage = ((value / total) * 100).toFixed(2);
  return `${percentage}%`;
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  tooltipRenderer = DefaultTooltipRenderer,
  valueFormatter = DefaultValueFormatter,
  config = defaultConfig,
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipRoot = useRef<Root | null>(null);
  const hoveredArc = useRef<SVGPathElement | null>(null);
  const { width, height, containerRef } = useResizeObserver<HTMLDivElement>();
  const {
    innerRadius,
    outerRadius,
    themeColors,
    cornerRadius,
    padAngle,
    startAngle,
  } = config;

  const { colors } = useChartColors(themeColors);

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRoot.current = createRoot(tooltipRef.current);
    }
  }, [tooltipRef, tooltipRoot]);

  const currentData = useRef(
    new Map<SVGPathElement, d3.PieArcDatum<{ label: string; value: number }>>()
  );

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);

      const pie = d3
        .pie<{ label: string; value: number }>()
        .value((d) => d.value)
        .padAngle(padAngle)
        .startAngle(startAngle)
        .sort(null);

      const arcGenerator = d3
        .arc<d3.PieArcDatum<{ label: string; value: number }>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(cornerRadius);

      const chartGroup = svg
        .select<SVGGElement>(".chart-group")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const positionTooltip = (event: MouseEvent) => {
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();

          let tooltipX = event.pageX + 10;
          let tooltipY = event.pageY + 10;

          // Check if the tooltip overflows on the right side of the screen
          if (tooltipX + tooltipRect.width > window.innerWidth) {
            tooltipX = event.pageX - tooltipRect.width - 10;
          }

          // Check if the tooltip overflows on the bottom side of the screen
          if (tooltipY + tooltipRect.height > window.innerHeight) {
            tooltipY = event.pageY - tooltipRect.height - 10;
          }

          // Check if the tooltip overflows on the left side of the screen
          if (tooltipX < 0) {
            tooltipX = event.pageX + 10;
          }

          // Check if the tooltip overflows on the top side of the screen
          if (tooltipY < 0) {
            tooltipY = event.pageY + 10;
          }

          tooltipRef.current.style.transform = `translate(${tooltipX}px, ${tooltipY}px)`;
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        positionTooltip(event);
      };

      const onMouseOver = (
        event: MouseEvent,
        d: d3.PieArcDatum<PieChartData>
      ) => {
        const target = event.currentTarget as SVGPathElement;
        const active = d3.active(target);
        if (active) return;
        hoveredArc.current = target;
        const hoverArc = d3
          .arc<d3.PieArcDatum<PieChartData>>()
          .innerRadius(innerRadius - 5)
          .outerRadius(outerRadius + 5)
          .cornerRadius(cornerRadius);

        d3.select(target)
          .transition()
          .duration(250)
          .attr("d", (d) => hoverArc(d as any));

        if (tooltipRef.current && tooltipRoot.current) {
          const tooltipData = valueFormatter(d.data.value, data);

          tooltipRoot.current.render(
            <div>
              {tooltipRenderer({
                data: { label: d.data.label, value: tooltipData || "" },
              })}
            </div>
          );
          positionTooltip(event);
          tooltipRef.current.style.opacity = "1";
          document.addEventListener("mousemove", handleMouseMove);
        }
      };

      const onMouseOut = (
        event: MouseEvent,
        d: d3.PieArcDatum<PieChartData>
      ) => {
        const target = event.currentTarget as SVGPathElement;

        if (target === hoveredArc.current) {
          d3.select(target)
            .interrupt()
            .transition()
            .duration(250)
            .attr("d", (d) => arcGenerator(d as any));

          hoveredArc.current = null;
        }

        if (tooltipRef.current && tooltipRoot.current) {
          tooltipRef.current.style.opacity = "0";
          tooltipRoot.current.render(null);
          document.removeEventListener("mousemove", handleMouseMove);
        }
      };

      chartGroup
        .selectAll<SVGPathElement, d3.PieArcDatum<PieChartData>>(".arc")
        .data(pie(data), (d) => d.data.label)
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("class", "arc")
              .attr("fill", (_, i) => colors[i % colors.length])
              .on("mouseover", onMouseOver)
              .on("mouseout", onMouseOut)
              .transition()
              .duration(1000)
              .attrTween("d", function (d) {
                const interpolate = d3.interpolate(
                  { startAngle: startAngle, endAngle: startAngle },
                  d
                );
                currentData.current.set(this, interpolate(1));
                return function (t) {
                  return arcGenerator(interpolate(t)) || "";
                };
              }),
          (update) =>
            update
              .on("mouseover", onMouseOver)
              .on("mouseout", onMouseOut)
              .transition()
              .duration(500)
              .attr("fill", (_, i) => colors[i % colors.length])
              .attrTween("d", function (d) {
                const currentArc = currentData.current.get(this) || {
                  ...d,
                  startAngle: startAngle,
                  endAngle: startAngle,
                };
                const interpolate = d3.interpolate(currentArc, d);
                currentData.current.set(this, interpolate(1));
                return function (t) {
                  return arcGenerator(interpolate(t)) || "";
                };
              }),
          (exit) =>
            exit
              .transition()
              .duration(500)
              .attrTween("d", function (d, i, arr) {
                const currentArc = currentData.current.get(this);
                const data = Array.from(currentData.current.values());
                const index = data.findIndex((datum) => datum === currentArc);
                const previousArc = index > 0 ? data[index - 1] : null;
                const nextArc =
                  index < data.length - 1 ? data[index + 1] : null;

                let angle;
                if (previousArc) {
                  angle = {
                    ...d,
                    startAngle: previousArc?.endAngle,
                    endAngle: previousArc?.endAngle,
                  };
                } else if (nextArc) {
                  angle = {
                    ...d,
                    startAngle: nextArc.startAngle,
                    endAngle: nextArc.startAngle,
                  };
                } else {
                  angle = {
                    ...d,
                    startAngle: startAngle,
                    endAngle: startAngle,
                  };
                }
                const interpolate = d3.interpolate(currentArc, angle);

                return function (t) {
                  return arcGenerator(interpolate(t)) || "";
                };
              })
              .remove()
        );
    }
  }, [
    data,
    innerRadius,
    outerRadius,
    width,
    height,
    colors,
    tooltipRenderer,
    valueFormatter,
    padAngle,
    startAngle,
    cornerRadius,
  ]);

  return (
    <>
      <div
        className="flex w-full h-full items-center justify-center grow"
        ref={containerRef}
      >
        {width !== 0 && height !== 0 && (
          <svg
            ref={ref}
            viewBox={`0 0 ${width} ${height}`}
            className={cx("h-full w-full")}
          >
            <g className="chart-group" />
          </svg>
        )}
      </div>
      {createPortal(
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0,
            transition: "opacity 0.2s ease-out",
          }}
        />,
        document.body
      )}
    </>
  );
};
