FROM node:14-alpine

COPY * /app/
WORKDIR /app

RUN apk update && apk upgrade && npm ci

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["run","start"]
