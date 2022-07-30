const axios=require('axios');
const { Module } = require('module');

class Horoscope{
    #url;
    #horoArray;
    constructor(msgData){
        this.#url=`https://aztro.sameerkumar.website/?sign=${msgData.msgText}&day=today`;
        this.#horoArray=["aries","taurus","gemini","cancer","Leo","Virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
    }
        async getHoroscope(sock,chatId,msg,msgData){
        try{
            let index=this.#horoArray.indexOf(msgData.msgText.toLowerCase());
            if(index===-1){
                await sock.sendMessage(chatId,{text:"Enter the right spelling"},{quoted:msg});
            }
            else{
                let result=await axios.post(this.#url);
                result=result.data;
                result=`*Date Range:-* ${result.date_range}\n*Today's Date:-* ${result.current_date}\n*Nature Hold's For You:-* ${result.description}\n*Compatibility:-* ${result.compatibility}\n*Mood:-* ${result.mood}\n*Color:-* ${result.color}\n*Lucky Number:-* ${result.lucky_number}\n*Lucky Time:-* ${result.lucky_time}`;
                await sock.sendMessage(chatId,{text:result},{quoted:msg});
            }
        }  
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }

}
module.exports=Horoscope;