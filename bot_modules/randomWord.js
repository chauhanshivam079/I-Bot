const axios = require("axios");

class RandomWord{
    static async getRandomWord(sock,chatId,msg){
        try{
        const result=await axios({url:"https://random-words-api.vercel.app/word/",mode:"cors",method:"GET"});
        const ans=`Word :- ${result.data[0].word}\n\nMeaning:- ${result.data[0].definition}`;
        await sock.sendMessage(chatId,{text:ans},{quoted:msg});
        }
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.mesaage}`},{quoted:msg});
            console.log("error in random word",err);
        }
    }
}
module.exports=RandomWord;