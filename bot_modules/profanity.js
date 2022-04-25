const DbOperation = require("../Db/dbOperation.js");
class Profanity {
    static async checkWord(sock, chatId, senderId, msgText, sett, msg, botId) {
        try {
            let words = msgText.split(" ");
            let name = await DbOperation.getPushName(senderId);
            for (let word in words) {
                if (sett.has(words[word].toLowerCase())) {
                    let warnCount = await DbOperation.getWarnCount(chatId, senderId);
                    if (warnCount >= 2) {
                        const grpMembers = await sock.groupMetadata(chatId);
                        const grpAdminList = [];

                        for (let i = 0; i < grpMembers.participants.length; i++) {
                            if (grpMembers.participants[i].admin) {
                                grpAdminList.push(grpMembers.participants[i].id);
                            }
                        }
                        if (grpAdminList.find((id) => id === botId)) {
                            await sock.sendMessage(
                                chatId, {
                                    text: `#kick @${senderId.replace("@s.whatsapp.net", "")}`,
                                    mentions: [senderId],
                                }, { quoted: msg }
                            );
                            DbOperation.resetWarn(chatId, senderId);
                        } else {
                            await sock.sendMessage(
                                chatId, {
                                    text: `${name} have been warned three times for bad language/behaviour!\nAdmins please kick this member or make me admin`,
                                }, { quoted: msg }
                            );
                            DbOperation.resetWarn(chatId, senderId);
                        }
                    } else {
                        if (warnCount == 0) {
                            await sock.sendMessage(
                                chatId, {
                                    text: `${name} have being warned for bad language/behaviour!!`,
                                }, { quoted: msg }
                            );
                        } else {
                            await sock.sendMessage(
                                chatId, {
                                    text: `${name} have being warned again for bad language/behaviour!!`,
                                }, { quoted: msg }
                            );
                        }
                        DbOperation.addWarn(chatId, senderId);
                    }
                    break;
                }
            }
        } catch (err) {
            console.log("Checking for profanity error", err);
        }
    }
}
module.exports = Profanity;