# Author : @0xFable
# This is a 3 step Dockerfile used to build and run the application in the smallest manner for deployments 
# It is based on the official Next.js Dockerfile and the official Node.js Dockerfile
# It is not used for development purposes but with github CI images are made which can be used to deploy our frontend elsewhere easily
# The deployment is broken into 3 stages: 
# 1. Install dependencies 
# 2. Build the app using the installed dependencies
# 3. Run the app. For this all the build artifacts needed are copied in 
# While a basic single image doing all steps will work its massive (over 5gb for a frontend)
# The final image in this case is very small and can be used to deploy the app easily (800mb or less)
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package*.json .
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
RUN npm install

# Stage 2: build the app using the installed dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: copy the build artifacts and run the app
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js /app/next-env.d.ts /app/tsconfig.json ./
RUN npm install next

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]