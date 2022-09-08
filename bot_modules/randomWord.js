const axios = require("axios");
const dict=require("urban-dictionary");
//const jsonWords=require('../words.json');
class RandomWord{
    _gameState;
    _word;
    _alreadySolved;
    constructor(){
        this.gameState=0;
        this._word="";
        this._alreadySolved=0;
    }
    static async getRandomWord(sock,chatId,msg){
        try{
        const result=await axios({url:"https://random-words-api.vercel.app/word/",mode:"cors",method:"GET"});
        const ans=`Word :- ${result.data[0].word}\n\nMeaning:- ${result.data[0].definition}\n\nPronunciation:- ${result.data[0].pronunciation}`;
        await sock.sendMessage(chatId,{text:ans},{quoted:msg});
        }
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.mesaage}`},{quoted:msg});
            console.log("error in random word",err);
        }
    }
    static async startGame(sock,chatId,msg){
        try{
            if(this.gameState===1){
            await sock.sendMessage(chatId,{msg:"Game already started"},{quoted:msg});
            }
            else {
                this.gameState=1;
                await sock.sendMessage(chatId,{text:"Game started"},{quoted:msg});
            await this.newWord(sock,chatId,msg);
            }
        }
        catch(err){
         await sock.sendMessage(chatId,{text:`${err.mesaage}`},{quoted:msg});
        }
    }
    static async stopGame(sock,chatId,msg){
        try{
            if(this.gameState===1){
                this.gameState=0;
                sock.sendMessage(chatId,{msg:"Game stopped!"},{quoted:msg});
            }
            else {
                await sock.sendMessage(chatId,{text:"Game start to kr lavde"},{quoted:msg});
            }
        }
        catch(err){
           await sock.sendMessage(chatId,{text:`${err.mesaage}`},{quoted:msg});
        }
    }
    static async newWord(sock,chatId,msg){
        try{
        if(this._alreadySolved===0){
        let getIndex=Math.floor(Math.random()*2446);
        let getWord=jsonWords.data[getIndex];
        this._word=getWord;
        let lenOfWord=getWord.length;
        let calGap=Math.floor(3.8/10*lenOfWord);
        console.log(lenOfWord, calGap);
        for(let i=0;i<calGap;i++){ 
            let ind=Math.floor(Math.random()*(lenOfWord));
            console.log(ind);
            getWord=
            getWord.substring(0,ind) + '_' + getWord.substring(ind+1);
        }
        console.log(this._word);
        await sock.sendMessage(chatId,{text:"Guess the word:\n"+`*${getWord.toUpperCase()}*`})
        this._alreadySolved=0;
    }
    else{
        await sock.sendMessage(chatId,{text:`Ans the current word`},{quoted:msg});
    }
    }
    catch(err){
        console.log("new Word error",err);
    }
}
    static async wordAns(sock,chatId,msg,msgData){
        let inputAns=msgData.msgText;
        inputAns=inputAns.toUpperCase();
        if(inputAns===(this._word.toUpperCase())){
            if(this._alreadySolved===0){
                this._alreadySolved=1;
                await sock.sendMessage(chatId,{text:`Right Answer💯`},{quoted:msg});
            }
            else{
                await sock.sendMessage(chatId,{text:`Already Answered you very slow`},{quoted:msg});
            }
        }
        else{
            await sock.sendMessage(chatId,{text:`Wrong answer! Try Again`});
        }
    }
    static async enterGame(sock,chatId,msg){

    }
    static async getCurrWord(sock,chatId,msg){
        await sock.sendMessage(chatId,{text:`${this._word}`},{quoted:msg});
    }
    static async getMeaning(sock,chatId,msg,msgData){
        try{
            if(!(msgData.msgText.length)){
                await sock.sendMessage(chatId,{text:"Write word to be searched"},{quoted:msg});
            } 
            else{
                let res=await dict.define(`${msgData.msgText}`);
                let word=res[0].word;
                let meaning=res[0].definition;
                let example=res[0].example;
                await sock.sendMessage(chatId,{text:`*Word:- ${word}\n*Meaning*:- ${meaning}\n*Example*:- ${example}`},{quoted:msg});
            }
        }catch(err){
            console.log("in catch",err);
            await sock.sendMessage(chatId,{text:`To know meaning first learn to write Word\n${err}`},{quoted:msg});
        }
    }
}
module.exports=RandomWord;