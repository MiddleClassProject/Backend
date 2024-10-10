// const pool = require('../../../../config/databaseSet');

// //새로운 방 생성
// const createRoom = async (sendId, receiveId) => {

//     let sql = `INSERT INTO chatroom (user, professor) values (?,?,NOW())`;

//     try{
//         const [result] = await pool.query(sql, [sendId, receiveId]);
//         return result.insertId;
//     }catch(error){
//         console.log(error);
//         return error;
//     }

// }

// //채팅방이 존재하는지 확인
// const checkChat = async (sendId, receiveId) => {

//     let sql = `SELECT chat_id from chatroom where user = ? and professor = ?`;

//     try{
//         let [result] = await pool.query(sql, [sendId, receiveId]);
        
//         if(result.length == 0){
//             result[0].exists = false;
//         }else{
//             result[0].exists = true;
//         }

//         return result;

//     }catch(error){
//         console.log(error);
//     }
// }

// const postMessage = async (chatRoomId, userId, message) => {

//     let sql = `INSERT INTO chat (room_id, sender_id, message) VALUES (?, ?, ?)`;


//     try{
//         // 메시지를 DB에 저장
//         await db.query(sql,[chatRoomId, userId, message]);

//         return true;
//     }catch(error){
//         console.log(error);
//         return false;
//     }

// }


// module.exports = {createRoom, checkChat, postMessage};