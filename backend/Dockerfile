# backend/Dockerfile
FROM node:18

WORKDIR /app

# Copy only package.json and lock file first
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Now copy the rest of the code
COPY backend/ .

# Start the app
CMD ["node", "src/server.js"]
