const express = require('express');
const router = express.Router();
const communityController = require('../../api/community/controller/communityController');


// 커뮤니티 목록보기
router.get('/call', communityController.communityList);
router.get("/", (req, res) => {
    res.sendFile("C:/Users/pc/Desktop/project/Backend/" + "view/communityList.html");
});

// 커뮤니티 상세보기 
router.get('/call/:id', communityController.communityDetail);
router.get("/:id", (req, res) => {
    res.sendFile("C:/Users/pc/Desktop/project/Backend/" + "view/communityDetail.html");
});

// 커뮤니티 글쓰기
router.post('/call/upload', communityController.communityUpload);

// 커뮤니티 글 수정
router.patch('/call/:id', communityController.communityModify);

// 커뮤니티 글 삭제
router.delete('/call/:id', communityController.communityDelete);

// 커뮤니티 좋아요 토글
router.post('/call/:id/like', communityController.toggleLike);

// 커뮤니티 댓글 작성
router.post('/call/:id/comments', communityController.createComment);

// 커뮤니티 댓글 삭제
router.delete('/call/:id/comments/:commentId', communityController.deleteComment);

module.exports = router;