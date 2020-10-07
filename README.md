watch-willhaben
===============

is a node.js app that watches a [willhaben](https://www.willhaben.at/) 
search and reports new results to a telegram channel. It will only 
watch the first page of results.

In the first few intervals it my report some urls that are not really 
new, but that should stop in a while. If all search results are on the 
same results page false reports won't happen.

run
---

Requires [npm and node.js](https://nodejs.org).

1. install dependencies: `npm ci`.
2. copy `.env-example` to `.env` and fill variables
    - Create a telegram bot by talking to the [botfather](https://t.me/botfather), 
    use the token for `TELEGRAM_TOKEN`.
    - Talk to your new bot once.
    - Talk to the [userinfobot](https://telegram.me/userinfobot) to get your user id for `TELEGRAM_CHAT_ID`.
    - Fill `WILLHABEN_URL` with your search page. If you can, increase results per page.
    - Fill `INTERVAL` with interval in milliseconds (1000 is one second) it should look for updates.
3. run `npm run start` to start.


Docker
---

1. Build docker image via `docker build -t watch-willhaben-test . `
2. Run docker image mounting your `.env` file to get correct results
`docker run --rm -ti -v "$(pwd)"/.env:/app/.env watch-willhaben-test`
