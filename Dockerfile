FROM node:10

WORKDIR /usr/src/app/

COPY package.json ./

ENV npm_lifecycle_event=build

RUN npm install

COPY ./ ./

# RUN npm run test:all
RUN npm run build --no-cache

# CMD ["npm", "run", "build"]
