const { writeFile } = require("fs/promises");
const fs = require("fs");
const { downloadContentFromMessage } = require("@adiwajshing/baileys");
const {
    Sticker,
    createSticker,
    StickerTypes,
} = require("wa-sticker-formatter");
const { off } = require("process");
class sticker {
    static async imgToSticker(sock, chatId, msg, msgData) {
        let fileName;
        let buffer;
        let data;
        if (msgData.isQuoted) {
            data = msgData.quotedMessage.quotedMessage;
        } else {
            data = msg.message;
        }
        if (data.hasOwnProperty("imageMessage")) {
            const stream = await downloadContentFromMessage(
                data.imageMessage,
                "image"
            );
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let randomName = (Math.random() + 1).toString(36).substring(7);
            fileName = `Media/stickers/${randomName}.jpeg`;
            //      await writeFile(fileName, buffer);
        } else {
            const stream = await downloadContentFromMessage(
                data.videoMessage,
                "video"
            );
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let randomName = (Math.random() + 1).toString(36).substring(7);
            fileName = `Media/stickers/${randomName}.gif`;
            await writeFile(fileName, buffer);
        }
        let stickerType;
        if (msgData.msgText === "crop") {
            stickerType = "crop";
        } else {
            stickerType = "full";
        }
        const sticker = new Sticker(buffer, {
            pack: "I-Bot Stickers", // The pack name
            author: "I-Bot", // The author name
            type: stickerType, // The sticker type
            categories: ["🤩", "🎉"], // The sticker category
            id: "12345", // The sticker id
            quality: 50, // The quality of the output file
        });
        await sock.sendMessage(chatId, await sticker.toMessage(), { quoted: msg });
    }

    static async stickerToImg(sock, chatId, msg, msgData) {
        let buffer;
        let fileName;
        if (msgData.quotedMessage.quotedMessage.hasOwnProperty("stickerMessage")) {
            const stream = await downloadContentFromMessage(
                msgData.quotedMessage.quotedMessage.stickerMessage,
                "image"
            );
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let randomName = (Math.random() + 1).toString(36).substring(7);
            fileName = `Media/stickers/${randomName}.jpeg`;
            await writeFile(fileName, buffer);
            await sock.sendMessage(
                chatId, {
                    image: { url: fileName },
                    mimetype: "image/jpeg",
                }, { quoted: msg }
            );
            fs.unlinkSync(`Media/stickers/${randomName}.jpeg`);
        } else {
            await sock.sendMessage(
                chatId, { text: "Can only convert sticker to image" }, { quoted: msg }
            );
        }
    }
    static async stealSticker(sock,chatId,msg,msgData){
        if(msgData.quotedMessage.quotedMessage.hasOwnProperty("stickerMessage")){
            let author="I-Bot Stickers";
            if(msgData.msgText!=""){
                author=msgData.msgText
            }
            const stream = await downloadContentFromMessage(
                msgData.quotedMessage.quotedMessage.stickerMessage,
                "image"
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const sticker = new Sticker(buffer, {
                pack: author, // The pack name
                author: "", // The author name
                type: "full", // The sticker type
                categories: ["🤩", "🎉"], // The sticker category
                id: "12345", // The sticker id
                quality: 50, // The quality of the output file
            });
            await sock.sendMessage(chatId, await sticker.toMessage(), { quoted: msg });

        }
        else{
            await sock.sendMessage(chatId,{text:"Can change the author of sticker only"},{quoted:msg});
        }
    }
}
module.exports = sticker;