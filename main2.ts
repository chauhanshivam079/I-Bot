require("dotenv").config({ path: "./Keys.env" });
import { Boom } from "@hapi/boom";
import { is } from "cheerio/lib/api/traversing";
import P from "pino";
import { WAMessage } from "./src";
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
const Helper = require("./bot_modules/helper.js");
const Sticker = require("./bot_modules/sticker.ts");
const InstaDownloader = require("./bot_modules/instaDownloader.js");
const Crypto = require("./bot_modules/crypto.js");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mdClient = require("./Db/dbConnection.js");
const DbOperation = require("./Db/dbOperation.js");
let ownerIdsString = process.env.OWNER_IDS;
const ownerIds = ownerIdsString.split(" ").map((id) => id + "@s.whatsapp.net");
// const mdbUsername = process.env.MDB_USERNAME;
// const mdbPassword = process.env.MDB_PASSWORD;
// const uri = `mongodb+srv://${mdbUsername}:${mdbPassword}@cluster0.br8pm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

// const mdClient = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });
mdClient.connect();

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({
  logger: P().child({ level: "debug", stream: "store" }),
});

try {
  mdClient.connect((err) => {
    let collection2 = mdClient
      .db("whatsappSession")
      .collection("whatsappSessionAuth");

    collection2.find({ _id: 1 }).toArray(function (err, result) {
      if (err) throw err;
      let sessionAuth = result[0]["sessionAuth"];
      sessionAuth = JSON.parse(sessionAuth);
      sessionAuth = JSON.stringify(sessionAuth);
      //console.log(session);
      fs.writeFileSync("./auth_info_multi.json", sessionAuth);
    });
  });
  console.log("Local file written");
} catch (err) {
  console.error("Local file writing error :", err);
}

//store.readFromFile("./baileys_store_multi.json");
// save every 10s
setInterval(() => {
  //store.writeToFile("./baileys_store_multi.json");
  try {
    let sessionDataAuth = fs.readFileSync("./auth_info_multi.json");
    sessionDataAuth = JSON.parse(sessionDataAuth);
    sessionDataAuth = JSON.stringify(sessionDataAuth);
    //console.log(sessionData);
    let collection2 = mdClient
      .db("whatsappSession")
      .collection("whatsappSessionAuth");
    //(chatid,{})
    collection2.updateOne(
      { _id: 1 },
      { $set: { sessionAuth: sessionDataAuth } }
    );
    //console.log("db updated");
  } catch (err) {
    console.log("Db updation error : ", err);
  }
}, 20_000);

// start a connection
const startSock = async () => {
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  //console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  console.log("Waiting for session file to write to form");
  await delay(15_000);
  const { state, saveState } = useSingleFileAuthState("./auth_info_multi.json");

  const sock = makeWASocket({
    version,
    //logger: P({ level: 'trace' }),
    printQRInTerminal: true,
    auth: state,
    // implement to handle retries
    getMessage: async (key) => {
      return {
        conversation: "Bot on pause retrying!",
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
  const cmdList = `*Use # as a prefix in all commands*\n\n​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​add -to add a number to the grp\n\nkick -to remove a number from the group\n\npromote -to promote a group member\n\ndemote -to demote a group member\n\nlink -to get the link of the group\n\nis -to search an image \n\ngs -to search anything on google \n\nvs -to download a video\n\nps -to search for a product\n\nmp3s -to download mp3song\n\nmp3c -to convert a yt video to mp3\n\ns -to make sticker\n\ntoimg -to convert sticker to image\n\niprof -to get the profile picture of a user\n\nigd -to download insta video\n\ntagall -to tag all members of a group\n\ntagadmins -to tag admins of the group\n\ncp -to get the price of a crypto coin\n\ncn -to get news for a specific crypto name\n\nsp -to get the price for the stock\n\na -to check the status of the bot`;
  const allMsgArray = [];
  const tthUserDetail = new Map();

  //to update the dababase constantly
  setInterval(async () => {
    while (allMsgArray.length > 0) {
      let tempMsg = allMsgArray.shift();
      let chatId = tempMsg[2];
      let senderId = tempMsg[3];
      senderId = senderId.replace(
        senderId.substring(
          senderId.indexOf(":") === -1
            ? senderId.indexOf("@")
            : senderId.indexOf(":"),
          senderId.indexOf("@")
        ),
        ""
      );
      let groupName = (await sock.groupMetadata(chatId)).subject;
      DbOperation.updateData(
        chatId,
        senderId,
        tempMsg[0],
        tempMsg[1],
        groupName
      );
    }
  }, 1000);

  setInterval(() => {
    Crypto.getNews(sock, "120363040241737423@g.us", { msgText: "" });
    //Crypto.getNnews(sock, "918329198682-1612849199@g.us", { msgText: "" });
    //Crypto.news(driver, "918329198682-1614096949@g.us", CRYPTOPANIC_API, "")
  }, 43200000 / 2);
  sock.ev.on("messages.upsert", async (m) => {
    try {
      //console.log(JSON.stringify(m, undefined, 2));
      const msg = m.messages[0];
      if (msg.hasOwnProperty("message")) {
        const senderId = m.messages[0].key.participant;
        const isMe = m.messages[0].key.fromMe;
        const senderName = m.messages[0].pushName;
        const chatId = m.messages[0].key.remoteJid;
        const msgContent = m.messages[0].message;
        const msgData = Helper.getMessageData(msgContent, pre);
        //console.log(JSON.stringify(msg, undefined, 2));
        //allMsgArray.push([msg,msgData,chatId,senderId])
        if (msgData.isCmd) {
          console.log(msgData);
          console.log(JSON.stringify(msg, undefined, 2));
          switch (msgData.cmd) {
            case "data":
              let p = await sock.groupMetadata(chatId);
              console.log("GroupMetadat: ", p);
              let q = await sock.groupFetchAllParticipating();
              console.log("Fetch all participating", q);
              let w = await sock.groupSettingUpdate(chatId, "locked");
              console.log("seeting update: ", w);
              let r = await sock.groupParticipantsUpdate(
                chatId,
                [senderId],
                "add"
              );
              console.log("groupupdate upper", r);

              break;
            case "add":
            case "kick":
            case "promote":
            case "demote":
              if (await isAdminOrMember(chatId, botId, "isAdmin")) {
                const tempId =
                  msgData.msgText.length === 0
                    ? msgData.quotedMessage.participant
                    : getWhatsappId(m, msgData.msgText);
                if (tempId.length > 0) {
                  switch (msgData.cmd) {
                    case "add":
                      groupManage.add(sock, chatId, [tempId], senderId, msg);
                      break;
                    case "kick":
                      groupManage.remove(sock, chatId, [tempId], senderId, msg);
                      break;
                    case "promote":
                      groupManage.promote(
                        sock,
                        chatId,
                        [tempId],
                        senderId,
                        msg
                      );
                      break;
                    case "demote":
                      groupManage.demote(sock, chatId, [tempId], senderId, msg);
                      break;
                  }
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
              break;
            case "link":
              if (await isAdminOrMember(chatId, botId, "isAdmin")) {
                groupManage.getLink(sock, chatId, senderId, msg);
              } else {
                await sock.sendMessage(
                  chatId,
                  { text: "Bot not an Admin!" },
                  { quoted: msg }
                );
              }

              break;
            case "is":
              Search.isearch(sock, chatId, msg, msgData);
              break;

            case "gs":
              Search.gsearch(sock, chatId, msg, msgData);
              break;

            case "vs":
              Search.vsearch(sock, chatId, msg, msgData);

              break;

            case "ps":
              ProductSearch.search(sock, chatId, msg, msgData);

              break;
            case "mp3s":
              Search.searchMp3ByName(sock, chatId, msg, msgData);

              break;
            case "mp3c":
              Search.mp3Convertor(sock, chatId, msg, msgData);
              break;

            case "tth":
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
              break;
            case "s":
            case "sticker":
              if (
                msgData.isQuoted &&
                (msgData.quotedMessage.quotedMessage.hasOwnProperty(
                  "imageMessage"
                ) ||
                  msgData.quotedMessage.quotedMessage.hasOwnProperty(
                    "videoMessage"
                  ))
              ) {
                Sticker.imgToSticker(sock, chatId, msg, msgData);
              } else if (
                msgData.msgType === "image" ||
                msgData.msgType === "video"
              ) {
                Sticker.imgToSticker(sock, chatId, msg, msgData);
              }
              break;
            case "help":
              sock.sendMessage(chatId, { text: cmdList }, { quoted: msg });
              break;
            case "toimg":
              if (msgData.isQuoted) {
                Sticker.stickerToImg(sock, chatId, msg, msgData);
              } else {
                sock.sendMessage(
                  chatId,
                  { text: "Tag a sticker!" },
                  { quoted: msg }
                );
              }
              break;
            case "iprof":
              InstaDownloader.iProfile(sock, chatId, msg, msgData.msgText);
              break;
            case "igd":
              InstaDownloader.igDownload(sock, chatId, msg, msgData.msgText);
              break;
            case "tagall":
              if (await isAdminOrMember(chatId, senderId, "isAdmin")) {
                groupManage.tagAll(sock, chatId, msgData, msg, false);
              } else {
                await sock.sendMessage(
                  chatId,
                  { text: "Admin only Command!" },
                  { quoted: msg }
                );
              }

              break;
            case "tagadmins":
              if (await isAdminOrMember(chatId, senderId, "isAdmin")) {
                groupManage.tagAll(sock, chatId, msgData, msg, true);
              } else {
                await sock.sendMessage(
                  chatId,
                  { text: "Admin Only Command!" },
                  { quoted: msg }
                );
              }
              break;
            case "cp":
              Crypto.getPrices(sock, chatId, msgData, msg);
              break;
            case "cn":
              Crypto.getNews(sock, chatId, msgData);
              break;
            case "sp":
              Crypto.getStockPrice(sock, chatId, msgData, msg);
              break;
            case "..":
              const collection = mdClient.db("Users").collection("userProfile");
              try {
                const a = await collection.find().toArray();

                a.forEach(async (el) => {
                  console.log(el["data"]);
                  if (el["_id"] === 3434) {
                    let obj: WAMessage = JSON.parse(el["data"]);
                    await sock.sendMessage(
                      chatId,
                      { text: "Asdas" },
                      { quoted: obj }
                    );
                  }
                });
              } catch (err) {
                console.log(err);
              }
              break;
            case ".":
              const collectio = mdClient.db("Users").collection("userProfile");
              let data = JSON.stringify(msg);
              collectio.insertOne({ _id: 344, data: data });
              console.log(await collectio.find().toArray());
              // perform actions on the collection object
              console.log(JSON.stringify(msg, undefined, 2));
              break;
            case "a":
              await sock.sendMessage(
                chatId,
                { text: "Yup! I am active" },
                { quoted: msg }
              );
              break;
            case "makehimgay":
              if (msgData.isQuoted) {
                let text = `No need @${
                  msgData.quotedMessage.participant.split("@")[0]
                } already izzz`;
                let list = [msgData.quotedMessage.participant];
                let id = msgData.quotedMessage.participant;
                if (
                  id !== ownerIds[0] &&
                  id !== ownerIds[1] &&
                  id !== ownerIds[2]
                ) {
                  await sock.sendMessage(
                    chatId,
                    {
                      text: text,
                      mentions: list,
                    },
                    { quoted: msg }
                  );
                } else {
                  await sock.sendMessage(
                    chatId,
                    { text: "You are Gay!!" },
                    { quoted: msg }
                  );
                }
              } else {
                await sock.sendMessage(
                  chatId,
                  { text: "Tag someone message" },
                  { quoted: msg }
                );
              }
              break;
            default:
              sock.sendMessage(
                chatId,
                { text: "Use #help to know the ryt cmd of bot" },
                { quoted: msg }
              );
          }
          if (
            msgData.isQuoted &&
            msgData.quotedMessage.quotedMessage.conversation ===
              "Enter your name\n*Reply to this message with # as Prefix*"
          ) {
            const userDetail = {
              senderId: senderId,
              name: msgData.cmd + msgData.msgText,
            };
            tthUserDetail.set(senderId, userDetail);
            await sock.sendMessage(
              chatId,
              {
                text: "Enter the second thing to put below name\n*Reply to this message with # as Prefix*",
              },
              { quoted: msg }
            );
          } else if (
            msgData.isQuoted &&
            msgData.quotedMessage.quotedMessage.conversation ===
              "Enter the second thing to put below name\n*Reply to this message with # as Prefix*"
          ) {
            if (tthUserDetail.has(senderId)) {
              let temp = tthUserDetail.get(senderId);
              temp.secondField = msgData.cmd + msgData.msgText;
              tthUserDetail.set(senderId, temp);
              await sock.sendMessage(
                chatId,
                {
                  text: "Enter the heading of your content\n*Reply to this message with # as Prefix*",
                },
                { quoted: msg }
              );
            } else {
              await sock.sendMessage(
                chatId,
                { text: "You have not initiated the process\nSend #tth" },
                { quoted: msg }
              );
            }
          } else if (
            msgData.isQuoted &&
            msgData.quotedMessage.quotedMessage.conversation ===
              "Enter the heading of your content\n*Reply to this message with # as Prefix*"
          ) {
            if (tthUserDetail.has(senderId)) {
              let temp = tthUserDetail.get(senderId);
              temp.heading = msgData.cmd + msgData.msgText;
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
            msgData.isQuoted &&
            msgData.quotedMessage.quotedMessage.conversation ===
              "Enter the content\n*Reply to this message with # as Prefix*"
          ) {
            if (tthUserDetail.has(senderId)) {
              let temp = tthUserDetail.get(senderId);
              temp.content = (msgData.cmd + msgData.msgText)
                .split("\n")
                .join("<br>");
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
                { quoted: msg }
              );
            }
          }
        }

        //       // const chat_id=m
        //       // if ()
        //       // if(!msg.key.fromMe /*&& m.type === 'notify'*/) {
        //       // 	console.log(m.type)

        //       // 	console.log("=====================================================================================================")
        //       // 	//console.log('replying to', m.messages[0].key.remoteJid)
        //       // 	//await sock!.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
        //       // 	//await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
        //       // }
        //     }
        //   });
      }
    } catch (err) {
      console.log("Errorrrrrrrrrrrrrrrrrrrr", err);
    }
  });
  //to check whether given id is admin or member or not
  const isAdminOrMember = async (chatId, senderId, check) => {
    senderId = senderId.replace(
      senderId.substring(
        senderId.indexOf(":") === -1
          ? senderId.indexOf("@")
          : senderId.indexOf(":"),
        senderId.indexOf("@")
      ),
      ""
    );
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
  const getWhatsappId = (m, msgText) => {
    let whatsappId = "";
    let numToAdd = "";
    let i;
    let arr = msgText.split(" ");
    for (i = 0; i < arr.length; i++) {
      numToAdd += arr[i];
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
    console.log("group update: ", m);
    sock.sendMessage(m[0].id, { text: "Hello there!" });
    console.log(chatList);
  });

  sock.ev.on("group-participants.update", (m) => {
    const data = m;
    console.log("Groupparticipant.update : ", m);
    if (data.participants[0] === "17207416585@s.whatsapp.net") {
      const id = data.id;
      const index = chatList.indexOf(id);
      chatList.splice(index, 1);
      console.log(chatList);
    }
  });

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
