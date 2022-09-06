const gis = require('g-i-s');
const {
    Sticker,
    createSticker,
    StickerTypes,
} = require("wa-sticker-formatter");
class StickerSearch{
    static async stickerSearch(sock,chatId,msg,msgData){
        try{
            gis(msgData.msgText,result);
            async function result(error, results) {
            if (error) {
                console.log(error);
                await sock.sendMessage(chatId,{text:`${error}`},{quoted:msg});
            }
            else {
                console.log(results[0].url);
            // console.log(JSON.stringify(results, null, '  '));
                const sticker = new Sticker(results[0].url, {
                    pack: "I-Bot Stickers", // The pack name
                    author: "I-Bot", // The author name
                    type: "full", // The sticker type
                    categories: ["🤩", "🎉"], // The sticker category
                    id: "12345", // The sticker id
                    quality: 50, // The quality of the output file
                });
                    await sock.sendMessage(chatId, await sticker.toMessage(), { quoted: msg });
                }
            }
        }catch(err){
            console.log(err);
            await sock.sendMessage(chatId,{text:err},{quoted:msg});
        }
    }
}
module.exports=StickerSearch;