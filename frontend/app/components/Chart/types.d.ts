export type SeriesType = "line" | "bar" | "scatter";

export interface SeriesBase {
  name: string;
  type: SeriesType;
  data: { x: number; y: number }[];
}

export interface LineSeries extends SeriesBase {
  type: "line";
  filled?: boolean;
}

export interface BarSeries extends SeriesBase {
  type: "bar";
}

export interface ScatterSeries extends SeriesBase {
  type: "scatter";
}

export type Series = LineSeries | BarSeries | ScatterSeries;

export interface PieChartData {
  label: string;
  value: number;
}

export interface HeatmapData {
  x: string | number;
  y: string | number;
  value: number;
}

export interface CalendarHeatmapData {
  date: number;
  change: number;
  counts: {
    insert: number;
    remove: number;
  };
}
