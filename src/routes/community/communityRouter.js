const express = require('express');
const router = express.Router();
const communityController = require('../../api/community/controller/communityController');

// 커뮤니티 목록보기
router.get('/', communityController.communityList);

// 커뮤니티 상세보기 
router.get('/:id', communityController.communityDetail);

// 커뮤니티 글쓰기
router.post('/upload', communityController.communityUpload);

// 커뮤니티 글 수정
router.patch('/:id', communityController.communityModify);

// 커뮤니티 글 삭제
router.delete('/:id', communityController.communityDelete);

// 커뮤니티 좋아요 토글
router.post('/:id/like', communityController.toggleLike);

// 커뮤니티 댓글 작성
router.post('/:id/comments', communityController.createComment);

// 커뮤니티 댓글 삭제
router.delete('/:id/comments/:commentId', communityController.deleteComment);

module.exports = router;