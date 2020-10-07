FROM node:14-alpine

COPY * /app/
WORKDIR /app

RUN apk update && apk upgrade && npm ci

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["run","start"]
