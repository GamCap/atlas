# Use an Alpine Linux image with Node.js
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of your application code, including the startup script
COPY . .

# Make sure the startup script is executable
RUN chmod +x /app/startup.sh

# Expose the environment variable MODE to select between indexer and server
ENV MODE=indexer

# Set the default port for the application to listen on
EXPOSE 3000

# Use the existing startup script as the entrypoint
CMD ["/app/startup.sh"]