import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "@/components/Table";
import { TableProps } from "@/components/Table/types";

const meta: Meta<TableProps> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    data: { control: "object" },
    columns: { control: "object" },
  },
};

export default meta;

type Story = StoryObj<TableProps>;

const mockData = [
  {
    id: 1,
    name: "John Doe",
    age: 25,
    email: "john@example.com",
    country: "USA",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 30,
    email: "jane@example.com",
    country: "Canada",
    rating: 4.2,
  },
  {
    id: 3,
    name: "Bob Johnson",
    age: 35,
    email: "bob@example.com",
    country: "Australia",
    rating: 3.9,
  },
  {
    id: 4,
    name: "Alice Brown",
    age: 28,
    email: "alice@example.com",
    country: "UK",
    rating: 4.7,
  },
  {
    id: 5,
    name: "David Lee",
    age: 42,
    email: "david@example.com",
    country: "USA",
    rating: 4.1,
  },
  {
    id: 6,
    name: "Sarah Davis",
    age: 27,
    email: "sarah@example.com",
    country: "Canada",
    rating: 4.4,
  },
  {
    id: 7,
    name: "Michael Wilson",
    age: 33,
    email: "michael@example.com",
    country: "Australia",
    rating: 3.8,
  },
  {
    id: 8,
    name: "Emily Taylor",
    age: 29,
    email: "emily@example.com",
    country: "UK",
    rating: 4.6,
  },
  {
    id: 9,
    name: "Daniel Anderson",
    age: 31,
    email: "daniel@example.com",
    country: "USA",
    rating: 4.3,
  },
  {
    id: 10,
    name: "Olivia Martinez",
    age: 26,
    email: "olivia@example.com",
    country: "Canada",
    rating: 4.0,
  },
  {
    id: 11,
    name: "James Robinson",
    age: 37,
    email: "james@example.com",
    country: "Australia",
    rating: 4.2,
  },
  {
    id: 12,
    name: "Sophia Clark",
    age: 32,
    email: "sophia@example.com",
    country: "UK",
    rating: 4.5,
  },
  {
    id: 13,
    name: "William Harris",
    age: 39,
    email: "william@example.com",
    country: "USA",
    rating: 4.1,
  },
  {
    id: 14,
    name: "Ava Thompson",
    age: 24,
    email: "ava@example.com",
    country: "Canada",
    rating: 4.4,
  },
  {
    id: 15,
    name: "Benjamin Sanchez",
    age: 34,
    email: "benjamin@example.com",
    country: "Australia",
    rating: 3.9,
  },
  {
    id: 16,
    name: "Mia Lewis",
    age: 27,
    email: "mia@example.com",
    country: "UK",
    rating: 4.7,
  },
  {
    id: 17,
    name: "Alexander Walker",
    age: 36,
    email: "alexander@example.com",
    country: "USA",
    rating: 4.2,
  },
  {
    id: 18,
    name: "Charlotte Hall",
    age: 30,
    email: "charlotte@example.com",
    country: "Canada",
    rating: 4.0,
  },
  {
    id: 19,
    name: "Henry Young",
    age: 41,
    email: "henry@example.com",
    country: "Australia",
    rating: 4.3,
  },
  {
    id: 20,
    name: "Amelia King",
    age: 29,
    email: "amelia@example.com",
    country: "UK",
    rating: 4.6,
  },
];

const mockColumns = [
  { id: "name", label: "Name", sortable: true },
  { id: "age", label: "Age", sortable: true },
  { id: "email", label: "Email" },
  { id: "country", label: "Country", sortable: true },
  {
    id: "rating",
    label: "Rating",
    sortable: true,
    renderer: (value: number) => (
      <span
        style={{
          color: value >= 4.5 ? "green" : value >= 4 ? "orange" : "red",
        }}
      >
        {value}
      </span>
    ),
  },
];

export const Default: Story = {
  args: {
    data: mockData,
    columns: mockColumns,
  },
};

export const SortableTable: Story = {
  args: {
    data: mockData,
    columns: mockColumns.map((column) => ({ ...column, sortable: true })),
  },
};

export const CustomRenderers: Story = {
  args: {
    data: mockData,
    columns: [
      { id: "name", label: "Name", sortable: true },
      { id: "age", label: "Age", sortable: true },
      {
        id: "email",
        label: "Email",
        renderer: (value: string) => <a href={`mailto:${value}`}>{value}</a>,
      },
    ],
  },
};
