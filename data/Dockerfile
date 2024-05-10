# Use an Alpine Linux image with Node.js
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the environment variable MODE to select between indexer and server
ENV MODE=indexer

# Use a script to decide what command to run based on the MODE environment variable
CMD if [ "$MODE" = "server" ]; then npm run serve; else npm run start; fi