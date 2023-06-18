FROM node:alpine
# Note for future, this dockerfile is not very efficient 
# We can improve this massively by: 
# 1. Using a multi-stage build to reduce the size of the image
# 2. Using a smaller base image, such as alpine
# 3. Using standalone option in NextJS to only build the files needed for production to be run with server.js 
# Dont have time for this now but good to note a natural evolution of this dockerfile
RUN mkdir -p /usr/src/app
RUN apk add --no-cache libc6-compat python3 make g++
ENV PORT 3000

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app

# Production use node instead of root
# USER node

RUN yarn install --production

COPY . /usr/src/app

# RUN yarn build

EXPOSE 3000
CMD [ "yarn", "dev" ]