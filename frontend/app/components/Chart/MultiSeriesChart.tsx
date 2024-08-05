"use client";
import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { createRoot, Root } from "react-dom/client";
import { Axis } from "./elements/Axis";
import {
  BarSeries,
  LineSeries,
  ScatterSeries,
  Series,
  SeriesType,
} from "./types";
import { Line } from "./elements/Line";
import { Bar } from "./elements/Bar";
import { Scatter } from "./elements/Scatter";
import { createPortal } from "react-dom";
import useChartColors from "@/hooks/useChartColors";
import useResizeObserver from "@/hooks/useResizeObserver";
import { MultiSeriesTooltipRenderer as defaultTooltipRenderer } from "./elements/TooltipRenderer";

export interface MultiSeriesChartProps {
  data: Series[];
  margin?: { top: number; right: number; bottom: number; left: number };
  themeColors?: {
    dark: string[];
    light: string[];
    hoverDark: string;
    hoverLight: string;
  };
  vertical?: boolean;
  tooltipRenderer?: (data: {
    data: {
      x: number;
      tooltipData: {
        name: string;
        value: number;
        color: string;
        type: SeriesType;
      }[];
    };
  }) => JSX.Element;
  gridConfig?: {
    horizontal?: {
      show: boolean;
      dashed: boolean;
    };
    vertical?: {
      show: boolean;
      dashed: boolean;
    };
  };
  axisFormat?: {
    x?: (value: number | string) => string;
    y?: (value: number | string) => string;
  };
  axisTicks?: {
    x?: number;
    y?: number;
  };
  shouldFormatTooltip?: {
    x?: boolean;
    y?: boolean;
  };
}

const defaultMargin = { top: 20, right: 20, bottom: 30, left: 40 };

export const MultiSeriesChart: React.FC<MultiSeriesChartProps> = ({
  data,
  margin = defaultMargin,
  themeColors,
  vertical = false,
  tooltipRenderer = defaultTooltipRenderer,
  gridConfig,
  axisFormat,
  axisTicks,
  shouldFormatTooltip = { x: true, y: true },
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipRoot = useRef<Root | null>(null);
  const { width, height, containerRef } = useResizeObserver<HTMLDivElement>();
  const { colors, hoverColor } = useChartColors(themeColors);

  const linearDomain: [number, number] = useMemo(() => {
    return [
      (d3.min(
        data.flatMap((d) => d.data),
        (d) => d.y
      ) as number) * 0.8,
      (d3.max(
        data.flatMap((d) => d.data),
        (d) => d.y
      ) as number) * 1.2,
    ];
  }, [data]);

  const { bandScale, linearScale } = useMemo(() => {
    const bandScale = vertical
      ? d3
          .scaleBand()
          .domain(data[0].data.map((d) => d.x.toString()))
          .range([height - margin.bottom, margin.top])
          .padding(0.1)
      : d3
          .scaleBand()
          .domain(data[0].data.map((d) => d.x.toString()))
          .range([margin.left, width - margin.right])
          .padding(0.1);

    const linearScale = vertical
      ? d3
          .scaleLinear()
          .domain(linearDomain)
          .range([margin.left, width - margin.right])
      : d3
          .scaleLinear()
          .domain(linearDomain)
          .range([height - margin.bottom, margin.top]);
    return { bandScale, linearScale };
  }, [data, width, height, margin, vertical, linearDomain]);

  const classifiedSeries = useMemo(() => {
    const series = data.map((d, i) => ({
      series: d,
      color: colors[i % colors.length],
      index: i,
    }));
    const classified = series.reduce(
      (acc, curr) => {
        if (curr.series.type === "line") {
          acc.line.push(
            curr as { series: LineSeries; color: string; index: number }
          );
        } else if (curr.series.type === "bar") {
          acc.bar.push(
            curr as { series: BarSeries; color: string; index: number }
          );
        } else if (curr.series.type === "scatter") {
          acc.scatter.push(
            curr as { series: ScatterSeries; color: string; index: number }
          );
        }
        return acc;
      },
      { line: [], bar: [], scatter: [] } as {
        line: { series: LineSeries; color: string; index: number }[];
        bar: {
          series: BarSeries;
          color: string;
          index: number;
        }[];
        scatter: {
          series: ScatterSeries;
          color: string;
          index: number;
        }[];
      }
    );
    return classified;
  }, [data, colors]);

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRoot.current = createRoot(tooltipRef.current);
    }
  }, [tooltipRef, tooltipRoot]);

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);

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

      const onMouseOver = (event: MouseEvent, _d: { x: number; y: number }) => {
        if (tooltipRef.current && tooltipRoot.current) {
          // Highlight the hovered band
          d3.select(event.currentTarget as SVGRectElement).attr(
            "fill",
            hoverColor
          );

          const tooltipData = data
            .map((series, i) => {
              const dataPoint = series.data.find((d) => d.x === _d.x);
              if (!dataPoint) return null;
              return {
                name: series.name,
                value: dataPoint ? dataPoint.y : null,
                color: colors[i % colors.length],
                type: series.type,
              };
            })
            .filter((d) => d !== null) as {
            name: string;
            value: number;
            color: string;
            type: SeriesType;
          }[];

          tooltipRoot.current.render(
            <div>
              {tooltipRenderer({
                data: { x: _d.x, tooltipData: tooltipData },
                format: {
                  x: (value: number) => {
                    if (shouldFormatTooltip.x) {
                      return axisFormat?.x
                        ? axisFormat.x(value)
                        : //seperate number with commas for thousands
                          value
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                    return value
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  },
                  y: (value: number) => {
                    if (shouldFormatTooltip.y) {
                      return axisFormat?.y
                        ? axisFormat.y(value)
                        : //seperate number with commas for thousands
                          value
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                    return value
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  },
                },
              })}
            </div>
          );

          positionTooltip(event);
          tooltipRef.current.style.opacity = "1";
          document.addEventListener("mousemove", handleMouseMove);
        }
      };

      const onMouseOut = (event: MouseEvent) => {
        if (tooltipRef.current && tooltipRoot.current) {
          // Remove highlight from the band
          d3.select(event.currentTarget as SVGRectElement).attr(
            "fill",
            "transparent"
          );

          tooltipRef.current.style.opacity = "0";
          tooltipRoot.current.render(null);
          document.removeEventListener("mousemove", handleMouseMove);
        }
      };

      const bands = svg.select(".bands");

      bands
        .selectAll("rect")
        .data(data[0].data)
        .join("rect")
        .attr("x", (d) =>
          vertical ? margin.left : bandScale(d.x.toString()) || 0
        )
        .attr("y", (d) =>
          vertical ? bandScale(d.x.toString()) || 0 : margin.top
        )
        .attr(
          "width",
          vertical ? width - margin.left - margin.right : bandScale.bandwidth()
        )
        .attr(
          "height",
          vertical ? bandScale.bandwidth() : height - margin.top - margin.bottom
        )
        .attr("fill", "transparent")
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);
    }
  }, [
    data,
    vertical,
    bandScale,
    colors,
    hoverColor,
    width,
    height,
    margin,
    tooltipRenderer,
    axisFormat,
    shouldFormatTooltip,
  ]);

  return (
    <>
      <div
        className="flex w-full h-full items-center justify-center"
        ref={containerRef}
      >
        {width !== 0 && height !== 0 && (
          <svg
            ref={ref}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full"
          >
            <Axis
              scale={vertical ? linearScale : bandScale}
              size={height}
              length={width}
              position={"bottom"}
              vertical={vertical}
              margin={margin}
              gridConfig={
                vertical ? gridConfig?.horizontal : gridConfig?.vertical
              }
              axisFormat={vertical ? axisFormat?.y : axisFormat?.x}
              axisTicks={vertical ? axisTicks?.y : axisTicks?.x}
            />
            <Axis
              scale={vertical ? bandScale : linearScale}
              size={width}
              length={height}
              position={"left"}
              vertical={vertical}
              margin={margin}
              gridConfig={
                vertical ? gridConfig?.vertical : gridConfig?.horizontal
              }
              axisFormat={vertical ? axisFormat?.x : axisFormat?.y}
              axisTicks={vertical ? axisTicks?.x : axisTicks?.y}
            />
            {classifiedSeries.bar.length > 0 && (
              <Bar
                linearScale={linearScale}
                bandScale={bandScale}
                linearDomain={linearDomain}
                data={classifiedSeries.bar}
                width={width}
                height={height}
                margin={margin}
                vertical={vertical}
              />
            )}
            {classifiedSeries.line.length > 0 && (
              <Line
                linearScale={linearScale}
                bandScale={bandScale}
                linearDomain={linearDomain}
                data={classifiedSeries.line}
                width={width}
                height={height}
                margin={margin}
                vertical={vertical}
              />
            )}
            {classifiedSeries.scatter.length > 0 && (
              <Scatter
                linearScale={linearScale}
                bandScale={bandScale}
                data={classifiedSeries.scatter}
                width={width}
                height={height}
                vertical={vertical}
              />
            )}
            <g className="bands" />
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
