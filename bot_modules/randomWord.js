const { checkServerIdentity } = require("tls");

class RandomWord{
    static async getRandomWord(sock,chatId,msg){
        try{
        const result=await fetch("https://random-words-api.vercel.app/word/");
        const ans=`Word :- ${result[0].word}\n\n Meaning:- ${result[0].definition}`;
        await sock.sendMessage(chatId,{text:ans},{quoted:msg});
        }
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.mesaage}`},{quoted:msg});
            console.log("error in random word",err);
        }
    }
}
module.exports=RandomWord;