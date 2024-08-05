"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const defaultColors = {
  dark: [
    "#00866e",
    "#1ed1b1",
    "#93e5d7",
    "#b7c7c3",
    "#f9fcfb",
    "#76d0be",
    "#0affd3",
    "#d0fef6",
    "#347467",
  ],
  light: [
    "#00866e",
    "#024c38",
    "#93e5d7",
    "#00b393",
    "#7fc9ba",
    "#3ba272",
    "#0affd3",
    "#b7c7c3",
    "#707d7a",
  ],
  hoverDark: "rgba(255, 255, 255, 0.2)",
  hoverLight: "rgba(0, 0, 0, 0.2)",
};

const useChartColors = (inputColors?: {
  dark: string[];
  light: string[];
  hoverDark: string;
  hoverLight: string;
}) => {
  const [colors, setColors] = useState<string[]>(defaultColors.dark);
  const [hoverColor, setHoverColor] = useState<string>(defaultColors.hoverDark);
  const { theme } = useTheme();

  useEffect(() => {
    const t = inputColors || defaultColors;
    const c = theme !== "dark" ? t.light : t.dark;
    const h = theme !== "dark" ? t.hoverLight : t.hoverDark;
    setHoverColor(h);
    setColors(c);
  }, [theme, inputColors]);

  return { colors, hoverColor };
};

export default useChartColors;
