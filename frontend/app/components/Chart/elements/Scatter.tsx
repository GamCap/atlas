import { useEffect, useRef } from "react";
import * as d3 from "d3";

import { ScatterSeries } from "../types";

interface ScatterProps {
  linearScale: d3.ScaleLinear<number, number>;
  bandScale: d3.ScaleBand<string>;
  data: {
    series: ScatterSeries;
    color: string;
    index: number;
  }[];
  width: number;
  height: number;
  vertical: boolean;
}

export const Scatter: React.FC<ScatterProps> = ({
  linearScale,
  bandScale,
  data,
  width,
  height,
  vertical,
}) => {
  const scatter = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    if (!scatter.current) return;
    const svg = d3.select(scatter.current);
    const offset = bandScale.bandwidth() / 2;
    data.forEach(({ series, color, index }, i) => {
      const flatName = series.name.replace(/\s/g, "-").toLowerCase();
      svg
        .selectAll(`.scatter-${flatName}`)
        .data(series.data)
        .join(
          (enter) => enter.append("circle"),
          (update) => update,
          (exit) => exit.remove()
        )
        .transition()
        .duration(500)
        .attr("class", `scatter-${flatName}`)
        .attr("fill", color)
        .attr("cx", (d) =>
          vertical ? linearScale(d.y) : bandScale(d.x.toString())! + offset
        )
        .attr("cy", (d) =>
          vertical ? bandScale(d.x.toString())! + offset : linearScale(d.y)
        )
        .attr("r", 8);
    });
  }, [data, linearScale, bandScale, vertical]);

  return (
    <svg
      className="chart-scatter"
      width={width}
      height={height}
      ref={scatter}
    />
  );
};
