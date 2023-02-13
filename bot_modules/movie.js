const axios = require("axios");
const cheerio = require("cheerio");

class MovieLinks {
    static async getLinks(sock, chatId, msg, msgData) {
        try {
            // if(msgData.msgText.length===0){
            //     await sock.sendMessage(chatId,{text:`*Abe Saale* Send movie name to be searched!!`},{quoted:msg});
            //     return;
            // }
            let url = `https://www.myhindilekh.in/download-${msgData.msgText.replaceAll(
        " ",
        "-"
      )}`;
            console.log(url);
            // Fetch HTML of the page we want to scrape
            const { data } = await axios.get(url);
            // Load HTML we fetched in the previous line
            const $ = cheerio.load(data);
            const list = $('div[class="entry-content"] p a');
            //console.log(list);
            let movieList = `🍿👀📽\n`;

            if (list.length === 0) {
                // await sock.sendMessage(
                //     chatId, { text: `Movie not found! Give correct name dumbo` }, { quoted: msg }
                // );
                return;
            }
            console.log("Movie list", list.length);

            list.each((idx, el) => {
                        let temp = $(el).attr("href");
                        movieList = movieList + temp + "\n" + "\n🍿👀📽\n\n";
            });
            //console.log(movieList);
            let finalList = `${msgData.msgText} Links \n${movieList}`;
            console.log(finalList);
            await sock.sendMessage(chatId, { 
                text: finalList,
                linkPreview:true 
                }, 
                { quoted: msg }
            );
        } catch (err) {
            console.log("in catch",err.message);
            try{
            let url = `https://www.myhindilekh.in/${msgData.msgText.replaceAll(
                " ",
                "-"
            )}`;
            console.log(url);
            // Fetch HTML of the page we want to scrape
            const { data } = await axios.get(url);
            // Load HTML we fetched in the previous line
            const $ = cheerio.load(data);
            const list = $('div[class="entry-content"] p a');
            //console.log(list);
            let movieList = `🍿👀📽\n`;

            if (list.length === 0) {
                await sock.sendMessage(
                    chatId, { text: `Movie not found! Give correct name dumbo` }, { quoted: msg }
                );
                return;
            }
            console.log("Movie list", list.length);

            list.each((idx, el) => {
                        let temp = $(el).attr("href");
                        movieList = movieList + temp + "\n" + "\n🍿👀📽\n\n";
            });
            //console.log(movieList);
            let finalList = `${msgData.msgText} Links \n${movieList}`;
            console.log(finalList);
            await sock.sendMessage(chatId, { 
                text: finalList,
                linkPreview:true 
                }, 
                { quoted: msg }
            );
        }catch(err){
            await sock.sendMessage(chatId, { text: `${err.message}` }, { quoted: msg });
        }
        }
    }
}
module.exports = MovieLinks;