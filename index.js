const fetch = require('node-fetch');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
require('dotenv').config();

const WILLHABEN_URL = process.env.WILLHABEN_URL;
const INTERVAL = parseInt(process.env.INTERVAL, 10);
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const HIGHLIGHT_WORDS = process.env.HIGHLIGHT_WORDS.split(',');
const IGNORE_WORDS = process.env.IGNORE_WORDS.split(',');

async function sendMessageToBot(message) {
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const params = new URLSearchParams({
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });

  try {
    const response = await fetch(`${telegramApiUrl}?${params}`, { method: 'POST' });
  } catch (error) {
    console.error('Error sending message to the bot:', error);
  }
}

async function fetchLinks(url, highlightWords, ignoreWords) {
  const response = await fetch(url);
  const html = await response.text();
  const document = parse5.parse(html.toString());
  const xhtml = xmlser.serializeToString(document);
  const doc = new Dom().parseFromString(xhtml);
  const select = xpath.useNamespaces({ "x": "http://www.w3.org/1999/xhtml" });

  const nodes = select("//x:a[contains(@href, '/iad/immobilien/d/mietwohnungen/')]", doc);

  return nodes.map(node => {
    const href = node.getAttribute('href');
    const absoluteUrl = new URL(href, url).href;
    const isListing = absoluteUrl.includes('/iad/immobilien/d/mietwohnungen/');

    // Determine if any ignore word is present in the URL
    const hasIgnoreWord = ignoreWords.some(word => href.includes(word));

    console.log(`URL: ${absoluteUrl}, Is Listing: ${isListing}, Has Ignore Word: ${hasIgnoreWord}`);

    return {
      link: absoluteUrl,
      ignore: !isListing,
      foundHighlightWords: highlightWords.filter(word => href.includes(word)),
    };
  }).filter(link => !link.ignore);
}


async function start() {
  const linkCache = new Set();
  let countFetches = 0;

  const loop = async () => {
    try {
      console.log(`Checking for new links at fetch count: ${countFetches}`);
      const newResults = await fetchLinks(WILLHABEN_URL, HIGHLIGHT_WORDS, IGNORE_WORDS);
      console.log('newResults: ',newResults)
      newResults.forEach(async ({ link, foundHighlightWords }) => {
        if (!linkCache.has(link)) {
          linkCache.add(link); // Add the new link to the cache
          const highlightStr = foundHighlightWords.map(word => `#${word}`).join(' ');
          const message = `New listing found: ${link} ${highlightStr}`;
          console.log(message);
          await sendMessageToBot(message); // Send the message to the bot
        }
      });

      countFetches++;
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
    setTimeout(loop, INTERVAL);
  };

  loop();
}



start();
