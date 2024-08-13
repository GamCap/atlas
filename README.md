[![Contributors][contributors-shield]][contributors-url]  [![Forks][forks-shield]][forks-url]  [![Stargazers][stars-shield]][stars-url]  [![Issues][issues-shield]][issues-url]  [![GNU License][license-shield]][license-url]  [![Twitter][twitter-shield]][twitter-url]

# Atlas - Worldcoin Explorer by GamCap Labs

Atlas is a specialized Merkle tree analytics tool for Worldcoin's Privacy-Preserving Proof-of-Personhood Protocol (PPPoPP) to enhance identity verification observability.

## Project Overview

**Project Idea**

We developed an advanced analytics framework tailored to the unique usage of Merkle trees in Worldcoin's PPPoPP. Our initiative is centered on augmenting the transparency and efficacy of the identity commitment mechanism and the validation of zero-knowledge proofs within the Semaphore framework. This endeavor is in response to the Worldcoin Foundation's imperative for heightened observability amidst scaling to a vast user base. The core objective of this project is to forge a comprehensive analytical tool, specifically designed to embed deep observability into Worldcoin’s identity verification process.

**Why This & Why Now**

Our solution is optimal because current blockchain analytics tools lack the capability to intricately analyze and visualize the complexities involved in Worldcoin's PPPoPP. These challenges have remained unaddressed primarily due to the novel application of Semaphore and the specific nuances of Worldcoin's approach to identity verification and privacy. The need for such a tool is critical now as Worldcoin expands its user base, necessitating more refined and efficient methods to analyze and manage its blockchain network.

**Key Features**

- **Merkle Tree:** Visualize and analyze Worldcoin's Merkle tree, including identity registrations/deletions. Freely observe how the states of the Merkle tree evolve over time.
- **Dashboard:** Track curated metrics through various custom-built charts, including gas usage and identity verification statistics.

## Backend

### Technologies Used

- **ponder.sh**
- **Supabase**

### Deployment

#### Prerequisites

- AWS CLI configured
- Terraform installed

#### Steps

1. **Deploy Infrastructure:** Use Terraform to deploy the required infrastructure.
    ```bash
    cd terraform
    terraform init
    terraform apply
    ```

2. **Configure Ponder:** Ensure Ponder configurations are correctly set up in the Ponder repository.

3. **Deploy Ponder:** Push the Ponder configurations to the configured ECR and ECS.

### Important Deployment Information

1. Deploy Supabase and Ponder Terraform resources using a backend config.
2. **Critical:** Since we don’t have auto migrations on Supabase, run the following role grants using user `postgres` (credentials can be found in Secrets Manager after creating resources):
    (See below on how to connect to the Supabase RDS database)
    ```sql
    GRANT USAGE ON SCHEMA ponder_data TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA ponder_data TO anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA ponder_data TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA ponder_data TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ponder_data GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ponder_data GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ponder_data GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    ```

3. From Terraform outputs (or CloudFormation outputs created by Terraform), grab the Supabase REST API URL, Supabase anon key (a JWT), and Supabase Studio URL.

4. Configure any Ponder environment variable secrets (most likely RPC URLs for different chains) in Secrets Manager under `{name}_ponder_secrets` resource, and update the Ponder ECS task to ensure Ponder can use them.

5. Add indexing functions and data definitions to the Ponder repository.

6. Push changes and let CI/CD upload the created Ponder task image to ECR. ECS will then pick up automatically (currently ECS doesn't replace existing tasks, so manual intervention is needed).

### Connecting to Supabase RDS

1. Create a bastion host (a simple EC2 instance) inside the `Supabase VPC`, with a security group named `ponder`. RDS has necessary permissions to allow connections coming from that security group. Don’t forget to create or use an SSH key.

2. Create an SSH tunnel:
    ```bash
    chmod 600 your_key.pem
    echo "$(ssh-keyscan -p ${BASTION_PORT} ${BASTION_IP})" >> ~/.ssh/known_hosts
    ssh -fNL ${DB_PORT}:${DATABASE_HOST}:${DB_PORT} ${BASTION_USER}@${BASTION_IP} -p ${BASTION_PORT}
    sleep 5
    echo "$(ssh-keyscan -p ${DB_PORT} localhost)" >> ~/.ssh/known_hosts
    ```

3. Access the database with the URL:
    ```bash
    postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}
    ```

### Configuration

#### Supabase

See "Important Deployment Information" for manual configuration needed.

#### Ponder

Configure the indexing parameters in the `ponder-config.ts`. Ensure the indexing functions and configuration files are properly set up to index the required onchain data.

Make sure to test Ponder configuration on your local environment (it uses SQLite, so no need to host a Postgres instance).

### Security

- All stacks and databases are within a VPC, so public access is only possible via the Supabase REST API and a bastion host.
- API keys, secrets, and RPC URLs are stored in Secrets Manager.
- **IMPORTANT:** Set a password to the Amplify Supabase Studio deployment to prevent public access.

### Maintenance and Monitoring

- All Supabase service logs and Ponder logs are pushed into the AWS CloudWatch service.
- Set up performance and error monitoring systems.

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
   Copy the `.env.example` file in the root of the frontend directory to `.env` and fill in the following variables with your actual Supabase project details and Google Analytics ID:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<your-google-analytics-id>
   ```
   These variables are necessary for the application to connect to the Supabase backend and for integrating Google Analytics tracking.

4. **Run the development server:**
   ```bash
   yarn dev
   ```

5. **Build the project:**
   ```bash
   yarn build
   ```

6. **Start the production server:**
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

