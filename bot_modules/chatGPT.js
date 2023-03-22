const {Configuration,OpenAIApi} = require("openai");
require("dotenv").config({ path: "./Keys.env" });
const config = new Configuration({
    apiKey:process.env.openai,
});
const openAi = new OpenAIApi(config);
class ChatGpt{
    static async search(sock,chatId,msg,msgData){
        try{
            if(msgData.msgText.length === 0){
                await sock.sendMessage(chatId,{text:`Are bhaiya kya search krna wo to likho`},{quoted:msg});
                return;
            }
            let ques;
                ques = msgData.msgText;
            const response = await openAi.createCompletion({
                model:"text-davinci-003",
                prompt:ques,
                max_tokens:3000,
                temperature:0.3,
                top_p:1.0,
                frequency_penalty:0.0,
                presence_penalty:0.0,
            });
            await sock.sendMessage(chatId,{text:`${response.data.choices[0].text}`},{quoted:msg});
    }catch(err){
        console.log(err.message);
        await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
    }
    }
}
module.exports=ChatGpt;