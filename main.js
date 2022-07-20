require("dotenv").config({ path: "./Keys.env" });
const { Boom } = require("@hapi/boom");
const P = require("pino");
const {
  default: makeWASocket,
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  MessageRetryMap,
  useMultiFileAuthState,
} = require("@adiwajshing/baileys");
const groupManage = require("./bot_modules/groupManage.js");
const textToHand = require("./bot_modules/textToHandwriting.js");
const ProductSearch = require("./bot_modules/ProductSearch.js");
const Search = require("./bot_modules/Search.js");
const fs = require("fs");
const Helper = require("./bot_modules/helper.js");
const Sticker = require("./bot_modules/sticker.js");
const InstaDownloader = require("./bot_modules/instaDownloader.js");
const Crypto = require("./bot_modules/crypto.js");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mdClient = require("./Db/dbConnection.js");
const DbOperation = require("./Db/dbOperation.js");
const MsgDetails = require("./bot_modules/msgDetails.js");
const Compiler = require("./bot_modules/compiler.js");
const Profanity = require("./bot_modules/profanity.js");
const RandomWord=require("./bot_modules/randomWord");
let ownerIdsString = process.env.OWNER_IDS;
const ownerIds = ownerIdsString.split(" ").map((id) => id + "@s.whatsapp.net");
mdClient.connect();

const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger");

// const logger = MAIN_LOGGER.child({});
// logger.level = "trace";

const useStore = !process.argv.includes("--no-store");
const doReplies = !process.argv.includes("--no-reply");

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterMap = MessageRetryMap;
// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = useStore ? makeInMemoryStore({}) : undefined;

let sessionThere = 1;
// start a connection
const startSock = async () => {
  try {
    mdClient.connect((err) => {
      let collection2 = mdClient
        .db("whatsappSession")
        .collection("whatsappSessionAuth");

      collection2.find({ _id: 1 }).toArray(function (err, result) {
        if (err) throw err;
        let sessionAuth = result[0]["sessionAuth"];
        console.log(sessionAuth, "asdadasdasdasdas");
        if (sessionAuth != "") {
          sessionAuth = JSON.parse(sessionAuth);
          sessionAuth = JSON.stringify(sessionAuth);
          //console.log(session);
          console.log("sessionThere=", sessionThere);
          if (sessionThere == 1) {
            fs.writeFileSync("auth_info_multi/creds.json", sessionAuth);
          } else if (sessionThere == 0) {
            //fs.writeFileSync("./auth_info_multi.json", "");
            fs.rmSync("auth_info_multi/creds.json", {
              recursive: true,
              force: true,
            });
          } else {
            console.log("Creds Already there.");
          }
        } else {
          console.log("Session Auth Empty");
        }
      });
    });
    console.log("Local file written");
  } catch (err) {
    console.error("Local file writing errors :", err);
  }
  await delay(20000);
  //store.readFromFile("./baileys_store_multi.json");
  // save every 10s
  let interval1 = setInterval(() => {
    // store.writeToFile("./baileys_store_multi.json");
    try {
      let sessionDataAuth = fs.readFileSync("auth_info_multi/creds.json");
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
  }, 30000);

  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  //console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const { state, saveCreds } = await useMultiFileAuthState("auth_info_multi");
  //await delay(20000);
  const sock = makeWASocket({
    version,
    // logger,
    printQRInTerminal: true,
    auth: state,
    msgRetryCounterMap,
    // implement to handle retries
    getMessage: async (key) => {
      return {
        conversation: "Bot on pause retrying!",
      };
    },
  });

  //await delay(20000);

  store.bind(sock.ev);
  sessionThere = 2;
  // const sendMessageWTyping = async(msg: AnyMessageContent, jid: string) => {
  //     await sock.presenceSubscribe(jid);
  //     await delay(500);

  //     await sock.sendPresenceUpdate("composing", jid);
  //     await delay(2000);

  //     await sock.sendPresenceUpdate("paused", jid);

  //     await sock.sendMessage(jid, msg);
  // };
  //await delay(20_000);
  // sock.ev.on("chats.set", (item) =>
  //     console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`)
  // );
  // sock.ev.on("messages.set", (item) =>
  //     console.log(
  //         `recv ${item.messages.length} messages (is latest: ${item.isLatest})`
  //     )
  // );
  // sock.ev.on("contacts.set", (item) =>
  //     console.log(`recv ${item.contacts.length} contacts`)
  // );

  const chatList = [];
  const pre = "#";
  const botId = ownerIds[0];
  let i = 0;
  const cmdList = `*Use # as a prefix in all commands*\n\n​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​add -to add a number to the grp\n\nkick -to remove a number from the group\n\npromote -to promote a group member\n\ndemote -to demote a group member\n\nlink -to get the link of the group\n\nis -to search an image \n\ngs -to search anything on google \n\nvs -to download a video\n\nps -to search for a product\n\nmp3s -to download mp3song\n\nmp3c -to convert a yt video to mp3\n\nsticker -to make sticker\nAlias:- s\n\nsteal -to change the author of the sticker\n\ntoimg -to convert sticker to image\n\niprof -to get the profile picture of a user\n\nigd -to download insta video\nAlias:- i\n\ntagall -to tag all members of a group\n\ntagadmins -to tag admins of the group\n\ncp -to get the price of a crypto coin\n\ncn -to get news for a specific crypto name\n\nsp -to get the price for the stock\n\nw- to get a random word with its meaning\n\na -to check the status of the bot\n\nlt -to get the last tagged msg\n\nmsgcount -to get your msg count of current group\nAlias:- mc\n\nrun -to compile and run code in different lang\n\nsource -to get source code of the bot`;
  const allMsgArray = [];
  const tthUserDetail = new Map();
  let profanitySet = new Set(await DbOperation.getProfList());
  //const botEnableGroups = await DbOperation.getBotActiveGroups();
  const cmdArr = [
    "create",
    "add",
    "kick",
    "promote",
    "demote",
    "link",
    "is",
    "gs",
    "vs",
    "ps",
    "mp3s",
    "mp3c",
    "s",
    "sticker",
    "steal",
    "toimg",
    "iprof",
    "igd",
    "i",
    "tagall",
    "tagadmins",
    "cp",
    "cprice",
    "cnews",
    "cn",
    "sp",
    "sprice",
    "w",
    "a",
    "lt",
    "last_tag",
    "mc",
    "msgcount",
    "run",
    "makehimgay",
    "profanity",
    "source"
  ];

  setInterval(async () => {
    throw "sd";
  }, 7200000);

  //to update the dababase constantly
  let interval2 = setInterval(async () => {
    if (allMsgArray.length > 0) {
      try {
        let tempMsg = allMsgArray[0];
        //console.log("tempMsg", tempMsg);
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

        let groupName;
        try {
          groupName = (await sock.groupMetadata(chatId)).subject;
        } catch (err) {
          groupName = "";
        }
        DbOperation.updateData(
          chatId,
          senderId,
          tempMsg[0],
          tempMsg[1],
          groupName
        );
        allMsgArray.shift();
      } catch (err) {
        console.log("Error in updating each msg to db", err);
      }
    }
  }, 500);

  setInterval(() => {
    Crypto.getNews(sock, "918329198682-1614096949@g.us", { msgText: "" });
    Crypto.getNews(sock, "918329198682-1612849199@g.us", { msgText: "" });

    //Crypto.getNnews(sock, "918329198682-1612849199@g.us", { msgText: "" });
    //Crypto.news(driver, "918329198682-1614096949@g.us", CRYPTOPANIC_API, "")
  }, 43200000 / 2);
  console.log("Sock", sock.ev.process);
  sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
      console.log("inside process");
      // something about the connection changed
      // maybe it closed, or we received all offline message or connection opened
      if (events["connection.update"]) {
        console.log("Inside Connecion UPDATE");
        const update = events["connection.update"];
        console.log("connection update", update);
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          console.log("Inside Connection Close");
          // reconnect if not logged out
          if (
            lastDisconnect.error.output.statusCode == DisconnectReason.loggedOut
          ) {
            console.log("Connection closed. You are logged out.", sessionThere);
            sessionThere = 0;

            console.log("sessionThere logout time", sessionThere);
            clearInterval(interval1);
            clearInterval(interval2);
            startSock();
          } else {
            console.log("Connection closed.", sessionThere);

            startSock();
          }
        }
      }
      if (events["messages.upsert"]) {
        //console.log('recv messages ', JSON.stringify(upsert, undefined, 2))
        try {
          const m = events["messages.upsert"];
          //console.log(JSON.stringify(m, undefined, 2));
          const msg = m.messages[0];
          if (msg.hasOwnProperty("message")) {
            const senderId = m.messages[0].key.participant
              ? formatSenderId(m.messages[0].key.participant)
              : formatSenderId(m.messages[0].participant);
            const isMe = m.messages[0].key.fromMe;
            const senderName = m.messages[0].pushName;
            const chatId = m.messages[0].key.remoteJid;
            const msgContent = m.messages[0].message;
            const msgData = Helper.getMessageData(msgContent, pre);
            //console.log(JSON.stringify(msg, undefined, 2));
            if (chatId.includes("@g")) {
              allMsgArray.push([msg, msgData, chatId, senderId]);
              // if (!(await DbOperation.checkCmd(chatId, "profanity")) &&
              //     msgData.msgText &&
              //     !msgData.msgText.includes("rem_ab")
              // ) {
              //     console.log("in profanity check");
              //     Profanity.checkWord(
              //         sock,
              //         chatId,
              //         senderId,
              //         msgData.msgText,
              //         profanitySet,
              //         msg,
              //         botId
              //     );
              // }
            }
            if (
              msgData.isCmd &&
              true

              //(await DbOperation.checkOn(chatId)) ||
              //msgData.cmd === "on" ||
              // !chatId.includes("@g")
            ) {
              if (
                !(await DbOperation.checkCmd(chatId, msgData.cmd)) ||
                !chatId.includes("@g")
              ) {
                console.log(msgData);
                console.log(JSON.stringify(msg, undefined, 2));
                switch (msgData.cmd) {
                  case "create":
                    let allObj = await sock.groupFetchAllParticipating();
                    for (const key in allObj) {
                      //console.log(allObj[key]);
                      DbOperation.createGroup(allObj[key]);
                    }
                    console.log("Done!");
                    break;
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
                    console.log("Bot id", botId);
                    if (await isAdminOrMember(chatId, botId, "isAdmin")) {
                      const tempId =
                        msgData.msgText.length === 0
                          ? msgData.quotedMessage.participant
                            ? msgData.quotedMessage.participant
                            : ""
                          : getWhatsappId(m, msgData.msgText);
                      if (tempId.length > 0) {
                        switch (msgData.cmd) {
                          case "add":
                            groupManage.add(
                              sock,
                              chatId,
                              [tempId],
                              senderId,
                              msg
                            );
                            break;
                          case "kick":
                            groupManage.remove(
                              sock,
                              chatId,
                              [tempId],
                              senderId,
                              msg
                            );
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
                            groupManage.demote(
                              sock,
                              chatId,
                              [tempId],
                              senderId,
                              msg
                            );
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
                  case "steal":
                    if(msgData.isQuoted){
                      Sticker.stealSticker(sock,chatId,msg,msgData);
                    }
                    else{
                      await sock.sendMessage(chatId,{text:"Tag a Sticker"},{quoted:msg});
                    }
                    break;
                  case "help":
                    await sock.sendMessage(
                      chatId,
                      { text: cmdList },
                      { quoted: msg }
                    );
                    break;
                  case "toimg":
                    if (msgData.isQuoted) {
                      Sticker.stickerToImg(sock, chatId, msg, msgData);
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: "Tag a sticker!" },
                        { quoted: msg }
                      );
                    }
                    break;
                  case "iprof":
                    InstaDownloader.iProfile(
                      sock,
                      chatId,
                      msg,
                      msgData.msgText
                    );
                    break;
                  case "i"  :
                  case "igd":
                    InstaDownloader.igDownload(
                      sock,
                      chatId,
                      msg,
                      msgData.msgText
                    );
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
                  case "cprice":
                  case "cp":
                    Crypto.getPrices(sock, chatId, msgData, msg);
                    break;
                  case "cnews":
                  case "cn":
                    Crypto.getNews(sock, chatId, msgData);
                    break;
                  case "sprice":
                  case "sp":
                    Crypto.getStockPrice(sock, chatId, msgData, msg);
                    break;
                  case "w":
                    RandomWord.getRandomWord(sock,chatId,msg);
                    break;
                  case "last_tag":
                  case "lt":
                    MsgDetails.sendLastTag(sock, chatId, senderId, msg);
                    break;
                  case "mc":
                  case "msgcount":
                    if(msgData.isQuoted){
                      MsgDetails.taggedMsgCount(sock,chatId,msg,msgData);
                    }
                    else{
                      MsgDetails.msgCount(sock, chatId, senderId, msg);
                    }
                    break;
                  case "run":
                    Compiler.run(sock, chatId, msg, msgData);
                    break;
                  case "source":
                    await sock.sendMessage(chatId,{text:`*I-Bot*\n\n${"https://github.com/chauhanshivam079/I-Bot"}\n\n${"https://github.com/Shyguy99/I-BOT-Baileys"}\n\nDon't forget to give a like if you liked it or using it. New helpful command will keep on adding.`},{quoted:msg})
                    break;
                  case "enable":
                    if (
                      (await isAdminOrMember(chatId, senderId, "isAdmin")) ||
                      ownerIds.find((id) => id === senderId)
                    ) {
                      if (
                        msgData.msgText
                          .split(" ")
                          .every((cmd) => cmdArr.includes(cmd))
                      ) {
                        const val = await DbOperation.enableCmd(
                          chatId,
                          msgData
                        );
                        if (val) {
                          await sock.sendMessage(
                            chatId,
                            { text: "Command Enabled for this Group" },
                            { quoted: msg }
                          );
                        } else {
                          await sock.sendMessage(
                            chatId,
                            { text: `Couldn't enable Try Again Later!` },
                            { quoted: msg }
                          );
                        }
                      } else {
                        await sock.sendMessage(
                          chatId,
                          { text: "Wrong Command Entered!" },
                          { quoted: msg }
                        );
                      }
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: "Admin/Bot Owner Only Command!" },
                        { quoted: msg }
                      );
                    }
                    break;
                  case "on":
                    if (
                      (await isAdminOrMember(chatId, senderId, "isAdmin")) ||
                      ownerIds.find((id) => id === senderId)
                    ) {
                      groupManage.botOnOff(sock, chatId, msg, 1);
                    } else {
                      ``;
                      await sock.sendMessage(
                        chatId,
                        { text: "Admin/Bot Owner Only Command" },
                        { quoted: msg }
                      );
                    }
                    break;
                  case "off":
                    if (
                      (await isAdminOrMember(chatId, senderId, "isAdmin")) ||
                      ownerIds.find((id) => id === senderId)
                    ) {
                      groupManage.botOnOff(sock, chatId, msg, 0);
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: "Admin/Bot Owner Only Command" },
                        { quoted: msg }
                      );
                    }
                    break;
                  case "disable":
                    if (
                      (await isAdminOrMember(chatId, senderId, "isAdmin")) ||
                      ownerIds.find((id) => id === senderId)
                    ) {
                      if (
                        msgData.msgText
                          .split(" ")
                          .every((cmd) => cmdArr.includes(cmd))
                      ) {
                        const val = await DbOperation.disableCmd(
                          chatId,
                          msgData
                        );
                        if (val) {
                          await sock.sendMessage(
                            chatId,
                            { text: "Command disable for this Group" },
                            { quoted: msg }
                          );
                        } else {
                          await sock.sendMessage(
                            chatId,
                            { text: `Couldn't disable Try Again Later!` },
                            { quoted: msg }
                          );
                        }
                      } else {
                        await sock.sendMessage(
                          chatId,
                          { text: "Wrong Command Entered!" },
                          { quoted: msg }
                        );
                      }
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: "Admin/Bot Owner Only Command" },
                        { quoted: msg }
                      );
                    }
                    break;
                  case "add_ab":
                    await DbOperation.addProfWord(msgData.msgText);
                    let d = await DbOperation.getProfList();
                    if (d) {
                      profanitySet = new Set(d);
                      await sock.sendMessage(
                        chatId,
                        { text: "Word added!" },
                        { quoted: msg }
                      );
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: "Some Error Occured" },
                        { quoted: msg }
                      );
                    }
                    break;

                  case "rem_ab":
                    await DbOperation.removeProfWord(msgData.msgText);
                    let dd = await DbOperation.getProfList();
                    if (dd) {
                      profanitySet = new Set(dd);
                      await sock.sendMessage(
                        chatId,
                        { text: "Word removed!" },
                        { quoted: msg }
                      );
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: "Some Error Occured" },
                        { quoted: msg }
                      );
                    }
                    break;
                  case "warn":
                    if (
                      isAdminOrMember(chatId, senderId, "isAdmin") ||
                      ownerIds.find((id) => id === senderId)
                    ) {
                      const tempId =
                        msgData.msgText.length === 0
                          ? msgData.quotedMessage.participant
                            ? msgData.quotedMessage.participant
                            : ""
                          : getWhatsappId(m, msgData.msgText);
                      let [word] = profanitySet;
                      if (tempId) {
                        await Profanity.checkWord(
                          sock,
                          chatId,
                          tempId,
                          word,
                          profanitySet,
                          msg,
                          botId
                        );
                      } else {
                        await sock.sendMessage(
                          chatId,
                          { text: "No one tagged!" },
                          { quoted: msg }
                        );
                      }
                    } else {
                      await sock.sendMessage(
                        chatId,
                        { text: `Admin Only Command Cutie!` },
                        { quoted: msg }
                      );
                    }
                    break;
                  case ".":
                    const collectio = mdClient
                      .db("Users")
                      .collection("userProfile");
                    let data = JSON.stringify(msg);
                    collectio.insertOne({ _id: 344, data: data });
                    console.log(await collectio.find().toArray());
                    // perform actions on the collection object
                    console.log(JSON.stringify(msg, undefined, 2));
                    break;
                  case "a":
                    console.log("Hello");
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
              } else {
                await sock.sendMessage(
                  chatId,
                  { text: "Command disabled for this Group!" },
                  { quoted: msg }
                );
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
          }
        } catch (err) {
          console.log("Errorrrrrrrrrrrrrrrrrrrr", err);
        }
      }

      if (events["creds.update"]) {
        await saveCreds();
      }

      if (events["groups.upsert"]) {
        const m = events[groups.upsert];

        //chatList.push(m[0].id);
        console.log("group update: ", m);
        console.log("Creating Group");
        DbOperation.createGroup(m[0]);
        //sock.sendMessage(m[0].id, { text: "Hello there!" });
        //console.log(chatList);
      }
      if (events["group-participants.update"]) {
        const m = events["group-participants.update"];

        console.log("Groupparticipant.update : ", m);
        if (m.action === "add") {
          DbOperation.addMember(m.id, m.participants[0]);
        } else if (m.action === "remove") {
          DbOperation.updateGroupsIn(m.id, m.participants[0]);
        }
      }
    }
  );

  const formatSenderId = (senderId) => {
    try {
      return senderId.replace(
        senderId.substring(
          senderId.indexOf(":") === -1
            ? senderId.indexOf("@")
            : senderId.indexOf(":"),
          senderId.indexOf("@")
        ),
        ""
      );
    } catch (err) {
      return "";
    }
  };
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

  //sock.ev.on('messages.update', m => console.log(m))
  //sock.ev.on('message-receipt.update', m => console.log(m))
  //sock.ev.on('presence.update', m => console.log(m))
  //sock.ev.on('chats.update', m => console.log(m))
  //sock.ev.on('contacts.upsert', m => console.log(m))

  // listen for when the auth credentials is updated
  // credentials updated -- save them

  return sock;
};

// let r = "On";
// const main = async () => {
//   await startSock();
//   console.log(r);
//   while (true) {
//     if (r === "restart") {
//       console.log("Restarting.....(Through main2.ts)");
//       await startSock();
//     }
//   }
// };
startSock();
