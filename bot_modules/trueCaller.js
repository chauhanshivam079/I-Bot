const tc=require("truecallerjs");
require("dotenv").config({ path: "./Keys.env" });
const trueCallerId=process.env.trueCaller_Registration_ID;

class TrueCaller{
    static async getDetails(sock,chatId,msg,msgData){
        try{
            let number;
            if (msgData.isQuoted &&     msgData.quotedMessage.  quotedMessage.conversation) {
                number = msgData. quotedMessage.       quotedMessage.conversation;
            } else {
                number = msgData.msgText;
            }
            const res=await tc.searchNumber({"number":number,"countryCode":"IN","installationId":trueCallerId
        });
        let result={
            "Name:":"Not Found",
            "Ph No.:-":"Not Found",
            "Country Code:":"Not Found",
            "City:":"Not Found",
            "Time Zone:":"Not Found",
            "Carrier:":"Not Found",
            "Email:":"Not Found",
        };
        if(res.data[0].name){
            result["Name:"]=res.data[0].name;
        }
        if(res.data[0].phones[0]){
            result["Ph No.:-"]=res.data[0].phones[0].e164Format;
        }
        if(res.data[0].addresses[0]){
            result["Country Code:"]=res.data[0].addresses[0].countryCode;
        }
        if(res.data[0].addresses[0]){
            result["City:"]=res.data[0].addresses[0].city;
        }
        if(res.data[0].addresses[0]){
            result["Time Zone:"]=res.data[0].addresses[0].timeZone;
        }
        if(res.data[0].phones[0]){
            result["Carrier:"]=res.data[0].phones[0].carrier;
        }
        if(res.data[0].internetAddresses[0]){
            result["Email:"]=res.data[0].internetAddresses[0].id;
        }
        const details=`*Name:-* ${result["Name:"]}\n*Ph No.:-* ${result["Ph No.:-"]}\n*Country Code:-* ${result["Country Code:"]}\n*City:-* ${result["City:"]}\n*Time Zone:-* ${result["Time Zone:"]}\n*Carrier:-* ${result["Time Zone:"]}\n*Email:-* ${result["Email:"]}`;
        await sock.sendMessage(chatId,{text:details},{quoted:msg});
    }
    catch(err){
        console.log(err);
        await sock.sendMessage(chatId,{text:err},{quoted:msg});
    }
    }
}
module.exports=TrueCaller;
