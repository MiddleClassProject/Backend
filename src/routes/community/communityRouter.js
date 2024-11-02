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
router.patch('/:id');

// 커뮤니티 글 삭제
router.delete('/:id');

module.exports = router;