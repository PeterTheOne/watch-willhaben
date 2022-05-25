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
const HIGHLIGHT_WORDS = process.env.HIGHLIGHT_WORDS.split(',');
const IGNORE_WORDS = process.env.IGNORE_WORDS.split(',');

const telegramMessagePath = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=`;

async function fetchLinks(url, query, highlightWords, ignoreWords) {
  const result = await fetch(url);
  const html = await result.text();
  const document = parse5.parse(html.toString());
  const xhtml = xmlser.serializeToString(document);
  const doc = new Dom().parseFromString(xhtml, 'text/html');
  const select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  const nodes = select(query, doc);
  const willhabenURL = new URL(WILLHABEN_URL);
  return nodes
    .map((node) => {
    const url = new URL(willhabenURL.protocol + '//' + willhabenURL.host + node.value);
    return {
      link: url.origin + url.pathname,
      ignore: ignoreWords.some(element => node.value.includes(element)),
      foundHighlightWords: highlightWords.filter(h => node.value.includes(h)),
    };
  });
}

async function start() {
  const linkCache = [];
  let countFetches = 0;

  const loop = async () => {
    try {
      console.log('check for new links', countFetches);
      const newResults = await fetchLinks(WILLHABEN_URL, XPATH_QUERY, HIGHLIGHT_WORDS, IGNORE_WORDS);
      newResults.forEach((r) => {
        if (!linkCache.includes(r.link)) {
          linkCache.push(r.link);
          const foundHighlightWordStr = r.foundHighlightWords.map(h => `#${h}`.replace('-', '')).join(' ');
          //console.log('new', r.link, r.ignore, foundHighlightWordStr);
          // Don't message for the first 10 fetches.
          if (countFetches > 10 && !r.ignore) {
            fetch(telegramMessagePath + encodeURI(`${r.link} ${foundHighlightWordStr}`));
            console.log('new', r.link, foundHighlightWordStr);
          }
        }
      });
      countFetches++;
    } catch (e) {
      console.error(e);
    }
    setTimeout(loop, INTERVAL);
  }

  loop();
}

start();
