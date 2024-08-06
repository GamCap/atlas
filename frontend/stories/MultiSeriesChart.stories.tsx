// MultiSeriesChart.stories.ts
import type { Meta, StoryObj } from "@storybook/react";
import { MultiSeriesChart } from "@/components/Chart";
import type { SeriesType } from "@/components/Chart/types";

const meta: Meta<typeof MultiSeriesChart> = {
  title: "Charts/MultiSeriesChart",
  component: MultiSeriesChart,
  tags: ["autodocs"],
  argTypes: {
    vertical: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "400px",
          position: "relative",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MultiSeriesChart>;

const series1 = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
  { x: 2, y: 15 },
  { x: 3, y: 25 },
];

const series2 = [
  { x: 0, y: 5 },
  { x: 1, y: 15 },
  { x: 2, y: 10 },
  { x: 3, y: 20 },
];

const series3 = [
  { x: 0, y: 8 },
  { x: 1, y: 12 },
  { x: 2, y: 18 },
  { x: 3, y: 22 },
];

const data: {
  name: string;
  type: SeriesType;
  data: { x: number; y: number }[];
  filled?: boolean;
}[] = [
  { name: "Series 1", type: "line", data: series1, filled: true },
  { name: "Series 2", type: "bar", data: series2 },
  { name: "Series 3", type: "scatter", data: series3 },
  { name: "Series 4", type: "bar", data: series2 },
  { name: "Series 5", type: "bar", data: series2 },
];

export const Default: Story = {
  args: {
    data,
    gridConfig: {
      horizontal: {
        show: true,
        dashed: false,
      },
      vertical: {
        show: true,
        dashed: false,
      },
    },
  },
};
