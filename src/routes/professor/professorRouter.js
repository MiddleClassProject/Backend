const express = require('express');
const router = express.Router();
const professorController = require('../../api/professor/controller/professorController');

// 교수 목록보기
router.get('/', professorController.professorList);

// 교수 상세보기 
router.get('/:id', professorController.professorDetail);

// 교수 탈퇴
router.delete("/quit", professorController.professorQuit); // todo: professorId 추가 필요

module.exports = router;