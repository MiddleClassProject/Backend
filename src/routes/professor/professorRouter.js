const express = require('express');
const router = express.Router();
const professorController = require('../../api/professor/controller/professorController');

// 교수 목록보기
router.get('/', professorController.professorList);
router.get("/", (req, res) => {
    res.sendFile("C:/Users/pc/Desktop/project/Backend/" + "view/professorList.html");
});

// 교수 상세보기 
router.get('/:id', professorController.professorDetail);
router.get("/:id", (req, res) => {
    res.sendFile("C:/Users/pc/Desktop/project/Backend/" + "view/professorDetail.html");
});

// 교수 탈퇴
router.delete("/:id/quit", professorController.professorQuit);

// 교수 즐겨찾기 토글
router.post('/:id/star', professorController.toggleStar);

module.exports = router;