const pool = require('../../config/databaseSet');

const login = async (req, res) => {
    const { id, password } = req.body;

    try {
        const conn = await pool.getConnection();

        // 1. 사용자 ID와 유형 조회
        const [userRows] = await conn.query(
            `SELECT user_id, user_type 
             FROM users 
             WHERE user_id = ?`, 
            [id]
        );

        if (userRows.length === 0) {
            conn.release();
            res.writeHead(401, { 'Content-Type': 'text/html; charset=utf8' });
            res.write('<h2>로그인 실패: 아이디가 잘못되었습니다.</h2>');
            res.end();
            return;
        }

        const userType = userRows[0].user_type;

        // 2. 사용자 유형에 따라 비밀번호 확인
        let query, tableName;

        if (userType === 'cus') {
            tableName = 'cus';
            query = 'SELECT cus_password FROM cus WHERE cus_id = ? AND cus_password = ?';
        } else if (userType === 'pro') {
            tableName = 'pro';
            query = 'SELECT pro_password FROM pro WHERE pro_id = ? AND pro_password = ?';
        } else {
            conn.release();
            res.status(400).send('알 수 없는 사용자 유형입니다.');
            return;
        }

        const [passwordRows] = await conn.query(query, [id, password]);
        conn.release();

        if (passwordRows.length > 0) {
            // 로그인 성공 처리
            res.cookie('user_id', id, { maxAge: 900000, httpOnly: true });
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
            res.write(`<h2>${userType === 'cus' ? '고객' : '교수'} 로그인 성공</h2>`);
            res.end();
        } else {
            // 비밀번호 불일치
            res.writeHead(401, { 'Content-Type': 'text/html; charset=utf8' });
            res.write('<h2>로그인 실패: 비밀번호가 잘못되었습니다.</h2>');
            res.end();
        }
    } catch (err) {
        console.error('DB connection or query error:', err);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf8' });
        res.write('<h1>DB 서버 연결 실패 또는 SQL query 실패</h1>');
        res.end();
    }
};

module.exports = { login };
