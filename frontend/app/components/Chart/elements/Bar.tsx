import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { BarSeries } from "../types";

interface BarProps {
  linearScale: d3.ScaleLinear<number, number>;
  bandScale: d3.ScaleBand<string>;
  linearDomain: [number, number];
  data: {
    series: BarSeries;
    color: string;
    index: number;
  }[];
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  vertical: boolean;
}

export const Bar: React.FC<BarProps> = ({
  linearScale,
  bandScale,
  linearDomain,
  data,
  width,
  height,
  margin,
  vertical,
}) => {
  const bars = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!bars.current) return;

    const svg = d3.select(bars.current);
    const bandwidth = bandScale.bandwidth();
    const paddingRatio = 0.1;
    const numOfBars = data.length;
    const numOfData = data[0].series.data.length;
    const numOfSeries = data.length;

    const barWidth =
      bandwidth / (paddingRatio * (numOfSeries - 1) + numOfSeries);
    const padding = barWidth * paddingRatio;

    const allBars = svg.selectAll(".chart-bar").data(
      data.flatMap((d) =>
        d.series.data.map((bar) => ({
          ...bar,
          color: d.color,
          seriesName: d.series.name.replace(/\s/g, "-").toLowerCase(),
          index: d.index,
        }))
      ),
      (d: any) => `${d.seriesName}-${d.x}`
    );

    allBars
      .join(
        (enter) => {
          const enterRect = enter
            .append("rect")
            .attr("fill", (d) => d.color)
            .attr("x", (d, i) =>
              vertical
                ? linearScale(d3.min(linearDomain)!)
                : bandScale(d.x.toString())! +
                  Math.floor(i / numOfData) * (barWidth + padding)
            )
            .attr("y", (d, i) =>
              vertical
                ? bandScale(d.x.toString())! +
                  (numOfBars - 1 - Math.floor(i / numOfData)) *
                    (barWidth + padding)
                : linearScale(d.y)
            )
            .attr("width", (d) => (vertical ? 0 : barWidth))
            .attr("height", (d) => (vertical ? barWidth : 0))
            .attr("rx", 5)
            .attr("ry", 5);

          enterRect
            .transition()
            .duration(500)
            .attr(vertical ? "width" : "height", (d) =>
              vertical
                ? linearScale(d.y) - linearScale(d3.min(linearDomain)!)
                : height - margin.bottom - linearScale(d.y)
            );
          return enterRect;
        },

        (update) =>
          update
            .transition()
            .duration(500)
            .attr("fill", (d) => d.color)
            .attr("x", (d, i) =>
              vertical
                ? linearScale(d3.min(linearDomain)!)
                : bandScale(d.x.toString())! +
                  Math.floor(i / numOfData) * (barWidth + padding)
            )
            .attr("y", (d, i) =>
              vertical
                ? bandScale(d.x.toString())! +
                  (numOfBars - 1 - Math.floor(i / numOfData)) *
                    (barWidth + padding)
                : linearScale(d.y)
            )
            .attr("width", (d) =>
              vertical
                ? linearScale(d.y) - linearScale(d3.min(linearDomain)!)
                : barWidth
            )
            .attr("height", (d) =>
              vertical ? barWidth : height - margin.bottom - linearScale(d.y)
            )
            .attr("rx", 5)
            .attr("ry", 5),
        (exit) =>
          exit
            .transition()
            .duration(500)
            .attr(vertical ? "y" : "x", (_d, i, nodes) => {
              const prev = d3.select(nodes[i]).attr(vertical ? "y" : "x");
              return vertical
                ? parseFloat(prev)
                : parseFloat(prev) +
                    parseFloat(d3.select(nodes[i]).attr("width"));
            })
            .attr(vertical ? "height" : "width", 0)
            .remove()
      )
      .attr(
        "class",
        (d) => `chart-bar bar-${d.seriesName.replace(/\s/g, "-").toLowerCase()}`
      );
  }, [data, linearScale, bandScale, linearDomain, vertical, height, margin]);

  return <g ref={bars} className="chart-bars" />;
};
