const axios=require("axios");

class TwitterDownloader{
    static async postDownload(sock,chatId,msg,msgData){
        try{
            let temp=msgData.msgText;
            if(temp.length===0){
                await sock.sendMessage(chatId,{text:`Enter url to be downloaded`},{quoted:msg});
                return;
            }
            temp=temp.split("/")[5].split("?")[0];
            let baseUrl="https://tweetpik.com/api/tweets";
            axios({url:`${baseUrl}/${temp}`}).then(async res=>{
                const type=res.data.media[0].type;
                if(type==="photo"){
                    for(let i=0;i<res.data.media.length;i++){
                        await sock.sendMessage(chatId,{
                            image:{url:res.data.media[i].url}
                        },
                        {quoted:msg});
                    }
                }
                if(type==="animated_gif" || type==="video"){
                    axios({url:`${baseUrl}/${temp}/video`}).then(async res=>{
                        await sock.sendMessage(chatId,{
                            video:{url:res.data.variants[res.data.variants.length-1].url},
                            caption:"",
                            gifPlayback: false,
                          },
                          {quoted:msg});
                    });
                }
            });
        }
        catch(err){
            console.log(err);
            await sock.sendMessage(chatId,{text:err.message},{quoted:msg})
        }
    }
}
module.exports=TwitterDownloader;