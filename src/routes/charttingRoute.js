const express = require("express");
const app = express();
const router = express.Router();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

router.get("/", (req, res) => {
  res.sendFile("/Users/kimminju/Desktop/MiddleClassBackend/Backend/" + "view/chat.html");
});



module.exports = router;