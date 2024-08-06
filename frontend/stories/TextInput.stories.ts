import type { Meta, StoryObj } from "@storybook/react";
import { TextInput } from "@/components/ui/TextInput";

const meta: Meta<typeof TextInput> = {
  title: "UI/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: {
        type: "select",
        options: ["sm", "lg", "full"],
      },
    },
    variant: {
      control: {
        type: "select",
        options: ["regular", "colored"],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const WithLeftIcon: Story = {
  args: {
    placeholder: "Search...",
    leftIconName: "Search",
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: "Enter amount",
    rightSymbol: "$",
  },
};

export const WithErrorMessage: Story = {
  args: {
    placeholder: "Enter email",
    errorMessage: "Invalid email format",
  },
};

export const WithHelperText: Story = {
  args: {
    placeholder: "Enter password",
    helperText: "Password must be at least 8 characters long",
  },
};
