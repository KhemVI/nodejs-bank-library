FROM node:20.18.0

COPY package*.json /tmp/
RUN cd /tmp && npm install --only=prod

WORKDIR /app
COPY ./ .
RUN cp -a /tmp/node_modules /app/
EXPOSE 9400
CMD ["node", "server.js"]
