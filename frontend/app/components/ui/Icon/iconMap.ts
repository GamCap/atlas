import { lazy } from "react";

export const IconMap: Record<
  IconName,
  React.LazyExoticComponent<React.FC<React.SVGProps<SVGSVGElement>>>
> = {
  LightMode: lazy(() => import("./subComponents/Theme/LightMode.jsx")),
  DarkMode: lazy(() => import("./subComponents/Theme/DarkMode.jsx")),
  ExpandLeft: lazy(() => import("./subComponents/Basic/ExpandLeft.jsx")),
  Search: lazy(() => import("./subComponents/Basic/Search.jsx")),
  Sorting: lazy(() => import("./subComponents/Basic/Sorting.jsx")),
  Logo: lazy(() => import("./subComponents/Basic/Logo.jsx")),
  InfoCircle: lazy(() => import("./subComponents/Basic/InfoCircle.jsx")),
  Info: lazy(() => import("./subComponents/Basic/Info.jsx")),
  Dropdown: lazy(() => import("./subComponents/Basic/Dropdown.jsx")),
  Layout: lazy(() => import("./subComponents/Basic/Layout.jsx")),
  Copy: lazy(() => import("./subComponents/Basic/Copy.jsx")),
  Explore: lazy(() => import("./subComponents/Basic/Explore.jsx")),
};

export type IconName =
  | "LightMode"
  | "DarkMode"
  | "ExpandLeft"
  | "Search"
  | "Sorting"
  | "Logo"
  | "InfoCircle"
  | "Info"
  | "Dropdown"
  | "Layout"
  | "Copy"
  | "Explore";
