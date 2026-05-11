const fetch = require("node-fetch");
const INTL = require("intl");
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");

class Crypto {
    _baseUrl = "https://api.coingecko.com/api/v3/";
    _coinsData = new Map();      // Map<symbol, id[]>   e.g. "btc" -> ["bitcoin", "wrapped-bitcoin", ...]
    _coinsDataName = new Map();  // Map<name,   id[]>   e.g. "bitcoin" -> ["bitcoin"]
    _coinsDetails;
    _ready = false;
    _newsApiKey = process.env.NEWS_API;

    constructor() {
        this._init().catch((e) => console.error("Crypto init failed:", e));
    }

    async _init() {
        const res = await fetch(`${this._baseUrl}coins/list`);
        if (!res.ok) throw new Error(`coins/list failed: ${res.status}`);
        this._coinsDetails = await res.json();

        for (const coin of this._coinsDetails) {
            const sym = coin.symbol && coin.symbol.toLowerCase();
            const name = coin.name && coin.name.toLowerCase();
            if (sym) {
                const arr = this._coinsData.get(sym) || [];
                arr.push(coin.id);
                this._coinsData.set(sym, arr);
            }
            if (name) {
                const arr = this._coinsDataName.get(name) || [];
                arr.push(coin.id);
                this._coinsDataName.set(name, arr);
            }
        }
        this._ready = true;
        console.log(`Crypto ready — ${this._coinsDetails.length} coins indexed`);
    }

    _fmt(n) {
        if (n === undefined || n === null || Number.isNaN(n)) return "N/A";
        return new INTL.NumberFormat("hi", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 10,
        }).format(n);
    }

    async getPrices(sock, chatId, msgData, msg) {
        if (!msgData || !msgData.msgText || msgData.msgText.trim() === "") {
            await sock.sendMessage(chatId, { text: "Empty Parameter!" }, { quoted: msg });
            return;
        }

        if (!this._ready) {
            await sock.sendMessage(
                chatId,
                { text: "Bot is still warming up, try again in a few seconds." },
                { quoted: msg }
            );
            return;
        }

        const coinName = msgData.msgText.toLowerCase().trim();

        let ids;
        if (this._coinsDataName.has(coinName))    ids = this._coinsDataName.get(coinName);
        else if (this._coinsData.has(coinName))   ids = this._coinsData.get(coinName);
        else {
            await sock.sendMessage(chatId, { text: "Wrong Coin Name" }, { quoted: msg });
            return;
        }

        // Batch all ids into ONE request — avoids CoinGecko rate limiting (429).
        const idList = ids.join(",");
        let res, json;
        try {
            res = await fetch(
                `${this._baseUrl}simple/price?ids=${encodeURIComponent(idList)}&vs_currencies=usd,inr,btc`
            );
            json = await res.json();
        } catch (e) {
            await sock.sendMessage(chatId, { text: `Network error: ${e.message}` }, { quoted: msg });
            return;
        }

        if (!res.ok) {
            const note = res.status === 429 ? " (rate limited — try again in a minute)" : "";
            await sock.sendMessage(chatId, { text: `API error ${res.status}${note}` }, { quoted: msg });
            return;
        }

        let finalStr = "";
        for (const id of ids) {
            const prices = json && json[id];
            if (!prices) {
                finalStr += `_*${id.toUpperCase()}*_\nPrice data unavailable\n\n`;
                continue;
            }
            finalStr +=
                `_*${id.toUpperCase()}*_ \n\n` +
                `${coinName.toUpperCase()} USD = $${this._fmt(prices.usd)}\n` +
                `${coinName.toUpperCase()} INR = ₹${this._fmt(prices.inr)}\n` +
                `${coinName.toUpperCase()} BTC = ₿${this._fmt(prices.btc)}\n\n`;
        }

        await sock.sendMessage(chatId, { text: finalStr || "No price data returned." }, { quoted: msg });
    }

    async getNews(sock, chatId, msgData) {
        let newsJson;
        if (msgData.msgText != "") {
            const news = await fetch(
                `https://newsapi.org/v2/everything?q=+${msgData.msgText}&apiKey=${this._newsApiKey}&sortBy=relevancy&domains=cointelegraph.com,coindesk.com,u.today,cryptoslate.com&language=en`
            );
            newsJson = await news.json();
        } else {
            const news = await fetch(
                `https://newsapi.org/v2/everything?apiKey=${this._newsApiKey}&sortBy=publishedAt&domains=cointelegraph.com,coindesk.com,u.today,cryptoslate.com&language=en`
            );
            newsJson = await news.json();
        }

        let finalStr = "*Crypto News* \n\n";
        if (!newsJson || !Array.isArray(newsJson.articles)) {
            await sock.sendMessage(chatId, { text: "Could not fetch news." });
            return;
        }
        for (let i = 0; i < Math.min(10, newsJson.articles.length); i++) {
            finalStr += `📊${newsJson.articles[i].description}\n\n`;
        }
        await sock.sendMessage(chatId, { text: finalStr });
    }

    async getStockPrice(sock, chatId, msgData, msg) {
        if (msgData.msgText === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }
        const url = `https://www.google.com/finance/quote/${msgData.msgText}:NSE`;
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            let finalString = "";
            const stockName = $(".zzDege");
            if (stockName.text() == "") {
                finalString = "Wrong Name Entered";
            } else {
                const stockPrice = $(".fxKbKc");
                finalString = `*${stockName.text()}* \n*Price:-* ${stockPrice.text()}`;
            }
            await sock.sendMessage(chatId, { text: finalString }, { quoted: msg });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = new Crypto();
