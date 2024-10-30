const express = require('express');
const router = express.Router();
const reviewModel = require('../../models/reviewModel');

// 모든 리뷰 가져오기
router.get('/', (req, res) => {
    reviewModel.getAllReviews((err, reviews) => {
        if (err) return res.status(500).send("Server error");
        res.json(reviews);
    });
});

// 특정 리뷰 조회 및 조회수 증가
router.get('/:id', (req, res) => {
    const reviewId = req.params.id;
    reviewModel.incrementViewCount(reviewId, err => {
        if (err) return res.status(500).send("Server error");
        reviewModel.getReviewById(reviewId, (err, review) => {
            if (err) return res.status(500).send("Server error");
            res.json(review);
        });
    });
});

// 좋아요 증가
router.post('/:id/like', (req, res) => {
    const reviewId = req.params.id;
    reviewModel.increaseLike(reviewId, (err) => {
        if (err) return res.status(500).send("Server error");

        // 좋아요 수 증가 후 해당 리뷰 정보 가져오기
        reviewModel.getReviewById(reviewId, (err, review) => {
            if (err) return res.status(500).send("Server error");
            res.json({ success: true, likes: review.likes });
        });
    });
});

module.exports = router;
