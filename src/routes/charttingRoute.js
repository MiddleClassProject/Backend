const express = require('express');
const router = express.Router();

// 채팅 관련 라우트 예시
router.get('/', (req, res) => {
    res.send("채팅 목록");
});

module.exports = router;

