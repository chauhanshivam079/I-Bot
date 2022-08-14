const twitterPostDownloader=require("twitter-url-direct");

class TwitterDownloader{
    static async postDownload(sock,chatId,msg,msgData){
        try{
        const response=await twitterPostDownloader(msgData.msgText);
        if(response.found){
            if(response.type==="image"){
                await sock.sendMessage(chatId,{
                    image:{url:response.download}
                },
                {quoted:msg});
            }
            else{
                let link="";
                for(let i=0;i<response.download.length;i++){
                    if(response.download[i].url.includes("video.twimg")){
                    link=response.download[i].url;
                    break;
                    }
                }
                await sock.sendMessage(chatId,{
                                                video:link,
                                                caption:"",
                                                gifPlayback: false,
                                              },
                                              {quoted:msg});
            }
        }
            else{
                await sock.sendMessage(chatId,{text:`Give correct link`},{quoted:msg});
            }
        }
        catch(err){
            console.log(err);
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }
}
module.exports=TwitterDownloader;