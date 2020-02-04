const fetch = require('node-fetch');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
require('dotenv').config();

const WILLHABEN_URL = process.env.WILLHABEN_URL;
const INTERVAL = process.env.INTERVAL;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // bot from https://t.me/botfather
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // id from https://telegram.me/userinfobot
const XPATH_QUERY = process.env.XPATH_QUERY;

const telegramMessagePath = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=`;

async function fetchLinks(url, query) {
  const result = await fetch(url);
  const html = await result.text();
  const document = parse5.parse(html.toString());
  const xhtml = xmlser.serializeToString(document);
  const doc = new Dom().parseFromString(xhtml, 'text/html');
  const select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  const nodes = select(query, doc);
  const willhabenURL = new URL(WILLHABEN_URL);
  return nodes.map((node) => {
    const url = new URL(willhabenURL.protocol + '//' + willhabenURL.host + node.value);
    return url.origin + url.pathname;
  });
}

async function start() {
  const linkCache = await fetchLinks(WILLHABEN_URL, XPATH_QUERY);

  setInterval(async () => {
    console.log('check for new links');
    const newLinks = await fetchLinks(WILLHABEN_URL, XPATH_QUERY);
    newLinks.forEach((newLink) => {
      if (!linkCache.includes(newLink)) {
        linkCache.push(newLink);
        fetch(telegramMessagePath + encodeURI(newLink));
        console.log('new', newLink);
      }
    });
  }, INTERVAL);
}

start();
