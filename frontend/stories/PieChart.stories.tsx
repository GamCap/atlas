import type { Meta, StoryObj } from "@storybook/react";
import { PieChart, PieChartProps } from "@/components/Chart";

const meta: Meta<PieChartProps> = {
  title: "Charts/PieChart",
  component: PieChart,
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

type Story = StoryObj<PieChartProps>;

export const Default: Story = {
  args: {
    data: [
      { label: "Category 1", value: 25 },
      { label: "Category 2", value: 10 },
      { label: "Category 3", value: 15 },
      { label: "Category 4", value: 20 },
      { label: "Category 5", value: 20 },
      { label: "Category 6", value: 10 },
    ],
  },
};
