[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GNU License][license-shield]][license-url]
[![Twitter][twitter-shield]][twitter-url]


# Atlas - Worldcoin Explorer by GamCap Labs

Atlas is a specialized Merkle tree analytics tool for Worldcoin's Privacy-Preserving Proof-of-Personhood Protocol (PPPoPP) to enhance identity verification observability.
## Project Overview

**Project Idea**

We developed an advanced analytics framework tailored to the unique usage of Merkle trees in Worldcoin's PPPoPP. Our initiative is centered on augmenting the transparency and efficacy of the identity commitment mechanism and the validation of zero-knowledge proofs within the Semaphore framework. This endeavor is in response to the Worldcoin Foundation's imperative for heightened observability amidst scaling to a vast user base. The core objective of this project is to forge a comprehensive analytical tool, specifically designed to embed deep observability into Worldcoin’s identity verification process.

**Why This & Why Now**

Our solution is optimal because current blockchain analytics tools lack the capability to intricately analyze and visualize the complexities involved in Worldcoin's PPPoPP. These challenges have remained unaddressed primarily due to the novel application of Semaphore and the specific nuances of Worldcoin's approach to identity verification and privacy. The need for such a tool is critical now as Worldcoin expands its user base, necessitating more refined and efficient methods to analyze and manage its blockchain network.

**Key Features**
- **Merkle Tree:** Visualize and analyze Worldcoin's Merkle tree, including identity registrations/deletions. Freely observe how the states of the Merkle tree evolve over time.
- **Dashboard:** Track curated metrics through various custom-built charts, including gas usage, and identity verification statistics.

## Backend
### Technologies Used

- **ponder.sh**
- **Supabase** 

## Frontend

This repository contains the frontend component of the Atlas project, developed with Next.js 14 and TypeScript. The frontend is focused on visualizing and analyzing Merkle tree data for WorldCoin, providing detailed insights into identity registrations and deletions, gas usage, and other key metrics.

Atlas Frontend features two main pages: **Merkle Tree** and **Dashboard**. The Merkle Tree page uses heavily customized React Flow components to visualize WorldCoin's Merkle tree, including controls for filtering by date range or block number. The Dashboard page, built with React Grid Layout, presents curated metrics through various custom-built visual components, including bar, line, scatter charts, and a calendar heatmap, all created using D3 for optimized performance and minimal bundle size.

### Technologies Used

- **Next.js** 14.2.2
- **React** 18
- **TypeScript**
- **TailwindCSS** 3.4.1
- **D3.js**
- **Supabase**
- **@xyflow/react**

### Installation and Setup

To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GamCap/atlas.git
   cd atlas/frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Environment Variables:**
    Copy the `.env.example` file in the root of the `frontend` directory to `.env` and fill in the following variables with your actual Supabase project details:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
    ```
    These variables are necessary for the application to connect to the Supabase backend.

3. **Run the development server:**
   ```bash
   yarn dev
   ```

4. **Build the project:**
   ```bash
   yarn build
   ```

5. **Start the production server:**
   ```bash
   yarn start
   ```

### Scripts and Commands

- **Development:** `yarn dev`
- **Build:** `yarn build`
- **Start:** `yarn start`
- **Lint:** `yarn lint`
- **Fix lint issues:** `yarn lint:fix`
- **Run Storybook:** `yarn storybook`
- **Build Storybook:** `yarn build-storybook`
- **Run Chromatic:** `yarn chromatic`

### Configuration

#### `next.config.js`
The configuration specifies the output directory (`dist`) and disables image optimization for simplicity.

#### `tsconfig.json`
The TypeScript configuration includes strict type-checking, module resolution, and support for JSX.

### Deployment

Deploying the Next.js frontend is straightforward, especially with platforms that support Next.js out of the box. Here are a few options:

1. **Vercel:**
   As the creators of Next.js, Vercel offers seamless deployment with automatic configuration. Simply connect your GitHub repository to Vercel, and it will handle the build and deployment process automatically.

2. **GitHub Pages:**
   ou can use GitHub Actions to deploy your Next.js application to GitHub Pages. There are presets and workflows available to simplify the setup.

3. **Other Platforms:**
   Platforms like Netlify also support Next.js. You can follow their guides for specific configurations.

For any of these platforms, pushing your code to the connected branch will trigger the deployment process. Ensure your environment variables are correctly set up in the platform's dashboard if needed. If you need to generate static files, use the `yarn build` command. The output directory, as specified in next.config.js, is dist by default. This directory contains the static files ready for deployment.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/GamCap/atlas.svg?style=for-the-badge
[contributors-url]: https://github.com/GamCap/atlas/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/GamCap/atlas.svg?style=for-the-badge
[forks-url]: https://github.com/GamCap/atlas/network/members
[stars-shield]: https://img.shields.io/github/stars/GamCap/atlas.svg?style=for-the-badge
[stars-url]: https://github.com/GamCap/atlas/stargazers
[issues-shield]: https://img.shields.io/github/issues/GamCap/atlas.svg?style=for-the-badge
[issues-url]: https://github.com/GamCap/atlas/issues
[license-shield]: https://img.shields.io/github/license/GamCap/atlas?style=for-the-badge
[license-url]: https://github.com/GamCap/atlas/blob/main/LICENSE
[twitter-shield]: https://img.shields.io/badge/-Follow_@gamcaplabs-black.svg?style=for-the-badge&logo=x&colorB=555
[twitter-url]: https://twitter.com/gamcaplabs
```

