const pool = require('../../../../config/databaseSet');
const chattingService = require('../service/chattingService');

const createRoom = (data) => {

    const sendId = data.sendId;
    const receiveId = data.sendId;
    const result  = chattingService.checkChat(sendId, receiveId);

    // 생성된 채팅방이 있는지 확인.
    if(result.exists){
        return result[0].chat_id;
    }else{
        return chattingService.createRoom(sendId, receiveId);
    }
    
}

const postMessage = (room_id, sender_id, message) => {
    chattingService.postMessage(room_id, sender_id, message);
}

const getChattingRoom = (user_id) => {

}

module.exports = {createRoom, postMessage, getChattingRoom};