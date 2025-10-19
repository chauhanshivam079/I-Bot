// const OpenAI = require("openai");
require("dotenv").config({ path: "./Keys.env" });

// const openAi = new OpenAI({
//     apiKey: process.env.openai
// });

class ChatGpt{
    static async search(sock,chatId,msg,msgData){
        try{
            await sock.sendMessage(chatId,{text:`command temporary disabled`},{quoted:msg});
            // if(msgData.msgText.length === 0){
            //     await sock.sendMessage(chatId,{text:`Are bhaiya kya search krna wo to likho`},{quoted:msg});
            //     return;
            // }
            // let ques;
            //     ques = msgData.msgText;
            // const response = await openAi.completions.create({
            //     model:"gpt-3.5-turbo-instruct",
            //     prompt:ques,
            //     max_tokens:3000,
            //     temperature:0.3,
            //     top_p:1.0,
            //     frequency_penalty:0.0,
            //     presence_penalty:0.0,
            // });
            // await sock.sendMessage(chatId,{text:`${response.data.choices[0].text}`},{quoted:msg});
    }catch(err){
        console.log(err.message);
        await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
    }
    }
}
module.exports=ChatGpt;
