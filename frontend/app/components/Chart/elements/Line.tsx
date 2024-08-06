import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LineSeries } from "../types";

interface LineProps {
  linearScale: d3.ScaleLinear<number, number>;
  bandScale: d3.ScaleBand<string>;
  linearDomain: [number, number];
  data: {
    series: LineSeries;
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
export const Line: React.FC<LineProps> = ({
  linearScale,
  bandScale,
  linearDomain,
  data,
  width,
  height,
  margin,
  vertical,
}) => {
  const lines = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    if (!lines.current) return;
    const svg = d3.select(lines.current);
    const offset = bandScale.bandwidth() / 2;
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) =>
        vertical ? linearScale(d.y) : bandScale(d.x.toString())! + offset
      )
      .y((d) =>
        vertical ? bandScale(d.x.toString())! + offset : linearScale(d.y)
      )
      .curve(d3.curveBasis);

    data.forEach(({ series, color, index }, i) => {
      svg
        .selectAll(`.series-line-${i}`)
        .data([series.data])
        .join(
          (enter) => {
            const path = enter
              .append("path")
              .attr("class", `series-line-${i}`)
              .attr("fill", "none")
              .attr("stroke", color)
              .attr("stroke-width", "1.5px")
              .attr("d", line);

            const totalLength =
              (path.node() as SVGPathElement | null)?.getTotalLength() || 0;

            path
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
              .duration(500)
              .attr("stroke-dashoffset", 0);

            return path;
          },
          (update) =>
            update
              .transition()
              .duration(500)
              .attr("class", `series-line-${i}`)
              .attr("fill", "none")
              .attr("stroke", color)
              .attr("stroke-dasharray", 0)
              .attr("stroke-dashoffset", 0)
              .attr("stroke-width", "1.5px")
              .attr("d", line),
          (exit) =>
            exit
              .transition()
              .duration(500)
              .attr("stroke-dashoffset", 0)
              .remove()
        );

      if (series.filled) {
        const gradientId = `gradient-${i}`;
        const gradient = svg
          .selectAll(`#${gradientId}`)
          .data([series.data])
          .join(
            (enter) =>
              enter
                .append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse")
                .call((gradient) =>
                  gradient
                    .selectAll("stop")
                    .data([
                      {
                        offset: "0%",
                        color: color,
                        opacity: 0.6,
                      },
                      {
                        offset: "100%",
                        color: color,
                        opacity: 0,
                      },
                    ])
                    .join("stop")
                    .attr("offset", (d) => d.offset)
                    .attr("stop-color", (d) => d.color)
                    .attr("stop-opacity", (d) => d.opacity)
                ),
            (update) => update,
            (exit) => exit.remove()
          )
          .attr("x2", width)
          .attr("x1", width)
          .transition()
          .duration(500)
          .attr("x1", vertical ? width : 0)
          .attr("x2", vertical ? 0 : 0)
          .attr("y2", vertical ? 0 : linearScale(0));

        const area = vertical
          ? d3
              .area<{ x: number; y: number }>()
              .y((d) => bandScale(d.x.toString())! + offset)
              .x0(linearScale(d3.min(linearDomain)!))
              .x1((d) => linearScale(d.y))
              .curve(d3.curveBasis)
          : d3
              .area<{ x: number; y: number }>()
              .x((d) => bandScale(d.x.toString())! + offset)
              .y0(linearScale(d3.min(linearDomain)!))
              .y1((d) => linearScale(d.y))
              .curve(d3.curveBasis);

        svg
          .selectAll(`.area-${i}`)
          .data([series.data])
          .join(
            (enter) =>
              enter
                .append("path")
                .attr("class", `area-${i}`)
                .attr("fill", `url(#${gradientId})`)
                .attr("d", area),
            (update) =>
              update
                .transition()
                .duration(500)
                .attr("class", `area-${i}`)
                .attr("fill", `url(#${gradientId})`)
                .attr("d", area),
            (exit) => exit.remove()
          );
      }

      // Add circles at data points
      svg
        .selectAll(`.circle-point-${i}`)
        .data(series.data)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", `circle-point-${i}`)
              .attr("r", "2.5px")
              .attr("fill", color)
              .attr("cx", (d) =>
                vertical
                  ? linearScale(d.y)
                  : bandScale(d.x.toString())! + offset
              )
              .attr("cy", (d) =>
                vertical
                  ? bandScale(d.x.toString())! + offset
                  : linearScale(d.y)
              ),
          (update) =>
            update
              .transition()
              .duration(500)
              .attr("cx", (d) =>
                vertical
                  ? linearScale(d.y)
                  : bandScale(d.x.toString())! + offset
              )
              .attr("cy", (d) =>
                vertical
                  ? bandScale(d.x.toString())! + offset
                  : linearScale(d.y)
              ),
          (exit) => exit.remove()
        );
    });
  }, [
    data,
    linearScale,
    bandScale,
    width,
    height,
    margin,
    vertical,
    linearDomain,
  ]);

  return <g ref={lines} className="chart-lines" />;
};
