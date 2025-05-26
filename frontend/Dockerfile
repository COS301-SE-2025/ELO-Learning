# Step 1: Build stage
FROM node:18 AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN yarn install --frozen-lockfile

COPY frontend/ .
RUN yarn build


# Step 2: Production runtime
FROM node:18 AS runner

WORKDIR /app

COPY --from=builder /app ./

RUN yarn install --frozen-lockfile --ignore-optional --production

EXPOSE 8080

# Serve the production build
CMD ["yarn", "start"]
