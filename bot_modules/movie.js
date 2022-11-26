const axios = require("axios");
const cheerio = require("cheerio");

class MovieLinks {
    static async getLinks(sock, chatId, msg, msgData) {
        try {
            if(msgData.msgText.length===0){
                await sock.sendMessage(chatId,{text:`*Abe Saale*Send movie name to be searched!!`},{quoted:msg});
                return;
            }
            let url = `https://pronoob-aio-drive.cf/Sct?search=${msgData.msgText.replaceAll(
        " ",
        "+"
      )}`;
            console.log(url);
            // Fetch HTML of the page we want to scrape
            const { data } = await axios.get(url);
            // Load HTML we fetched in the previous line
            const $ = cheerio.load(data);
            const list = $(".m-2 div[title] span a");
            let prefix = "https://pronoob-aio-drive.cf/";
            let movieList = `🍿👀📽\n`;

            if (list.length === 0) {
                await sock.sendMessage(
                    chatId, { text: `Movie not found! Give correct name dumbo` }, { quoted: msg }
                );
                return;
            }
            console.log("Movie list", list.length);
            list.each((idx, el) => {
                if (idx % 2 == 0) {
                    if (!(idx & 1)) {
                        let temp = $(el).attr("href");
                        movieList = movieList + prefix + temp + "\n" + "\n🍿👀📽\n\n";
                    }
                }
            });
            let finalList = `${msgData.msgText} Links \n${movieList}`;
            console.log(finalList);
            await sock.sendMessage(chatId, { 
                text: finalList,
                linkPreview:true 
                }, 
                { quoted: msg }
            );
        } catch (err) {
            console.log(err);
            await sock.sendMessage(
                chatId, { text: `${err.message}` }, { quoted: msg }
            );
        }
    }
}
module.exports = MovieLinks;