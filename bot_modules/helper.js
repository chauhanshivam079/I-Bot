class Helper {
    _isCmd = false;
    _msgType = "";
    _msgText = "";
    _cmd = "";
    _isQuoted = false;
    _quotedMessage = "";
    static getMessageData(msg, pre) {
        this._isCmd = false;
        this._msgType = "";
        this._msgText = "";
        this._cmd = "";
        this._isQuoted = false;
        this._quotedMessage = "";
        if (msg.hasOwnProperty("conversation")) {
            this._msgType = "conversation";
            this._msgText = msg.conversation;
            this._isQuoted = false;
        } else if (msg.hasOwnProperty("audioMessage")) {
            this._msgType = "audio";
            this._isQuoted = msg.audioMessage.hasOwnProperty("contextInfo") ?
                msg.audioMessage.contextInfo.hasOwnProperty("quotedMessage") :
                false;
            if (this._isQuoted) {
                this._quotedMessage = msg.audioMessage.contextInfo;
            }
        } else if (msg.hasOwnProperty("imageMessage")) {
            this._msgType = "image";
            this._msgText = msg.imageMessage.hasOwnProperty("caption") ?
                msg.imageMessage.caption :
                "";
            this._isQuoted = msg.imageMessage.hasOwnProperty("contextInfo") ?
                msg.imageMessage.contextInfo.hasOwnProperty("quotedMessage") :
                false;
            if (this._isQuoted) {
                this._quotedMessage = msg.imageMessage.contextInfo;
            }
        } else if (msg.hasOwnProperty("videoMessage")) {
            this._msgType = "video";
            this._msgText = msg.videoMessage.hasOwnProperty("caption") ?
                msg.videoMessage.caption :
                "";
            this._isQuoted = msg.videoMessage.hasOwnProperty("contextInfo") ?
                msg.videoMessage.contextInfo.hasOwnProperty("quotedMessage") :
                false;
            if (this._isQuoted) {
                this._quotedMessage = msg.videoMessage.contextInfo;
            }
        } else if (msg.hasOwnProperty("stickerMessage")) {
            this._msgType = "sticker";
            this._isQuoted = msg.stickerMessage.hasOwnProperty("contextInfo") ?
                msg.stickerMessage.contextInfo.hasOwnProperty("quotedMessage") :
                false;
            if (this._isQuoted) {
                this._quotedMessage = msg.stickerMessage.contextInfo;
            }
        } else if (msg.hasOwnProperty("reactionMessage")) {
            this._msgType = "reactionMessage";
            const reactionMsg = msg.reactionMessage.text;
        } else if (msg.hasOwnProperty("extendedTextMessage")) {
            if (
                msg.extendedTextMessage.hasOwnProperty("contextInfo") ?
                msg.extendedTextMessage.contextInfo.hasOwnProperty("quotedMessage") :
                false
            ) {
                this._msgType = "reply";
                this._msgText = msg.extendedTextMessage.text;
                this._isQuoted = true;
                if (this._isQuoted) {
                    this._quotedMessage = msg.extendedTextMessage.contextInfo;
                }
            } else {
                this._msgType = "conversation";
                this._msgText = msg.extendedTextMessage.text;
                this._isQuoted = false;
            }
        }
        if (this._msgText.length > 1 && this._msgText[0] === pre) {
            this._isCmd = true;
            this._msgText = this._msgText.slice(1);
            if (this._msgText.split(" ").length === 1) {
                this._cmd = this._msgText.toLowerCase();
                this._msgText = "";
            } else {
                this._cmd = this._msgText.substring(0, this._msgText.indexOf(" ")).toLowerCase();
                this._msgText = this._msgText.substring(this._msgText.indexOf(" ") + 1);
            }
        }
        return {
            msgType: this._msgType,
            msgText: this._msgText,
            isQuoted: this._isQuoted,
            quotedMessage: this._quotedMessage,
            isCmd: this._isCmd,
            cmd: this._cmd
        };
    }
}
module.exports = Helper;
