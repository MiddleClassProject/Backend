const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const chatRouter = require('./routes/charttingRoute');
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const chattingController = require('./api/chatting/controller/chattingController');
dotenv.config();

app.use(cors());
app.use(express.json());


app.use("/chat", chatRouter);


// ================== Socket ====================

// 서버와 소켓을 하나의 포트에서 실행
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000, () => {
    console.log("Server가 실행 중 입니다. 포트번호는 3000번 입니다.");
});


// socket 통신 - 클라이언트가 연결을 요청하였습니다.
//  서버와 클라이언트 간의 connection을 생성합니다.
io.on("connection", function (socket) {
  let joinedClient = false;
  let sendId;
  let chatRoomId;


  // 채팅 참여 요청
  socket.on("join", async function (data) {
    console.log(data);

    if (joinedClient) {
      return false;
    }

    sendId = data.sendId; // 클라이언트에서 전달받은 닉네임
    const receiveId = data.receiveId; // 채팅할 대상의 ID

    // 채팅방 생성 또는 조회
    chatRoomId = await chattingController.createRoom(userId, recipientId);

    if (!chatRoomId) {
      console.error("채팅방 생성 실패");
      return;
    }

    joinedClient = true;
    console.log(`Chat Room ID: ${chatRoomId}`);
  });



  // 메시지 전송
  socket.on("msg", async function (data) {
    console.log(`msg: ${data}`);

    chattingController.postMessage(chatRoomId, sendId, data);

    // 클라이언트에게 메시지 전송
    io.emit("msg", {
      msg: data.message,
    });
  });



  // 접속 종료
  socket.on("disconnect", function () {
    if (!joinedClient) {
      console.log("This Client is not joined");
      return false;
    }

    console.log(`User ${nickname} disconnected`);
  });
});