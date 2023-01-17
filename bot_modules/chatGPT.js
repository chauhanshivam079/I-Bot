const {Configuration,OpenAIApi}=require("openai");
require("dotenv").config({ path: "./Keys.env" });
const config=new Configuration({
    apiKey:process.env.openai,
});
const openAi=new OpenAIApi(config);
class ChatGpt{
    static async search(sock,chatId,msg,msgData){
        try{
        const _0x132e55=_0x55f5;function _0x1edf(){const _0x2011ff=['length','createCompletion','usage','758502jqxDOO','quotedMessage','2930OlIRwp','sendMessage','isQuoted','text','1442466aVqIgQ','8EXKAYX','conversation','35475JouccO','100655IMYxbU','220212fxUsKp','20591389QjOulm','8GzgWjE','text-davinci-003','2ugefsp','msgText','*\x20Word\x20Count\x20:-\x20*\x20','Are\x20bhaiya\x20kya\x20search\x20krna\x20wo\x20to\x20likho','35mFySRC','data','\x0a\x0a\x20','12XeSzqa','prompt_tokens','6089565hdNvRL','choices'];_0x1edf=function(){return _0x2011ff;};return _0x1edf();}(function(_0xc29aed,_0x35031e){const _0x274b2e=_0x55f5,_0x52f803=_0xc29aed();while(!![]){try{const _0x31bdf9=-parseInt(_0x274b2e(0xd6))/0x1*(-parseInt(_0x274b2e(0xbe))/0x2)+-parseInt(_0x274b2e(0xd7))/0x3*(-parseInt(_0x274b2e(0xbc))/0x4)+-parseInt(_0x274b2e(0xc7))/0x5+-parseInt(_0x274b2e(0xd2))/0x6*(-parseInt(_0x274b2e(0xc2))/0x7)+-parseInt(_0x274b2e(0xd3))/0x8*(parseInt(_0x274b2e(0xcc))/0x9)+-parseInt(_0x274b2e(0xce))/0xa*(parseInt(_0x274b2e(0xd5))/0xb)+parseInt(_0x274b2e(0xc5))/0xc*(parseInt(_0x274b2e(0xd8))/0xd);if(_0x31bdf9===_0x35031e)break;else _0x52f803['push'](_0x52f803['shift']());}catch(_0x1aa067){_0x52f803['push'](_0x52f803['shift']());}}}(_0x1edf,0xbffb3));if(msgData[_0x132e55(0xbf)][_0x132e55(0xc9)]===0x0){await sock['sendMessage'](chatId,{'text':_0x132e55(0xc1)},{'quoted':msg});return;}let ques;function _0x55f5(_0x3b2ff3,_0x253e10){const _0x1edfcb=_0x1edf();return _0x55f5=function(_0x55f537,_0x3848ca){_0x55f537=_0x55f537-0xbc;let _0x5a9f65=_0x1edfcb[_0x55f537];return _0x5a9f65;},_0x55f5(_0x3b2ff3,_0x253e10);}msgData[_0x132e55(0xd0)]&&msgData['quotedMessage'][_0x132e55(0xcd)]['conversation']?ques=msgData[_0x132e55(0xcd)]['quotedMessage'][_0x132e55(0xd4)]:ques=msgData[_0x132e55(0xbf)];ques[_0x132e55(0xc9)]===0x0&&await sock['sendMessage'](chatId,{'text':_0x132e55(0xc1)},{'quoted':msg});const response=await openAi[_0x132e55(0xca)]({'model':_0x132e55(0xbd),'prompt':ques,'max_tokens':0xbb8,'temperature':0.3,'top_p':0x1,'frequency_penalty':0x0,'presence_penalty':0x0});await sock[_0x132e55(0xcf)](chatId,{'text':_0x132e55(0xc0)+response[_0x132e55(0xc3)][_0x132e55(0xcb)][_0x132e55(0xc6)]+_0x132e55(0xc4)+response['data'][_0x132e55(0xc8)][0x0][_0x132e55(0xd1)]},{'quoted':msg});
    }catch(err){
        await sock.sendMessage(chatId,{text:`${err.message}`},{quoted:msg});
    }
    }
}
module.exports=ChatGpt;