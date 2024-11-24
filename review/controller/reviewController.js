const pool = require('../../config/databaseSet');

const getProfessors = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT pro_name FROM review');
        res.json(rows);
    } catch (err) {
        console.error('교수 리스트 로드 실패:', err);
        res.status(500).send('서버 오류');
    }
};

const getReviewList = async (req, res) => {
    const { professor, sort } = req.query;

    let query = 'SELECT * FROM review';
    const queryParams = [];

    if (professor) {
        query += ' WHERE pro_name = ?';
        queryParams.push(professor);
    }

    switch (sort) {
        case 'latest':
            query += ' ORDER BY created_at DESC';
            break;
        case 'oldest':
            query += ' ORDER BY created_at ASC';
            break;
        case 'likes':
            query += ' ORDER BY likes DESC';
            break;
        default:
            query += ' ORDER BY created_at DESC';
    }

    try {
        const [rows] = await pool.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        console.error('리뷰 리스트 로드 실패:', err);
        res.status(500).send('서버 오류');
    }
};

const submitReview = async (req, res) => {
    const { professor, content } = req.body;
    const createdAt = new Date();

    try {
        await pool.query(
            'INSERT INTO review (pro_name, content, created_at) VALUES (?, ?, ?)',
            [professor, content, createdAt]
        );
        res.status(201).send('리뷰가 저장되었습니다.');
    } catch (err) {
        console.error('리뷰 저장 실패:', err);
        res.status(500).send('서버 오류');
    }
};

module.exports = { getProfessors, getReviewList, submitReview };
