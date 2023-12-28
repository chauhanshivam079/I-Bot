const { writeFile } = require("fs/promises");
const fs = require("fs");
const { downloadContentFromMessage } = require("@adiwajshing/baileys");
const {
    Sticker,
    createSticker,
    StickerTypes,
} = require("wa-sticker-formatter");
const tti=require("text-to-image");
// const ffmpegInstaller=require("@ffmpeg-installer/ffmpeg");
// const ffmpeg=require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// const ffmpegInstaller=require("@ffmpeg-installer/ffmpeg");
const avconv = require("avconv");
const ffmpeg=require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(avconv);
class sticker {
    static async imgToSticker(sock, chatId, msg, msgData) {
        try{
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
            author: chatId=="917389283811-1577375970@g.us"?"Bablabot😋":"I-Bot", // The author name
            type: stickerType, // The sticker type
            categories: ["🤩", "🎉"], // The sticker category
            id: "12345", // The sticker id
            quality: 50, // The quality of the output file
        });
        await sock.sendMessage(chatId, await sticker.toMessage(), { quoted: msg });
    }catch(err){
        await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
    }
    }

    static async stickerToImg(sock, chatId, msg, msgData) {
        try{
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
    }catch(err){
        await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
    }
    }
    static async stealSticker(sock,chatId,msg,msgData){
        try{
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
    }catch(err){
        await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
    }
    }
    static async textToSticker(sock,chatId,msg,msgData){
        try{
            let ques;
            if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
                ques = msgData.quotedMessage.quotedMessage.conversation;
            } else {
                ques = msgData.msgText;
            }
            //console.log(ques);

            if (ques === "") {
                await sock.sendMessage(
                    chatId, { text: "Write text or tag message to convert it into sticker" }, { quoted: msg });
                return;
            }
            const datauri= await tti.generate(ques);
            const buffer=Buffer.from(datauri.split(",")[1],"base64");
            const sticker=new Sticker(buffer,{
                pack: "I-Bot Stickers", // The pack name
                author: "I-Bot", // The author name
                type: "full", // The sticker type
                categories: ["🤩", "🎉"], // The sticker category
                id: "12345", // The sticker id
                quality: 50, // The quality of the output file
        });
        await sock.sendMessage(chatId, await sticker.toMessage(), { quoted: msg });
        }catch(err){
            console.log(err);
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }
}
module.exports = sticker;
