const axios=require('axios');
const { Module } = require('module');

class Horoscope{
    #url;
    #horoArray;
    constructor(){
        this.#url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=`;
        this.#horoArray=["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
    }
        async getHoroscope(sock,chatId,msg,msgData){
        try{
            let index=this.#horoArray.indexOf(msgData.msgText.toLowerCase());
            if(index===-1){
                await sock.sendMessage(chatId,{text:"Enter the right spelling"},{quoted:msg});
            }
            else{
                const { data } = await axios.get(this.#url + `${index + 1}`);
                const $ = cheerio.load(data);
                const horoscope = $("body > div.grid.grid-right-sidebar.primis-rr > main > div.main-horoscope > p:nth-child(2)").text();
                let result = `*Today's Date:-* ${horoscope.split("-")[0]}\n*Nature Hold's For You:-* ${horoscope.split("-")[1]}`;
                await sock.sendMessage(chatId,{text:result},{quoted:msg});
            }
        }  
        catch(err){
            await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
        }
    }

}
module.exports=Horoscope;
