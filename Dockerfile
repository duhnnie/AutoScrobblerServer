FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
# A wuldcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn install --production
# If you are building your code for develop
# RUN yarn install

# Bundle app source
COPY . .

ENV PORT=80
ENV NODE_ENV=production
EXPOSE ${PORT}
CMD ["node", "index.js"]
