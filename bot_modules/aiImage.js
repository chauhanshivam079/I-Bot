const {Configuration,OpenAIApi}=require("openai");
require("dotenv").config({ path: "./Keys.env" });
const { downloadContentFromMessage } = require("@adiwajshing/baileys");
const config=new Configuration({
    apiKey:process.env.openai,
});
const openAi=new OpenAIApi(config);
class AiImageGeneration{
    static async aiImageGeneration(sock,chatId,msg,msgData){
        try{
            const response=await openAi.createImage({
                prompt:msgData.msgText,
                n:1,
            });
            await sock.sendMessage(chatId,{image: { url: response.data.data[0].url },
            caption: msgData.msgText​​​​,
            },{quoted:msg});
        }catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }
    static async aiImageVariation(sock,chatId,msg,msgData){
        try{
            let buffer;
            let data;
            if(msgData.isQuoted){
                data=msgData.quotedMessage.quotedMessage;
            }else{
                data=msg.message;
            }
            if(data.hasOwnProperty("imageMessage")){
                const stream = await downloadContentFromMessage(
                    data.imageMessage,
                    "image"
                );
                buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                buffer.name="image.png";
                const response =await openAi.createImageVariation(
                    buffer,
                    1);
                await sock.sendMessage(chatId,{image:{url:response.data.data[0].url}},{quoted:msg});
            }
        }catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }
}

module.exports=AiImageGeneration;