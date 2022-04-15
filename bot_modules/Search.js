const fetch = require("node-fetch");
const fs = require("fs");
const ytdl = require("ytdl-core");
const gApi = process.env.G_API;
const ytApi = process.env.YT_API;
const gApiEngineId = process.env.G_API_ENGINE_ID;
class Search {
    static async gsearch(sock, chatId, msg, msgData) {
        let ques;
        if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
            ques = msgData.quotedMessage.quotedMessage.conversation;
        } else {
            ques = msgData.msgText;
        }
        console.log(ques);

        if (ques === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }
        let url = `https://www.googleapis.com/customsearch/v1?key=${gApi}&cx=${gApiEngineId}&q=${ques}`;

        try {
            const q = await fetch(url, {
                method: "GET",
            });
            const data = await q.json();
            console.log(typeof data.searchInformation.totalResults);
            if (data.searchInformation.totalResults !== "0") {
                let result = data.items[0].snippet;
                result = result.split("—");
                console.log(result);
                if (result.length > 1) {
                    result = result[1];
                } else {
                    result = result[0];
                }
                result = result.replace("...", "");
                if (result.includes(".")) {
                    result = result.substring(0, result.lastIndexOf(".") + 1);
                }

                const resultLink = data.items[0].link;

                await sock.sendMessage(
                    chatId, {
                        text: `Result:\n${result}*...read more* \nSource:\n${resultLink}`,
                    }, { quoted: msg }
                );
                console.log(result);
                console.log(resultLink);
            } else {
                console.log(data.searchInformation.totalResults);
                await sock.sendMessage(
                    chatId, { text: "No Results Found!" }, { quoted: msg }
                );
            }
        } catch (err) {
            await sock.sendMessage(
                chatId, { text: "Some Error Occured!" }, { quoted: msg }
            );
        }
    }

    static async isearch(sock, chatId, msg, msgData) {
        let ques;
        if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
            ques = msgData.quotedMessage.quotedMessage.conversation;
        } else {
            ques = msgData.msgText;
        }
        console.log(ques);

        if (ques === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }

        let url = `https://www.googleapis.com/customsearch/v1?key=${gApi}&cx=${gApiEngineId}&q=Images of ${ques}`;
        try {
            const q = await fetch(url, {
                method: "GET",
            });
            const data = await q.json();
            //console.log(data);
            console.log(data.searchInformation.totalResults);
            if (data.searchInformation.totalResults !== "0") {
                const imgSrcArr = [data.items[0], data.items[1], data.items[2]];
                const imgSrc = [];
                console.log("Imge array source :", imgSrcArr);
                for (let i = 0; i < imgSrcArr.length; i++) {
                    if (imgSrcArr[i].pagemap.hasOwnProperty("imageobject")) {
                        let url1;
                        let url2;
                        try {
                            url1 = imgSrcArr[i].pagemap.imageobject[0].image ?
                                imgSrcArr[i].pagemap.imageobject[0].image :
                                imgSrcArr[i].pagemap.imageobject[0].thumbnailurl ?
                                imgSrcArr[i].pagemap.imageobject[0].thumbnailurl :
                                imgSrcArr[i].pagemap.imageobject[0].contenturl;
                            url2 = imgSrcArr[i].pagemap.imageobject[1].image ?
                                imgSrcArr[i].pagemap.imageobject[1].image :
                                imgSrcArr[i].pagemap.imageobject[1].thumbnailurl ?
                                imgSrcArr[i].pagemap.imageobject[1].thumbnailurl :
                                imgSrcArr[i].pagemap.imageobject[1].contenturl;
                        } catch (err) {
                            console.log(err);
                            continue;
                        }
                        if (url1 && url2) {
                            imgSrc.push(url1);
                            imgSrc.push(url2);
                            break;
                        }
                    }
                }
                if (imgSrc.length === 0) {
                    imgSrc.push(imgSrcArr[0].pagemap.cse_image[0].src);
                    imgSrc.push(imgSrcArr[1].pagemap.cse_image[0].src);
                }
                console.log(imgSrc);
                await sock.sendMessage(
                    chatId, {
                        image: { url: imgSrc[0] },
                        caption: "Result 1",
                    }, { quoted: msg }
                );
                await sock.sendMessage(
                    chatId, {
                        image: { url: imgSrc[1] },
                        caption: "Result 2",
                    }, { quoted: msg }
                );
            } else {
                await sock.sendMessage(
                    chatId, { text: "No Results Found!" }, { quoted: msg }
                );
            }
        } catch (err) {
            console.log(err);
            await sock.sendMessage(
                chatId, { text: "Some Error Occured!" }, { quoted: msg }
            );
        }
    }

    static async vsearch(sock, chatId, msg, msgData) {
        let ques;
        if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
            ques = msgData.quotedMessage.quotedMessage.conversation;
        } else {
            ques = msgData.msgText;
        }

        if (ques === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }

        let link = ques.split(" ").find((str) => str.slice(0, 6) === "https:");
        if (link) {
            ques = link;
        }

        ques = ques.replace("shorts/", "");
        ques = ques.split("?")[0];
        console.log(ques);
        let randomName = (Math.random() + 1).toString(36).substring(7);
        let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${ques}&key=${ytApi}`;
        try {
            const q = await fetch(url, {
                method: "GET",
            });
            const data = await q.json();
            const vurl = data.items[0].id.videoId;
            console.log(vurl);
            let finalVideoUrl = `https://www.youtube.com/watch?v=${vurl}`;
            let info = await ytdl.getInfo(vurl);
            if (info.videoDetails.lengthSeconds >= 1800) {
                await sock.sendMessage(
                    chatId, {
                        text: "Video duration must be less than 30 mins",
                    }, { quoted: msg }
                );
            } else {
                let titleYt = info.videoDetails.title;
                await sock.sendMessage(
                    chatId, { text: "Download has begun!" }, { quoted: msg }
                );
                let stream = ytdl(finalVideoUrl, {
                    filter: (info) => info.itag == 22 || info.itag == 18,
                }).pipe(fs.createWriteStream(`Media/Video/${randomName}.mp4`));

                await new Promise((resolve, reject) => {
                    stream.on("error", reject);
                    stream.on("finish", resolve);
                });

                let stats = fs.statSync(`Media/Video/${randomName}.mp4`);
                console.log(stats.size);
                if (stats.size / 1048576 < 40) {
                    await sock.sendMessage(
                        chatId, {
                            video: fs.readFileSync(`Media/Video/${randomName}.mp4`),
                            caption: titleYt,
                            gifPlayback: false,
                        }, { quoted: msg }
                    );
                } else {
                    await sock.sendMessage(
                        chatId, { text: "Video size must be less than 40 mb" }, { quoted: msg }
                    );
                }
                fs.unlinkSync(`Media/Video/${randomName}.mp4`);
            }
        } catch (err) {
            console.log(err);
            await sock.sendMessage(
                chatId, { text: "Some Error Occured!" }, { quoted: msg }
            );
        }
    }

    static async mp3Convertor(sock, chatId, msg, msgData) {
        let ques;
        if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
            ques = msgData.quotedMessage.quotedMessage.conversation;
        } else {
            ques = msgData.msgText;
        }

        if (ques === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }

        let link = ques.split(" ").find((str) => str.slice(0, 6) === "https:");
        if (link) {
            ques = link;
        }

        ques = ques.replace("shorts/", "");
        ques = ques.split("?")[0];

        try {
            let randomName = (Math.random() + 1).toString(36).substring(7);
            let finalVideoUrl = ques;
            let vurl = finalVideoUrl.split("tu.be/");
            if (vurl.length <= 1) {
                vurl = finalVideoUrl.split("=");
            }
            if (vurl.length <= 1) {
                vurl = finalVideoUrl.split(".com/");
            }
            console.log(vurl[1]);
            let info = await ytdl.getInfo(vurl[1]);
            if (info.videoDetails.lengthSeconds >= 1800) {
                await sock.sendMessage(
                    chatId, {
                        text: "Audio duration must be less than 30 mins",
                    }, { quoted: msg }
                );
            } else {
                let titleYt = info.videoDetails.title;
                await sock.sendMessage(
                    chatId, { text: "Video is converting to mp3!" }, { quoted: msg }
                );
                let stream = ytdl(finalVideoUrl, {
                    filter: (info) =>
                        info.audioBitrate == 160 || info.audioBitrate == 128,
                }).pipe(fs.createWriteStream(`Media/Audio/${randomName}.mp3`));

                await new Promise((resolve, reject) => {
                    stream.on("error", reject);
                    stream.on("finish", resolve);
                });

                let stats = fs.statSync(`Media/Audio/${randomName}.mp3`);

                if (stats.size / 1048576 < 40) {
                    await sock.sendMessage(
                        chatId, {
                            audio: { url: `Media/Audio/${randomName}.mp3` },
                            mimetype: "audio/mp4",
                        }, { quoted: msg }
                    );
                } else {
                    await sock.sendMessage(
                        chatId, { text: "Audio size must be less than 40 mb" }, { quoted: msg }
                    );
                    fs.unlinkSync(`Media/Audio/${randomName}.mp3`);
                }
            }
        } catch (err) {
            console.log(err);
            await sock.sendMessage(
                chatId, { text: "Some Error Occured!" }, { quoted: msg }
            );
        }
    }

    static async searchMp3ByName(sock, chatId, msg, msgData) {
        let ques;
        if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
            ques = msgData.quotedMessage.quotedMessage.conversation;
        } else {
            ques = msgData.msgText;
        }

        if (ques === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }

        let link = ques.split(" ").find((str) => str.slice(0, 6) === "https:");
        if (link) {
            ques = link;
        }

        ques = ques.replace("shorts/", "");
        ques = ques.split("?")[0];

        console.log(ques);
        let randomName = (Math.random() + 1).toString(36).substring(7);
        let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${ques}&key=${ytApi}`;
        try {
            const q = await fetch(url, {
                method: "GET",
            });
            const data = await q.json();
            const vurl = data.items[0].id.videoId;
            let finalVideoUrl = `https://www.youtube.com/watch?v=${vurl}`;
            let info = await ytdl.getInfo(vurl);
            if (info.videoDetails.lengthSeconds >= 1800) {
                await sock.sendMessage(
                    chatId, {
                        text: "Audio duration is greater than 30 mins",
                    }, { quoted: msg }
                );
            } else {
                let titleYt = info.videoDetails.title;
                await sock.sendMessage(
                    chatId, { text: "Downloading Song!" }, { quoted: msg }
                );
                let stream = ytdl(finalVideoUrl, {
                    filter: (info) =>
                        info.audioBitrate == 160 || info.audioBitrate == 128,
                }).pipe(fs.createWriteStream(`Media/Audio/${randomName}.mp3`));

                await new Promise((resolve, reject) => {
                    stream.on("error", reject);
                    stream.on("finish", resolve);
                });

                let stats = fs.statSync(`Media/Audio/${randomName}.mp3`);

                if (stats.size / 1048576 < 40) {
                    await sock.sendMessage(
                        chatId, {
                            audio: { url: `Media/Audio/${randomName}.mp3` },
                            mimetype: "audio/mp4",
                        }, { quoted: msg }
                    );
                    fs.unlinkSync(`Media/Audio/${randomName}.mp3`);
                } else {
                    await sock.sendMessage(
                        chatId, { text: "Audio size is greater than 40 mb" }, { quoted: msg }
                    );
                    fs.unlinkSync(`Media/Audio/${randomName}.mp3`);
                }
            }
        } catch (err) {
            console.log("MP3 Error: ", err);
            await sock.sendMessage(
                chatId, { text: "Some Error Occured!" }, { quoted: msg }
            );
        }
    }
}
module.exports = Search;