import type { StorybookConfig } from "@storybook/nextjs";
import { Configuration } from "webpack";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    {
      name: "@storybook/addon-postcss",
      options: {
        postcssLoaderOptions: {
          implementation: require("postcss"),
        },
      },
    },
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  webpackFinal: async (config: Configuration) => {
    config?.module?.rules?.push({
      test: /\.css$/,
      use: [
        {
          loader: "postcss-loader",
          options: {
            implementation: require("postcss"),
            postcssOptions: {
              plugins: [require("tailwindcss")],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default config;
