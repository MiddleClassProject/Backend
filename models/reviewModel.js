const db = require('../config/databaseSet');

const reviewModel = {
    // 모든 리뷰 가져오기
    getAllReviews: (callback) => {
        const query = "SELECT * FROM reviews";
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
    // 특정 리뷰 가져오기
    getReviewById: (id, callback) => {
        const query = "SELECT * FROM reviews WHERE id = ?";
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    // 조회수 증가
    incrementViewCount: (id, callback) => {
        const query = "UPDATE reviews SET views = views + 1 WHERE id = ?";
        db.query(query, [id], callback);
    },
    // 좋아요 증가
    increaseLike: (id, callback) => {
        const query = "UPDATE reviews SET likes = likes + 1 WHERE id = ?";
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = reviewModel;

