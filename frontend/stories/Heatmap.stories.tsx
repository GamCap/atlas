import type { Meta, StoryObj } from "@storybook/react";
import { Heatmap } from "@/components/Chart";

const meta: Meta<typeof Heatmap> = {
  title: "Charts/Heatmap",
  component: Heatmap,
  tags: ["autodocs"],
  argTypes: {},
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
type Story = StoryObj<typeof Heatmap>;

const heatmapData: {
  x: string;
  y: string;
  value: number;
}[] = [
  { x: "A", y: "v1", value: 30 },
  { x: "A", y: "v2", value: 95 },
  { x: "A", y: "v3", value: 22 },
  { x: "A", y: "v4", value: 14 },
  { x: "A", y: "v5", value: 59 },
  { x: "A", y: "v6", value: 52 },
  { x: "A", y: "v7", value: 88 },
  { x: "A", y: "v8", value: 20 },
  { x: "A", y: "v9", value: 99 },
  { x: "A", y: "v10", value: 66 },
  { x: "B", y: "v1", value: 37 },
  { x: "B", y: "v2", value: 50 },
  { x: "B", y: "v3", value: 81 },
  { x: "B", y: "v4", value: 79 },
  { x: "B", y: "v5", value: 84 },
  { x: "B", y: "v6", value: 91 },
  { x: "B", y: "v7", value: 82 },
  { x: "B", y: "v8", value: 89 },
  { x: "B", y: "v9", value: 6 },
  { x: "B", y: "v10", value: 67 },
  { x: "C", y: "v1", value: 96 },
  { x: "C", y: "v2", value: 13 },
  { x: "C", y: "v3", value: 98 },
  { x: "C", y: "v4", value: 10 },
  { x: "C", y: "v5", value: 86 },
  { x: "C", y: "v6", value: 23 },
  { x: "C", y: "v7", value: 74 },
  { x: "C", y: "v8", value: 47 },
  { x: "C", y: "v9", value: 73 },
  { x: "C", y: "v10", value: 40 },
  { x: "D", y: "v1", value: 75 },
  { x: "D", y: "v2", value: 18 },
  { x: "D", y: "v3", value: 92 },
  { x: "D", y: "v4", value: 43 },
  { x: "D", y: "v5", value: 16 },
  { x: "D", y: "v6", value: 27 },
  { x: "D", y: "v7", value: 76 },
  { x: "D", y: "v8", value: 24 },
  { x: "D", y: "v9", value: 1 },
  { x: "D", y: "v10", value: 87 },
  { x: "E", y: "v1", value: 44 },
  { x: "E", y: "v2", value: 29 },
  { x: "E", y: "v3", value: 58 },
  { x: "E", y: "v4", value: 55 },
  { x: "E", y: "v5", value: 65 },
  { x: "E", y: "v6", value: 56 },
  { x: "E", y: "v7", value: 9 },
  { x: "E", y: "v8", value: 78 },
  { x: "E", y: "v9", value: 49 },
  { x: "E", y: "v10", value: 36 },
  { x: "F", y: "v1", value: 35 },
  { x: "F", y: "v2", value: 80 },
  { x: "F", y: "v3", value: 8 },
  { x: "F", y: "v4", value: 46 },
  { x: "F", y: "v5", value: 48 },
  { x: "F", y: "v6", value: 100 },
  { x: "F", y: "v7", value: 17 },
  { x: "F", y: "v8", value: 41 },
  { x: "F", y: "v9", value: 33 },
  { x: "F", y: "v10", value: 11 },
  { x: "G", y: "v1", value: 77 },
  { x: "G", y: "v2", value: 62 },
  { x: "G", y: "v3", value: 94 },
  { x: "G", y: "v4", value: 15 },
  { x: "G", y: "v5", value: 69 },
  { x: "G", y: "v6", value: 63 },
  { x: "G", y: "v7", value: 61 },
  { x: "G", y: "v8", value: 54 },
  { x: "G", y: "v9", value: 38 },
  { x: "G", y: "v10", value: 93 },
  { x: "H", y: "v1", value: 39 },
  { x: "H", y: "v2", value: 26 },
  { x: "H", y: "v3", value: 90 },
  { x: "H", y: "v4", value: 83 },
  { x: "H", y: "v5", value: 31 },
  { x: "H", y: "v6", value: 2 },
  { x: "H", y: "v7", value: 51 },
  { x: "H", y: "v8", value: 28 },
  { x: "H", y: "v9", value: 42 },
  { x: "H", y: "v10", value: 7 },
  { x: "I", y: "v1", value: 5 },
  { x: "I", y: "v2", value: 60 },
  { x: "I", y: "v3", value: 21 },
  { x: "I", y: "v4", value: 25 },
  { x: "I", y: "v5", value: 3 },
  { x: "I", y: "v6", value: 70 },
  { x: "I", y: "v7", value: 34 },
  { x: "I", y: "v8", value: 68 },
  { x: "I", y: "v9", value: 57 },
  { x: "I", y: "v10", value: 32 },
  { x: "J", y: "v1", value: 19 },
  { x: "J", y: "v2", value: 85 },
  { x: "J", y: "v3", value: 53 },
  { x: "J", y: "v4", value: 45 },
  { x: "J", y: "v5", value: 71 },
  { x: "J", y: "v6", value: 64 },
  { x: "J", y: "v7", value: 4 },
  { x: "J", y: "v8", value: 12 },
  { x: "J", y: "v9", value: 97 },
  { x: "J", y: "v10", value: 72 },
];

export const Default: Story = {
  args: {
    data: heatmapData,
  },
};
