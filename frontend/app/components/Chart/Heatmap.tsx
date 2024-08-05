"use client";
import React, { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { Axis } from "./elements/Axis";
import { useTheme } from "next-themes";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { HeatmapData } from "./types";
import useResizeObserver from "@/hooks/useResizeObserver";
import { HeatmapTooltipRenderer as DefaultTooltipRenderer } from "./elements/TooltipRenderer";

interface HeatmapProps {
  data: HeatmapData[];
  margin?: { top: number; right: number; bottom: number; left: number };
  themeColors?: { dark: { color: string }; light: { color: string } };
  tooltipRenderer?: (props: {
    data: HeatmapData;
    color: string;
  }) => React.ReactNode;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  themeColors = {
    dark: {
      color: "#00B393",
    },
    light: {
      color: "#00866E",
    },
  },
  tooltipRenderer = DefaultTooltipRenderer,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipRoot = useRef<Root | null>(null);
  const { width, height, containerRef } = useResizeObserver<HTMLDivElement>();

  const { theme } = useTheme();
  const color = useMemo(() => {
    return theme === "dark" ? themeColors.dark.color : themeColors.light.color;
  }, [theme, themeColors]);

  const { xScale, yScale, colorScale, heatmapTransform, axisTransform } =
    useMemo(() => {
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const xDomain = Array.from(new Set(data.map((d) => d.x.toString())));
      const yDomain = Array.from(new Set(data.map((d) => d.y.toString())));

      const xBandwidth = innerWidth / xDomain.length;
      const yBandwidth = innerHeight / yDomain.length;

      const cellSize = Math.min(xBandwidth, yBandwidth);

      const xScale = d3
        .scaleBand()
        .domain(xDomain)
        .range([0, cellSize * xDomain.length])
        .padding(0.1);
      const yScale = d3
        .scaleBand()
        .domain(yDomain)
        .range([cellSize * yDomain.length, 0])
        .padding(0.1);

      const colorScale = d3
        .scaleSequential()
        .domain(d3.extent(data, (d) => d.value) as [number, number])
        .interpolator(
          d3.interpolateRgb(d3.rgb(color).copy({ opacity: 0 }), d3.rgb(color))
        );

      const heatmapWidth = cellSize * xDomain.length;
      const heatmapHeight = cellSize * yDomain.length;
      const heatmapTransform = `translate(${(innerWidth - heatmapWidth) / 2 + margin.left}, ${(innerHeight - heatmapHeight) / 2 + margin.top})`;
      const axisTransform = `translate(${(innerWidth - heatmapWidth) / 2}, ${(innerHeight - heatmapHeight) / 2})`;

      return { xScale, yScale, colorScale, heatmapTransform, axisTransform };
    }, [data, width, height, color, margin]);

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRoot.current = createRoot(tooltipRef.current);
    }
  }, [tooltipRef, tooltipRoot]);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);

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

      const onMouseOver = (event: MouseEvent, d: HeatmapData) => {
        if (tooltipRef.current && tooltipRoot.current) {
          tooltipRoot.current.render(
            <div>
              {tooltipRenderer({ data: d, color: colorScale(d.value) })}
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

      svg
        .select<SVGGElement>(".x-axis")
        .attr(
          "transform",
          `translate(${margin.left}, ${height - margin.bottom})`
        );

      svg
        .select<SVGGElement>(".y-axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      svg
        .select<SVGGElement>(".heatmap")
        .attr("transform", heatmapTransform)
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => xScale(d.x.toString()) || 0)
        .attr("y", (d) => yScale(d.y.toString()) || 0)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", (d) => colorScale(d.value))
        .on("mouseover", (event, d) => onMouseOver(event, d))
        .on("mouseout", onMouseOut);

      svg.select(".axis").attr("transform", axisTransform);
    }
  }, [
    data,
    width,
    height,
    margin,
    xScale,
    yScale,
    colorScale,
    tooltipRenderer,
    heatmapTransform,
    axisTransform,
  ]);

  return (
    <>
      <div
        className="w-full h-full flex items-center justify-center"
        ref={containerRef}
      >
        {width !== 0 && height !== 0 && (
          <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`}>
            <g className="axis">
              <Axis
                scale={xScale}
                length={height}
                size={width}
                position="bottom"
                vertical={false}
                margin={margin}
              />
              <Axis
                scale={yScale}
                length={width}
                size={height}
                position="left"
                vertical={false}
                margin={margin}
              />
            </g>

            <g className="heatmap" />
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
