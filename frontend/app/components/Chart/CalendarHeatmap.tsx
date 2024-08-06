"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";
import useResizeObserver from "@/hooks/useResizeObserver";
import { CalendarTooltipRenderer } from "./elements/TooltipRenderer";
import { CalendarHeatmapData } from "./types";
import { useTheme } from "next-themes";

interface CalendarHeatmapProps {
  data: CalendarHeatmapData[];
  tooltipRenderer?: (props: {
    data: CalendarHeatmapData;
    color: string;
    label?: string;
  }) => React.ReactNode;
  themeColors?: {
    dark: { color: string; textColor: string };
    light: { color: string; textColor: string };
  };
  valueLabel?: string;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data,
  tooltipRenderer = CalendarTooltipRenderer,
  themeColors = {
    dark: {
      color: "#00B393",
      textColor: "#ffffff",
    },
    light: {
      color: "#00866E",
      textColor: "#000000",
    },
  },
  valueLabel = "",
}) => {
  const [yearData, setYearData] = useState<{
    [year: string]: CalendarHeatmapData[];
  }>({});
  const [selectedYear, setSelectedYear] = useState<string>();
  const [fullYearData, setFullYearData] = useState<CalendarHeatmapData[]>([]);
  const [originalData, setOriginalData] = useState<CalendarHeatmapData[]>([]);
  const [firstDate, setFirstDate] = useState<Date>();
  const [lastDate, setLastDate] = useState<Date>();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipRoot = useRef<Root | null>(null);
  const { width, height, containerRef } = useResizeObserver<HTMLDivElement>();
  const { theme } = useTheme();
  const color = useMemo(() => {
    return theme === "dark" ? themeColors.dark.color : themeColors.light.color;
  }, [theme, themeColors]);
  const textColor = useMemo(() => {
    return theme === "dark"
      ? themeColors.dark.textColor
      : themeColors.light.textColor;
  }, [theme, themeColors]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOriginalData(data);
  }, [data]);

  useEffect(() => {
    // Group data by year
    if (originalData.length > 0) {
      const groupedData = originalData.reduce(
        (acc, item) => {
          const year = new Date(item.date).getUTCFullYear().toString();
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(item);
          return acc;
        },
        {} as { [year: string]: CalendarHeatmapData[] }
      );

      setYearData(groupedData);
      const yearsKeys = Object.keys(groupedData);
      setSelectedYear(yearsKeys[yearsKeys.length - 1]);
    }
  }, [originalData]);

  useEffect(() => {
    if (selectedYear && yearData[selectedYear]) {
      const yearDataArray = yearData[selectedYear];
      const firstDate = new Date(Math.min(...yearDataArray.map((d) => d.date)));
      const lastDate = new Date(Math.max(...yearDataArray.map((d) => d.date)));

      const dates = d3.timeDay
        .range(firstDate, lastDate)
        .map((d) => d.toISOString().split("T")[0]);

      const response = dates.map((date) => {
        const timestamp = new Date(date).getTime();
        return {
          date: timestamp,
          change: yearDataArray.find((d) => d.date === timestamp)?.change || 0,
          counts: yearDataArray.find((d) => d.date === timestamp)?.counts || {
            insert: 0,
            remove: 0,
          },
        };
      });

      setFullYearData(response);
      setFirstDate(firstDate);
      setLastDate(lastDate);
    }
  }, [selectedYear, yearData]);

  useEffect(() => {
    if (svgRef.current && firstDate && lastDate) {
      if (!tooltipRoot.current && tooltipRef.current) {
        tooltipRoot.current = createRoot(tooltipRef.current);
      }

      const colorScale = d3
        .scaleSequential()
        .domain(d3.extent(data, (d) => d.change) as [number, number])
        .interpolator(
          d3.interpolateRgb(d3.rgb(color).copy({ opacity: 0 }), d3.rgb(color))
        );

      const yearGroups = d3.groups(fullYearData, (d) =>
        new Date(d.date).getUTCFullYear()
      );

      const positionTooltip = (event: MouseEvent) => {
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();

          let tooltipX = event.pageX + 10;
          let tooltipY = event.pageY + 10;

          if (tooltipX + tooltipRect.width > window.innerWidth) {
            tooltipX = event.pageX - tooltipRect.width - 10;
          }

          if (tooltipY + tooltipRect.height > window.innerHeight) {
            tooltipY = event.pageY - tooltipRect.height - 10;
          }

          if (tooltipX < 0) {
            tooltipX = event.pageX + 10;
          }

          if (tooltipY < 0) {
            tooltipY = event.pageY + 10;
          }

          tooltipRef.current.style.transform = `translate(${tooltipX}px, ${tooltipY}px)`;
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        positionTooltip(event);
      };

      const onMouseOver = (event: MouseEvent, d: CalendarHeatmapData) => {
        if (tooltipRef.current && tooltipRoot.current) {
          tooltipRoot.current.render(
            <div>
              {tooltipRenderer({
                data: d,
                color: colorScale(d.change),
                label: valueLabel,
              })}
            </div>
          );
          positionTooltip(event);
          tooltipRef.current.style.opacity = "1";
          document.addEventListener("mousemove", handleMouseMove);
        }
      };

      const onMouseOut = () => {
        if (tooltipRef.current && tooltipRoot.current) {
          tooltipRef.current.style.opacity = "0";
          tooltipRoot.current.render(null);
          document.removeEventListener("mousemove", handleMouseMove);
        }
      };

      const svg = d3.select(svgRef.current);

      const timeWeek = d3.utcSunday;
      const countDay = (i: number) => i;
      const formatDay = (i: number) => "SMTWTFS"[i];
      const formatMonth = d3.utcFormat("%b");

      const dayLabelWidth = 50;
      const marginRight = 50;
      const cw =
        (width - dayLabelWidth - marginRight) /
        (timeWeek.count(firstDate, lastDate) + 1);
      const ch = height / 9;
      const cellWidth = Math.min(cw, ch);
      const cellHeight = Math.min(cw, ch);
      const yearLabelMargin = cellHeight;
      const marginTop = cellHeight + yearLabelMargin;
      const gridWidth = (timeWeek.count(firstDate, lastDate) + 1) * cellWidth;
      const gridHeight = 7 * cellHeight;

      const translateX =
        (width - gridWidth - dayLabelWidth - marginRight) / 2 + dayLabelWidth;
      const translateY = (height - gridHeight + marginTop) / 2;
      const heatmap = svg
        .select(".heatmap")
        .data(yearGroups)
        .attr("transform", `translate(${translateX},${translateY})`);

      // Heatmap rectangles
      heatmap
        .selectAll("rect")
        .data(([, values]) => values)
        .join(
          (enter) => {
            const enterPath = enter
              .append("rect")
              .attr("width", cellWidth - 3)
              .attr("height", cellHeight - 3)
              .attr(
                "x",
                (d) =>
                  timeWeek.count(firstDate, new Date(d.date)) * cellWidth + 0.5
              )
              .attr(
                "y",
                (d) => countDay(new Date(d.date).getUTCDay()) * cellHeight + 0.5
              )
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("fill", (d) => colorScale(d.change))
              .attr("opacity", 0)
              .attr("transform", (d) => {
                const cx =
                  timeWeek.count(firstDate, new Date(d.date)) * cellWidth +
                  cellWidth / 2;
                const cy =
                  countDay(new Date(d.date).getUTCDay()) * cellHeight +
                  cellHeight / 2;
                return `translate(${cx},${cy}) scale(0) translate(${-cx},${-cy})`;
              });

            enterPath
              .transition()
              .duration(500)
              .attr("opacity", 1)
              .attr("transform", (d) => {
                const cx =
                  timeWeek.count(firstDate, new Date(d.date)) * cellWidth +
                  cellWidth / 2;
                const cy =
                  countDay(new Date(d.date).getUTCDay()) * cellHeight +
                  cellHeight / 2;
                return `translate(${cx},${cy}) scale(1) translate(${-cx},${-cy})`;
              });

            return enterPath;
          },
          (update) =>
            update
              .transition()
              .duration(500)
              .attr("fill", (d) => colorScale(d.change))
              .attr("width", cellWidth - 3)
              .attr("height", cellHeight - 3)
              .attr(
                "x",
                (d) =>
                  timeWeek.count(firstDate, new Date(d.date)) * cellWidth + 0.5
              )
              .attr(
                "y",
                (d) => countDay(new Date(d.date).getUTCDay()) * cellHeight + 0.5
              ),
          (exit) => exit.remove()
        )
        .on("mouseover", (event, d) => onMouseOver(event, d))
        .on("mouseleave", onMouseOut);

      // Day labels
      svg
        .select(".day-labels")
        .attr("transform", `translate(${translateX},${translateY})`)
        .selectAll("text")
        .data(d3.range(7))
        .join(
          (enter) => {
            const enterPath = enter
              .append("text")
              .attr("x", -dayLabelWidth / 2)
              .attr("y", (i) => countDay(i + 0.5) * cellHeight)
              .attr("class", "week")
              .style("font-size", "12px")
              .attr("fill", textColor)
              .text(formatDay);
            enterPath
              .attr("opacity", 0)
              .transition()
              .duration(500)
              .attr("opacity", 1);
            return enterPath;
          },
          (update) =>
            update
              .transition()
              .duration(500)
              .attr("fill", textColor)
              .attr("x", -dayLabelWidth / 2)
              .attr("y", (i) => countDay(i + 0.5) * cellHeight)
              .text(formatDay)
        );

      // Month labels
      svg
        .select(".month-labels")
        .attr("transform", `translate(${translateX},${translateY})`)
        .selectAll("text")
        .data(d3.utcMonths(d3.utcMonth(firstDate), lastDate))
        .join(
          (enter) => {
            const enterPath = enter
              .append("text")
              .attr(
                "x",
                (d) =>
                  timeWeek.count(firstDate, timeWeek.ceil(d)) * cellWidth + 2
              )
              .attr("y", -10)
              .attr("class", "month")
              .style("font-size", "12px")
              .attr("fill", textColor)
              .text(formatMonth);

            enterPath
              .attr("opacity", 0)
              .transition()
              .duration(500)
              .attr("opacity", 1);

            return enterPath;
          },

          (update) =>
            update
              .transition()
              .duration(500)
              .attr("fill", textColor)
              .attr(
                "x",
                (d) =>
                  timeWeek.count(firstDate, timeWeek.ceil(d)) * cellWidth + 2
              )
              .attr("y", -10)
              .text(formatMonth)
        );

      // Year Navigation Controls
      const yearLabelGroup = svg
        .selectAll(".year-label")
        .data([selectedYear])
        .join("g")
        .attr("class", "year-label")
        .attr(
          "transform",
          `translate(${translateX},${translateY - yearLabelMargin})`
        );

      const yearKeys = Object.keys(yearData);
      const currentIndex = yearKeys.indexOf(selectedYear!);
      const showPrev = currentIndex > 0;
      const showNext = currentIndex < yearKeys.length - 1;

      yearLabelGroup
        .selectAll(".prev-year")
        .data(showPrev ? [yearKeys[currentIndex - 1]] : [])
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("class", "prev-year")
              .attr("x", -16)
              .attr("y", 0)
              .attr("font-size", 12)
              .attr("fill", textColor)
              .style("cursor", "pointer")
              .text("<")
              .on("click", () => setSelectedYear(yearKeys[currentIndex - 1])),
          (update) => update.transition().duration(500).attr("fill", textColor),
          (exit) => exit.remove()
        );

      yearLabelGroup
        .selectAll(".year-text")
        .data([selectedYear])
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("class", "year-text")
              .attr("x", 20)
              .attr("y", 0)
              .attr("font-size", "12px")
              .attr("fill", textColor)
              .attr("text-anchor", "middle")
              .text(selectedYear || ""),
          (update) =>
            update
              .transition()
              .duration(500)
              .attr("x", 0)
              .attr("y", 0)
              .attr("font-size", "12px")
              .attr("fill", textColor)
              .attr("text-anchor", "left")
              .text(selectedYear || "")
        );

      yearLabelGroup
        .selectAll(".next-year")
        .data(showNext ? [yearKeys[currentIndex + 1]] : [])
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("class", "next-year")
              .attr("x", 37)
              .attr("y", 0)
              .attr("font-size", "12px")
              .attr("fill", textColor)
              .style("cursor", "pointer")
              .text(">")
              .on("click", () => setSelectedYear(yearKeys[currentIndex + 1])),
          (update) => update.transition().duration(500).attr("fill", textColor),
          (exit) => exit.remove()
        );
    }
  }, [
    fullYearData,
    tooltipRenderer,
    themeColors,
    width,
    height,
    data,
    color,
    textColor,
    firstDate,
    lastDate,
    valueLabel,
    yearData,
    selectedYear,
  ]);

  return (
    <div className="w-full h-full" ref={containerRef}>
      {width !== 0 && height !== 0 && selectedYear && (
        <>
          <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`}>
            <g className="heatmap" />
            <g className="day-labels" />
            <g className="month-labels" />
            <g className="year-label" />
          </svg>
        </>
      )}
      {mounted &&
        createPortal(
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
    </div>
  );
};

export default CalendarHeatmap;
