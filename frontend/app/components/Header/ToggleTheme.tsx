"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

const ToggleTheme = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      size="small"
      iconName={resolvedTheme === "dark" ? "LightMode" : "DarkMode"}
      variant="subtle"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className=" px-[7px] py-[7px] "
      id="ga-toggle-theme"
    />
  );
};

export default ToggleTheme;
