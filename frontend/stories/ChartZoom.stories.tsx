import type { Meta, StoryObj } from "@storybook/react";
import { ChartZoom } from "@/components/ChartZoom";

const meta = {
  title: "UI/ChartZoom",
  component: ChartZoom,
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: "object",
      description: "The array of items to be displayed in the chart zoom.",
    },
    className: {
      control: "text",
      description: "Additional class name for the chart zoom container.",
    },
    buttonClassName: {
      control: "object",
      description:
        "Class names for the active, inactive, and base button states.",
    },
    textClassName: {
      control: "text",
      description: "Class name for the text inside the buttons.",
    },
    onChange: {
      action: "onChange",
      description: "Callback function triggered when a button is clicked.",
    },
    initialIndex: {
      control: "number",
      description: "Initial index of the active button.",
    },
    dropdown: {
      control: "boolean",
      description:
        "Determines whether to display the chart zoom as a dropdown.",
    },
  },
} satisfies Meta<typeof ChartZoom>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "1m" },
      { label: "5m" },
      { label: "15m" },
      { label: "30m" },
      { label: "1h" },
      { label: "4h" },
      { label: "1d" },
      { label: "1w" },
    ],
    initialIndex: 0,
    dropdown: false,
    onChange: (data, index) => console.log(data, index),
  },
};

export const Dropdown: Story = {
  args: {
    items: [
      { label: "1m" },
      { label: "5m" },
      { label: "15m" },
      { label: "30m" },
      { label: "1h" },
      { label: "4h" },
      { label: "1d" },
      { label: "1w" },
    ],
    initialIndex: 0,
    dropdown: true,
    onChange: (data, index) => console.log(data, index),
  },
};

export const CustomClassNames: Story = {
  args: {
    items: [
      { label: "1m" },
      { label: "5m" },
      { label: "15m" },
      { label: "30m" },
      { label: "1h" },
      { label: "4h" },
      { label: "1d" },
      { label: "1w" },
    ],
    initialIndex: 0,
    className: "custom-container-class",
    buttonClassName: {
      active: "custom-active-class",
      inactive: "custom-inactive-class",
      button: "custom-button-class",
    },
    textClassName: "custom-text-class",
    onChange: (data, index) => console.log(data, index),
  },
};
