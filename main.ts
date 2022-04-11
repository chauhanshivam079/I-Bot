import { Boom } from "@hapi/boom";
import { is } from "cheerio/lib/api/traversing";
import P from "pino";
import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useSingleFileAuthState,
} from "./src";
const groupManage = require("./bot_modules/groupManage.js");
const textToHand = require("./bot_modules/textToHandwriting.js");
const ProductSearch = require("./bot_modules/ProductSearch.js");
const Search = require("./bot_modules/Search.js");
const fs = require("fs");

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({
  logger: P().child({ level: "debug", stream: "store" }),
});
store.readFromFile("./baileys_store_multi.json");
// save every 10s
setInterval(() => {
  store.writeToFile("./baileys_store_multi.json");
}, 10_000);

const { state, saveState } = useSingleFileAuthState("./auth_info_multi.json");

// start a connection
const startSock = async () => {
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  //console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    //logger: P({ level: 'trace' }),
    printQRInTerminal: true,
    auth: state,
    // implement to handle retries
    getMessage: async (key) => {
      return {
        conversation: "hello",
      };
    },
  });

  store.bind(sock.ev);

  const sendMessageWTyping = async (msg: AnyMessageContent, jid: string) => {
    await sock.presenceSubscribe(jid);
    await delay(500);

    await sock.sendPresenceUpdate("composing", jid);
    await delay(2000);

    await sock.sendPresenceUpdate("paused", jid);

    await sock.sendMessage(jid, msg);
  };

  sock.ev.on("chats.set", (item) =>
    console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`)
  );
  sock.ev.on("messages.set", (item) =>
    console.log(
      `recv ${item.messages.length} messages (is latest: ${item.isLatest})`
    )
  );
  sock.ev.on("contacts.set", (item) =>
    console.log(`recv ${item.contacts.length} contacts`)
  );

  const chatList = [];
  const pre = "#";
  const botId = "17207416585@s.whatsapp.net";
  let i = 0;
  let z;
  const tthUserDetail = new Map();
  sock.ev.on("messages.upsert", async (m) => {
    console.log(JSON.stringify(m, undefined, 2));
    const msg = m.messages[0];
    if (msg.hasOwnProperty("message")) {
      const senderId = m.messages[0].key.participant;
      const isMe = m.messages[0].key.fromMe;
      const senderName = m.messages[0].pushName;
      const chatId = m.messages[0].key.remoteJid;
      const msgKey = m.messages[0].message;

      if (msgKey.hasOwnProperty("conversation")) {
        const msgType = "conversation";
        const msgText = m.messages[0].message.conversation;
        if (msgText[0] === pre) {
          const cmd = msgText.toLowerCase();
          const cmdArr = cmd.split(" ");
          if (
            [pre + "add", pre + "kick", pre + "promote", pre + "demote"].find(
              (id) => id === cmdArr[0]
            )
          ) {
            if (isAdminOrMember(chatId, botId, "isAdmin")) {
              let result = getWhatsappId(m, cmdArr);
              if (result.length > 0) {
                if (cmdArr[0] === pre + "add")
                  groupManage.add(sock, chatId, [result], senderId, msg);
                else if (cmdArr[0] === pre + "kick")
                  groupManage.remove(sock, chatId, [result], senderId, msg);
                else if (cmdArr[0] === pre + "promote")
                  groupManage.promote(sock, chatId, [result], senderId, msg);
                else if (cmdArr[0] === pre + "demote")
                  groupManage.demote(sock, chatId, [result], senderId, msg);
              } else {
                await sock.sendMessage(
                  chatId,
                  {
                    text: "Wrong Number!!\nYou Noob who made u the admin of this group",
                  },
                  { quoted: m.messages[0] }
                );
              }
            } else {
              await sock.sendMessage(
                chatId,
                { text: "Bot not an Admin" },
                { quoted: m.messages[0] }
              );
            }
          } else if (cmdArr[0] === pre + "tth") {
            try {
              if (tthUserDetail.has(senderId)) {
                await sock.sendMessage(
                  chatId,
                  {
                    text: "You already initiated the process.",
                  },
                  { quoted: msg }
                );

                textToHand.checkForLeftOverDetails(
                  tthUserDetail,
                  senderId,
                  sock,
                  chatId
                );
              } else {
                await sock.sendMessage(
                  chatId,
                  {
                    text: "Enter your name\n*Reply to this message with # as Prefix*",
                  },
                  { quoted: m.messages[0] }
                );
              }
            } catch (err) {
              console.log(err);
              await sock.sendMessage(
                chatId,
                {
                  text: "Sorry! Some Error Occured\nTry Again",
                },
                { quoted: msg }
              );
            }
          } else if (cmdArr[0] === pre + "psearch") {
            let productName = "";
            for (let i = 1; i < cmdArr.length; i++) {
              productName = productName + cmdArr[i] + " ";
            }

            console.log(productName);
            ProductSearch.search(
              sock,
              chatId,
              msg,
              productName.slice(0, productName.length - 1)
            );
          } else if (cmdArr[0] === pre + "gs") {
            Search.gsearch(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "is") {
            Search.isearch(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "vs") {
            Search.vsearch(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "mp3s") {
            Search.searchMp3ByName(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "mp3c") {
            const tempMsgText = msgText.split(" ")[1];
            Search.mp3Convertor(sock, chatId, msg, tempMsgText);
          }
          //next command
        }

        // if (msgText===pre+"1")
        // groupManage.remove(sock,chatId,participantList,senderId,msg)
        // if (msgText===pre+"2") groupManage.add();
        // if (msgText===pre+"3") groupManage.demote(sock,chatId,participantList,senderId,msg)
        // if (msgText===pre+"4")	groupManage.promote(sock, chatId, participantList, senderId,msg)
        if (msgText === pre + "5")
          groupManage.getLink(sock, chatId, senderId, msg);
        // console.log(typeof m)
      } else if (msgKey.hasOwnProperty("audioMessage")) {
        const msgType = "audioMessage";
      } else if (msgKey.hasOwnProperty("imageMessage")) {
        if (msgKey.imageMessage.hasOwnProperty("caption")) {
          let caption = msgKey.imageMessage.caption;
          if (caption === pre + "") {
          }
        }
      } else if (msgKey.hasOwnProperty("videoMessage")) {
        const msgType = "videoMessage";
      } else if (msgKey.hasOwnProperty("stickerMessage")) {
        const msgType = "stickerMessage";
      } else if (msgKey.hasOwnProperty("reactionMessage")) {
        const msgType = "reactionMessage";
        const reactionMsg = m.messages[0].message.reactionMessage.text;
      } else if (msgKey.hasOwnProperty("extendedTextMessage")) {
        const msgType = "reply";
        const msgText = m.messages[0].message.extendedTextMessage.text;
        const cmd = msgText.toLowerCase();
        const cmdArr = cmd.split(" ");
        let quotedMessageId = "";
        const pre = "#";
        if (cmdArr[0] === pre + "psearch") {
          let productName = "";
          for (let i = 1; i < cmdArr.length; i++) {
            productName = productName + cmdArr[i] + " ";
          }
          ProductSearch.search(
            sock,
            chatId,
            msg,
            productName.slice(0, productName.length - 1)
          );
        } else if (msgText[0] === pre) {
          const quotedMessage =
            m.messages[0].message.extendedTextMessage.contextInfo;
          quotedMessageId = quotedMessage.participant
            ? quotedMessage.participant
            : quotedMessage.mentionedJid[0];
          console.log(await isAdminOrMember(chatId, botId, "isAdmin"));
          const isAdmin = await isAdminOrMember(chatId, botId, "isAdmin");

          if (msgText.split(" ")[0] === pre + "add") {
            if (isAdmin) {
              groupManage.add(sock, chatId, [quotedMessageId], senderId, msg);
            } else {
              await sock.sendMessage(
                chatId,
                { text: " BOT not Admin Yet!" },
                { quoted: m.messages[0] }
              );
            }
          } else if (msgText.split(" ")[0] === pre + "kick") {
            if (isAdmin) {
              groupManage.remove(
                sock,
                chatId,
                [quotedMessageId],
                senderId,
                msg
              );
            } else {
              await sock.sendMessage(
                chatId,
                { text: " BOT not Admin Yet!" },
                { quoted: m.messages[0] }
              );
            }
          } else if (msgText.split(" ")[0] === pre + "promote") {
            if (isAdmin) {
              groupManage.promote(
                sock,
                chatId,
                [quotedMessageId],
                senderId,
                msg
              );
            } else {
              await sock.sendMessage(
                chatId,
                { text: " BOT not Admin Yet!" },
                { quoted: m.messages[0] }
              );
            }
          } else if (msgText.split(" ")[0] === pre + "demote") {
            if (isAdmin) {
              groupManage.demote(
                sock,
                chatId,
                [quotedMessageId],
                senderId,
                msg
              );
            } else {
              await sock.sendMessage(
                chatId,
                { text: " BOT not Admin Yet!" },
                { quoted: m.messages[0] }
              );
            }
          } else if (msgText === pre + "name") {
            await sock.sendMessage(
              chatId,
              { text: "I-Bot" },
              { quoted: m.messages[0] }
            );
          } else if (
            quotedMessage.quotedMessage.conversation ===
            "Enter your name\n*Reply to this message with # as Prefix*"
          ) {
            const userDetail = {
              senderId: senderId,
              name: msgText.slice(1),
            };
            tthUserDetail.set(senderId, userDetail);
            await sock.sendMessage(
              chatId,
              {
                text: "Enter the second thing to put below name\n*Reply to this message with # as Prefix*",
              },
              { quoted: m.messages[0] }
            );
          } else if (
            quotedMessage.quotedMessage.conversation ===
            "Enter the second thing to put below name\n*Reply to this message with # as Prefix*"
          ) {
            if (tthUserDetail.has(senderId)) {
              let temp = tthUserDetail.get(senderId);
              temp.secondField = msgText.slice(1);
              tthUserDetail.set(senderId, temp);
              await sock.sendMessage(
                chatId,
                {
                  text: "Enter the heading of your content\n*Reply to this message with # as Prefix*",
                },
                { quoted: m.messages[0] }
              );
            } else {
              await sock.sendMessage(
                chatId,
                { text: "You have not initiated the process\nSend #tth" },
                { quoted: m.messages[0] }
              );
            }
          } else if (
            quotedMessage.quotedMessage.conversation ===
            "Enter the heading of your content\n*Reply to this message with # as Prefix*"
          ) {
            if (tthUserDetail.has(senderId)) {
              let temp = tthUserDetail.get(senderId);
              temp.heading = msgText.slice(1);
              tthUserDetail.set(senderId, temp);
              await sock.sendMessage(
                chatId,
                {
                  text: "Enter the content\n*Reply to this message with # as Prefix*",
                },
                { quoted: m.messages[0] }
              );
            } else {
              await sock.sendMessage(
                chatId,
                { text: "You have not initiated the process\nSend #tth" },
                { quoted: m.messages[0] }
              );
            }
          } else if (
            quotedMessage.quotedMessage.conversation ===
            "Enter the content\n*Reply to this message with # as Prefix*"
          ) {
            if (tthUserDetail.has(senderId)) {
              let temp = tthUserDetail.get(senderId);
              temp.content = msgText.slice(1).split("\n").join("<br>");
              tthUserDetail.set(senderId, temp);

              let userDetailObj = tthUserDetail.get(senderId);
              try {
                await sock.sendMessage(
                  chatId,
                  { text: "Processing your file.....\nPlease wait!" },
                  { quoted: msg }
                );
                await textToHand.convert(
                  sock,
                  chatId,
                  senderId,
                  msg,
                  userDetailObj.name,
                  userDetailObj.secondField,
                  userDetailObj.heading,
                  userDetailObj.content
                );
                tthUserDetail.delete(senderId);
              } catch (err) {
                console.log(err);
                await sock.sendMessage(
                  chatId,
                  {
                    text: "Sorry!! Some error occured\nTry again",
                  },
                  { quoted: msg }
                );
              }
            } else {
              await sock.sendMessage(
                chatId,
                { text: "You have not initiated the process\nSend #tth" },
                { quoted: m.messages[0] }
              );
            }
          } else if (cmdArr[0] === pre + "gs") {
            Search.gsearch(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "is") {
            Search.isearch(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "vs") {
            Search.vsearch(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "mp3s") {
            Search.searchMp3ByName(
              sock,
              chatId,
              msg,
              cmdArr.slice(1, cmdArr.length).join(" ")
            );
          } else if (cmdArr[0] === pre + "mp3c") {
            Search.mp3Converter(sock, chatId, msg, msgText.split(" ")[1]);
          }
        }
      }

      // const chat_id=m
      // if ()
      // if(!msg.key.fromMe /*&& m.type === 'notify'*/) {
      // 	console.log(m.type)

      // 	console.log("=====================================================================================================")
      // 	//console.log('replying to', m.messages[0].key.remoteJid)
      // 	//await sock!.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
      // 	//await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
      // }
    }
  });

  //to check whether given id is admin or member or not
  const isAdminOrMember = async (chatId, senderId, check) => {
    const grpMembers = await sock.groupMetadata(chatId);
    const grpAdminList = [];
    const grpMemberList = [];
    for (i = 0; i < grpMembers.participants.length; i++) {
      if (grpMembers.participants[i].admin) {
        grpAdminList.push(grpMembers.participants[i].id);
      }
      grpMemberList.push(grpMembers.participants[i].id);
    }
    if (check === "isAdmin") return grpAdminList.find((id) => id === senderId);
    if (check === "isMember")
      return grpMemberList.find((id) => id === senderId);
  };

  //to get whatsappId from the msg
  const getWhatsappId = (m, cmdArr) => {
    let whatsappId = "";
    let numToAdd = "";
    let i;
    for (i = 1; i < cmdArr.length; i++) {
      numToAdd += cmdArr[i];
    }
    console.log("numtoadd", numToAdd, numToAdd.length);
    if (
      numToAdd.length === 10 ||
      numToAdd.length === 12 ||
      numToAdd.length === 13
    ) {
      whatsappId = "@s.whatsapp.net";
      if (numToAdd.length === 13) {
        whatsappId = numToAdd.substring(1) + whatsappId;
      } else if (numToAdd.length === 12) {
        whatsappId = numToAdd + whatsappId;
      } else {
        whatsappId = "91" + numToAdd + whatsappId;
      }
    }
    return whatsappId;
  };

  sock.ev.on("groups.upsert", (m) => {
    chatList.push(m[0].id);
    //console.log(m[0]);
    sock.sendMessage(m[0].id, { text: "Hello there!" });
    console.log(chatList);
  });

  sock.ev.on("group-participants.update", (m) => {
    const data = m;
    console.log(m);
    if (data.participants[0] === "17207416585@s.whatsapp.net") {
      const id = data.id;
      const index = chatList.indexOf(id);
      chatList.splice(index, 1);
      console.log(chatList);
    }
  });
  //sock.ev.on('group-participants.update',m=>console.log(m))
  //sock.ev.on('messages.update', m => console.log(m))
  //sock.ev.on('message-receipt.update', m => console.log(m))
  //sock.ev.on('presence.update', m => console.log(m))
  //sock.ev.on('chats.update', m => console.log(m))
  //sock.ev.on('contacts.upsert', m => console.log(m))

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      // reconnect if not logged out
      if (
        (lastDisconnect.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startSock();
      } else {
        console.log("Connection closed. You are logged out.");
      }
    }

    console.log("connection update", update);
  });
  // listen for when the auth credentials is updated
  sock.ev.on("creds.update", saveState);

  return sock;
};

startSock();
