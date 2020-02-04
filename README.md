watch-willhaben
===============

is a node.js app that watches a [https://www.willhaben.at/](willhaben) 
search and reports new results to a telegram channel.

In the first few intervals it my report some urls that are not really 
new, but that should stop in a while.

run
---

Requires [https://nodejs.org/](npm and node.js).

1. install dependencies: `npm ci`.
2. copy `.env-example` to `.env` and fill variables
    - Create a telegram bot by talking to the [https://t.me/botfather](botfather), 
    use the token for `TELEGRAM_TOKEN`.
    - Talk to your new bot once.
    - Talk to the [https://telegram.me/userinfobot](userinfobot) to get your user id for `TELEGRAM_CHAT_ID`.
    - Fill `WILLHABEN_URL` with your search page.
    - Fill `INTERVAL` with interval in milliseconds (1000 is one second) it should look for updates.
3. run `npm run start` to start.
