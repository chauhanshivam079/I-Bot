const axios=require('axios');
const { Module } = require('module');

class Horoscope{
    #url;
    constructor(msgData){
        this.#url=`https://aztro.sameerkumar.website/?sign=${msgData.msgData}&day=today`;
    }
        async getHoroscope(sock,chatId,msg){
        try{
            let result=await axios.post(`${this._url}`);
            result=result.data;
            result=`*Date Range:-* ${result.date_range}\n*Today's Date:-* ${result.current_date}\n*Nature Hold's For You:-* ${result.description}\n*Compatibility:-* ${result.compatibility}\n*Mood:-* ${result.mood}\n*Color:-* ${result.color}\n*Lucky Number:-* ${result.lucky_number}\n*Lucky Time:-* ${result.lucky_time}`;
            await sock.sendMessage(chatId,{text:result},{quoted:msg});
        }  
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }

}
module.exports=Horoscope;