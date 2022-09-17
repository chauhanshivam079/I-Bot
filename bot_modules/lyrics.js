
const Genius = require("genius-lyrics");
const { builtinModules } = require("module");
const Client = new Genius.Client();

class Lyrics{
    static async getLyrics(sock,chatId,msg,msgData){
        try{
            const searches = await Client.songs.search(msgData.msgText);
        
            // Pick first one
            const firstSong = searches[0];
            // console.log("About the Song:\n", firstSong, "\n");
        
            // Ok lets get the lyrics
            const lyrics = await firstSong.lyrics();

            console.log("Lyrics:\n", lyrics, "\n");
            await sock.sendMessage(chatId,{text:lyrics},{quoted:msg});
        }catch(err){
                console.log(err.message);
                await sock.sendMessage(chatId,{text:err.message},{quoted:msg});
        }
    }
}

module.exports=Lyrics;