// const {Configuration,OpenAIApi}=require("openai");
// require("dotenv").config({ path: "./Keys.env" });
// const { downloadContentFromMessage } = require("@adiwajshing/baileys");
// const config=new Configuration({
//     apiKey:process.env.openai,
// });
// const openAi=new OpenAIApi(config);
class AiImageGeneration{
    static async aiImageGeneration(sock,chatId,msg,msgData){
        try{
                        await sock.sendMessage(chatId,{text:`command temporarily disabled`},{quoted:msg});
        //     let ques;
        // if (msgData.isQuoted && msgData.quotedMessage.quotedMessage.conversation) {
        //     ques = msgData.quotedMessage.quotedMessage.conversation;
        // } else {
        //     ques = msgData.msgText;
        // }
        // if(ques.length===0){
        //     await sock.sendMessage(chatId,{text:`Are bhaiya kya search krna wo to likho`},{quoted:msg});
        // }
        //     // const response=await openAi.createImage({
        //     //     prompt:ques,
        //     //     n:1,
        //     // });
        //     await sock.sendMessage(chatId,{image: { url: response.data.data[0].url }},{quoted:msg});
        }catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }
    static async aiImageVariation(sock,chatId,msg,msgData){
        try{
             await sock.sendMessage(chatId,{text:`command temporarily disabled`},{quoted:msg});
            // let buffer;
            // let data;
            // if(msgData.isQuoted && msgData.quotedMessage.quotedMessage.hasOwnProperty("imageMessage")){
            //     data=msgData.quotedMessage.quotedMessage;
            // }else{
            //     await sock.sendMessage(chatId,{text:`Tag a image message to get the variation`},{quoted:msg});
            // }
            // if(data.hasOwnProperty("imageMessage")){
            //     const stream = await downloadContentFromMessage(
            //         data.imageMessage,
            //         "image"
            //     );
            //     buffer = Buffer.from([]);
            //     for await (const chunk of stream) {
            //         buffer = Buffer.concat([buffer, chunk]);
            //     }
            //     buffer.name="image.png";
            //     const response =await openAi.createImageVariation(
            //         buffer,
            //         1);
            //     await sock.sendMessage(chatId,{image:{url:response.data.data[0].url}},{quoted:msg});
        }
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }
}

module.exports=AiImageGeneration;
