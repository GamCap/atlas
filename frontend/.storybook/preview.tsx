import type { Preview, StoryFn } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { ThemeProvider } from "next-themes";
import "../app/globals.css";
import React from "react";
import ThemeChanger from "../app/theme/ThemeChanger";

export const decorators = [
  withThemeByClassName({
    themes: {
      light: "light",
      dark: "dark",
    },
    defaultTheme: "light",
  }),
  (Story: StoryFn, context) => {
    const theme = context.parameters.theme || context.globals.theme;
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        themes={["light", "dark"]}
      >
        <ThemeChanger theme={theme === "light" ? "light" : "dark"} />
        <Story />
      </ThemeProvider>
    );
  },
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: {
            width: "375px",
            height: "100%",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "100%",
          },
        },
        laptop: {
          name: "Laptop",
          styles: {
            width: "1024px",
            height: "100%",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1440px",
            height: "100%",
          },
        },
      },
    },
    decorators: decorators,
  },
};

export default preview;
