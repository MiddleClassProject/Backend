const express = require('express');
const { getProfessors, submitReview, getReviewList } = require('../controller/reviewController');
const router = express.Router();

router.get('/professors', getProfessors);
router.get('/list', getReviewList);
router.post('/submit', submitReview);

module.exports = router;