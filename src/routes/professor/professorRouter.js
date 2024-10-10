const express = require('express');
const router = express.Router();
const professorController = require('../../api/professor/controller/professorController');

// 교수 목록
router.get('/list', professorController.professorlist);

module.exports = router;