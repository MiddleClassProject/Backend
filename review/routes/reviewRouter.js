const express = require('express');
const { getProfessors, getReviewList, submitReview, likeReview } = require('../controller/reviewController');
const router = express.Router();

router.get('/professors', getProfessors);
router.get('/list', getReviewList);
router.post('/submit', submitReview);
router.post('/like', likeReview);

module.exports = router;
