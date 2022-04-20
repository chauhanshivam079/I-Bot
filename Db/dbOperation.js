const { data } = require("cheerio/lib/api/attributes");
const mdClient = require("./dbConnection.js");
const collection1 = mdClient.db("userData").collection("groupData");
const collection2 = mdClient.db("userData").collection("memberData");
class DbOperation {
    static async updateData(chatId, senderId, msg, msgData, grpName) {
        //console.log("Texttttttttttttttttt: ", msgData.msgText);
        try {
            let mentionedIds;
            if (
                msg.message.extendedTextMessage &&
                msg.message.extendedTextMessage.contextInfo &&
                msg.message.extendedTextMessage.contextInfo.mentionedJid
            ) {
                mentionedIds = msg.message.extendedTextMessage.contextInfo.mentionedJid;
                //console.log("Mentionedjidsss: ", mentionedIds);
                for (let i = 0; i < mentionedIds.length; i++) {
                    let taggedMsgs = (
                        await collection1
                        .aggregate([
                            { $match: { _id: 0 } },
                            { $unwind: "$data" },
                            { $match: { "data.groupId": chatId } },
                            { $unwind: "$data.Members" },
                            { $match: { "data.Members.memberId": mentionedIds[i] } },
                        ])
                        .toArray()
                    )[0].data.Members.taggedMsg;
                    //console.log("tagged msgggggg :", taggedMsgs);
                    if (taggedMsgs.length === 6) {
                        taggedMsgs.shift();
                    }

                    taggedMsgs.push(JSON.stringify(msg));
                    collection1.updateMany({ _id: 0 }, {
                        $inc: {
                            "data.$[updateGroup].Members.$[updateMember].tagCount": 1,
                        },
                        $set: {
                            "data.$[updateGroup].Members.$[updateMember].taggedMsg": taggedMsgs,
                        },
                    }, {
                        arrayFilters: [
                            { "updateGroup.groupId": chatId },
                            { "updateMember.memberId": mentionedIds[i] },
                        ],
                    });
                }
            }
            collection1.updateMany({ _id: 0 }, {
                $set: {
                    "data.$[updateGroup].groupName": grpName,
                },
                $inc: {
                    "data.$[updateGroup].Members.$[updateMember].msgCount": 1,
                    //"data.$[updateGroup].Members.$[updateMember].tagCount": tagCount,
                },
                // $push:{"data.$[updateGroup].Members.$[updateMember].taggedMsg": taggedMsg[0]}
            }, {
                arrayFilters: [
                    { "updateGroup.groupId": chatId },
                    { "updateMember.memberId": senderId },
                ],
            });

            let memberName = msg.pushName;
            collection2.updateMany({ _id: 0 }, {
                $set: { "data.$[member].memberName": memberName },
                $inc: { "data.$[member].totalMsgCount": 1 },
            }, {
                arrayFilters: [{ "member.memberId": senderId }],
            });
            // f = await collection1.find({}).toArray();
            // console.log("update", f);
        } catch (err) {
            console.log("Update Data Error: ", err);
        }
    }
    static async updateGroupsIn(chatId, memberId) {
        try {
            collection2.updateOne({ _id: 0 }, { $pull: { "data.$[member].groupsIn": chatId } }, {
                arrayFilters: [{ "member.memberId": memberId }],
            });
        } catch (err) {
            console.log("Update Groups In error : ", err);
        }
    }
    static async addMember(chatId, senderId) {
        let tempObj = {
            memberId: senderId,
            msgCount: 0,
            tagCount: 0,
            taggedMsg: [],
            joinDate: "",
            warnCount: 0,
        };
        try {
            //checking whether member is present in Members array or not
            if (!(
                    await collection1
                    .find({
                        data: {
                            $elemMatch: {
                                groupId: chatId,
                                Members: {
                                    $elemMatch: {
                                        memberId: senderId,
                                    },
                                },
                            },
                        },
                    })
                    .toArray()
                ).length) {
                collection1.updateMany({ _id: 0 }, {
                    $push: {
                        "data.$[updateGroup].Members": tempObj,
                    },
                }, {
                    arrayFilters: [{ "updateGroup.groupId": chatId }],
                });
                console.log("member added in Members array");
            } else {
                console.log("member present in Members array");
            }
            //console.log("Temporary Members obj:", tempObj);
            if (!(
                    await collection2
                    .find({
                        data: {
                            $elemMatch: {
                                memberId: senderId,
                            },
                        },
                    })
                    .toArray()
                ).length) {
                console.log("MemberData Not found!");
                //if member Id not present in memberData then create and push in it
                let tempMemberObj = {
                    memberId: senderId,
                    memberName: "",
                    groupsIn: [chatId],
                    totalMsgCount: 0,
                };
                collection2.updateOne({ _id: 0 }, { $push: { data: tempMemberObj } });
            } else {
                console.log("Member Data found ,appending id to his groupsIN");
                //if member already present in memberdata then update groupsIn array
                collection2.updateOne({ _id: 0 }, { $addToSet: { "data.$[member].groupsIn": chatId } }, {
                    arrayFilters: [{ "member.memberId": senderId }],
                });
            }
        } catch (err) {
            console.log("Adding member error", err);
        }
    }
    static async createGroup(obj) {
        try {
            if (!(
                    await collection1
                    .find({
                        data: {
                            $elemMatch: {
                                groupId: obj.id,
                            },
                        },
                    })
                    .toArray()
                ).length) {
                console.log("Group Not found !Creating group");
                let members = [];
                for (let i = 0; i < obj.participants.length; i++) {
                    let tempMemberId = obj.participants[i].id;
                    let tempObj = {
                        memberId: tempMemberId,
                        msgCount: 0,
                        tagCount: 0,
                        taggedMsg: [],
                        joinDate: "",
                        warnCount: 0,
                    };
                    members.push(tempObj);
                    //console.log("Temporary Members obj:", tempObj);
                    if (!(
                            await collection2
                            .find({
                                data: {
                                    $elemMatch: {
                                        memberId: tempMemberId,
                                    },
                                },
                            })
                            .toArray()
                        ).length) {
                        console.log("MemberData Not found!");
                        //if member Id not present in memberData then create and push in it
                        let tempMemberObj = {
                            memberId: tempMemberId,
                            memberName: "",
                            groupsIn: [obj.id],
                            totalMsgCount: 0,
                        };
                        collection2.updateOne({ _id: 0 }, { $push: { data: tempMemberObj } });
                    } else {
                        console.log("Member Data found ,appending id to his groupsIN");
                        //if member already present in memberdata then update groupsIn array
                        collection2.updateOne({ _id: 0 }, { $addToSet: { "data.$[member].groupsIn": obj.id } }, {
                            arrayFilters: [{ "member.memberId": `${tempMemberId}` }],
                        });
                    }
                }

                let groupObj = {
                    groupId: obj.id,
                    groupName: obj.subject,
                    groupCreatedOn: new Date(obj.creation * 1000)
                        .toISOString()
                        .slice(0, 10),
                    botJoin: new Date().toISOString().slice(0, 10),
                    botEnable: 1,
                    disableCmds: [],
                    Members: members,
                };
                //console.log("temperoray Group obj: ", groupObj);
                collection1.updateOne({ _id: 0 }, { $push: { data: groupObj } });
            } else {
                console.log("Group Already present in db");
                collection1.updateOne({ _id: 0 }, {
                    $set: {
                        "data.$[updateGroup].groupName": obj.subject,
                    },
                }, {
                    arrayFilters: [{ "updateGroup.groupId": obj.id }],
                });
                console.log(
                    "Checking if all members present in memberData and groupData "
                );
                for (let i = 0; i < obj.participants.length; i++) {
                    let tempMemberId = obj.participants[i].id;
                    DbOperation.addMember(obj.id, tempMemberId);
                }
            }
        } catch (err) {
            console.log("Group Creation Error :", err);
        }
    }
    static async getLastTagObj(chatId, senderId) {
        let data = await collection1
            .aggregate([
                { $match: { _id: 0 } },
                { $unwind: "$data" },
                { $match: { "data.groupId": chatId } },
                { $unwind: "$data.Members" },
                { $match: { "data.Members.memberId": senderId } },
            ])
            .toArray();
        //console.log("get last", data[0].data.Members);
        let lastTagArr = data[0].data.Members.taggedMsg;
        if (lastTagArr.length > 0) {
            let lastTagObj = lastTagArr.pop();
            collection1.updateOne({ _id: 0 }, {
                $set: {
                    "data.$[updateGroup].Members.$[updateMember].taggedMsg": lastTagArr,
                },
            }, {
                arrayFilters: [
                    { "updateGroup.groupId": chatId },
                    { "updateMember.memberId": senderId },
                ],
            });
            return lastTagObj;
        } else {
            return "";
        }
    }
    static async getPushName(senderId) {
        try {
            let data = await collection2
                .aggregate([
                    { $match: { _id: 0 } },
                    { $unwind: "$data" },

                    { $match: { "data.memberId": senderId } },
                ])
                .toArray();
            let pushName = data[0].data.memberName;
            if (pushName === "") {
                return "You";
            }
            return pushName;
        } catch (err) {
            console.log("Error fetching push name: ", err);
            return "You";
        }
    }
    static async getMsgCount(chatId, senderId) {
        try {
            let data = await collection1
                .aggregate([
                    { $match: { _id: 0 } },
                    { $unwind: "$data" },
                    { $match: { "data.groupId": chatId } },
                    { $unwind: "$data.Members" },
                    { $match: { "data.Members.memberId": senderId } },
                ])
                .toArray();
            let msgCount = data[0].data.Members.msgCount;
            return msgCount;
        } catch (err) {
            console.log("getMsgCount", err);
        }
    }
    static async enableCmd(chatId, msgData) {
        try {
            let cmdsArr = msgData.msgText.split(" ");
            for (let i = 0; i < cmdsArr.length; i++) {
                let cmd = cmdsArr[i];

                //console.log("all:", msgData);
                await collection1.updateOne({ _id: 0 }, {
                    $pull: {
                        "data.$[updateGroup].disableCmds": cmd,
                    },
                }, {
                    arrayFilters: [{ "updateGroup.groupId": chatId }],
                });
            }
            let data = await collection1
                .aggregate([
                    { $match: { _id: 0 } },
                    { $unwind: "$data" },
                    { $match: { "data.groupId": chatId } },
                ])
                .toArray();
            console.log(data[0].data.disableCmds);

            return true;
        } catch (err) {
            console.log("enable cmd error: ", err);
            return false;
        }
    }
    static async disableCmd(chatId, msgData) {
        try {
            const cmdsArr = msgData.msgText.split(" ");
            for (let i = 0; i < cmdsArr.length; i++) {
                console.log("all:", msgData);
                await collection1.updateOne({ _id: 0 }, {
                    $addToSet: {
                        "data.$[updateGroup].disableCmds": cmdsArr[i],
                    },
                }, {
                    arrayFilters: [{ "updateGroup.groupId": chatId }],
                });
            }

            let data = await collection1
                .aggregate([
                    { $match: { _id: 0 } },
                    { $unwind: "$data" },
                    { $match: { "data.groupId": chatId } },
                ])
                .toArray();
            console.log(data[0].data.disableCmds);

            return true;
        } catch (err) {
            console.log("disable cmd error: ", err);
            return false;
        }
    }
    static async checkCmd(chatId, cmd) {
        try {
            let data = await collection1
                .aggregate([
                    { $match: { _id: 0 } },
                    { $unwind: "$data" },
                    { $match: { "data.groupId": chatId } },
                ])
                .toArray();
            console.log(data[0]);
            console.log(data[0].data.disableCmds.find((cmds) => cmds === cmd));
            if (data[0].data.disableCmds.find((cmds) => cmds === cmd)) {
                console.log("true");
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
            console.log("get Cmd: ", err);
        }
    }
}
module.exports = DbOperation;