const DbOperation = require("../Db/dbOperation.js");
const WAMessage = require("@adiwajshing/baileys/lib");
class MsgDetails {
    static async sendLastTag(sock, chatId, senderId, msg) {
        try {
            const tagObj = await DbOperation.getLastTagObj(chatId, senderId);

            const pushName = await DbOperation.getPushName(senderId);
            if (tagObj !== "") {
                let obj = JSON.parse(tagObj);
                await sock.sendMessage(
                    chatId, { text: `${pushName} have been tagged here.` }, { quoted: obj }
                );
            } else {
                await sock.sendMessage(
                    chatId, { text: `No Tags, No one likes you ${pushName}😞` }, { quoted: msg }
                );
            }
        } catch (err) {
            await sock.sendMessage(
                chatId, { text: "Sorry! Some Error Occured" }, { quoted: msg }
            );
            console.log("Sending last tag message Error : ", err);
        }
    }
    static async msgCount(sock, chatId, senderId, msg) {
        try {
            const msgCount = await DbOperation.getMsgCount(chatId, senderId);
            await sock.sendMessage(
                chatId, { text: `Ur msg count is ${msgCount}` }, { quoted: msg }
            );
        } catch (err) {
            console.log("msg count", err);
        }
    }
    static async taggedMsgCount(sock,chatId,msg,msgData){
        try{
            const id=msgData.quotedMessage.participant;
            const msgCount=await DbOperation.getMsgCount(chatId,id);
            let name=await DbOperation.getPushName(id);
            if(name==="You")
                name=id.split("@")[0];;
            await sock.sendMessage(chatId,{text:`${name} has ${msgCount} messages`},{quoted:msg});
        }catch(err){
            console.log("Tagged msg count",err);
        }
    }
}
module.exports = MsgDetails;