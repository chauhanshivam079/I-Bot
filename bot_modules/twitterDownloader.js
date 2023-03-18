const axios=require("axios");
require("dotenv").config({ path: "./Keys.env" })

class TwitterDownloader{
    static async postDownload(sock,chatId,msg,msgData){
        try{
            let temp=msgData.msgText;
            if(temp.length===0){
                await sock.sendMessage(chatId,{text:`Enter url to be downloaded`},{quoted:msg});
                return;
            }
            const res = await axios.post(process.env.smd,{
                url:temp
            });
                if(res.data.url[0].type === "jpg"){
                    await sock.sendMessage(chatId,{
                            image:{url:res.data.url[0].url}
                        },
                        {quoted:msg});
                        return;
                }
                if(res.data.url[0].type === "mp4"){
                    await sock.sendMessage(chatId,{
                            video:{url:res.data.url[0].url},
                            caption:`${res.data.url[0].quality}p`,
                            gifPlayback: false,
                          },
                          {quoted:msg});
                          return;
                }
        }
        catch(err){
            console.log(err);
            await sock.sendMessage(chatId,{text:err.message},{quoted:msg})
        }
    }
}
module.exports=TwitterDownloader;