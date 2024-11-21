const pool = require('../../config/databaseSet');

const login = async (req, res) => {
    const paramId = req.body.id;
    const paramPassword = req.body.password;

    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT `cus_id` FROM `cus` WHERE `cus_id` = ? AND `cus_password` = ?', [paramId, paramPassword]);
        conn.release();

        if (rows.length > 0) {
            res.cookie('user_id', paramId, { maxAge: 900000, httpOnly: true });
            // 로그인 성공 시 리디렉션
            res.redirect('../../review/reviewList.html'); // '/dashboard'는 리디렉션할 경로입니다. 필요에 따라 수정하세요.
        } else {
            res.writeHead(401, { 'Content-Type': 'text/html; charset=utf8' });
            res.write('<h2>로그인 실패: 잘못된 ID 또는 비밀번호</h2>');
            res.end();
        }
    } catch (err) {
        console.error("DB connection or query error:", err);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
        res.write('<h1>DB 서버 연결 실패 또는 SQL query 실패</h1>');
        res.end();
    }
};

const register = (req, res) => {
    const paramId = req.body.id;
    const paramName = req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error("DB connection error:", err);
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            res.write('<h1>DB 서버 연결 실패</h1>');
            res.end();
            return;
        }

        const checkUserIdQuery = 'SELECT user_id FROM users WHERE user_id = ?';
        conn.query(checkUserIdQuery, [paramId], (err, rows) => {
            if (err || rows.length > 0) {
                conn.release();
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                res.write('<h2>이미 존재하는 사용자 ID입니다.</h2>');
                res.end();
                return;
            }

            const insertUserIdQuery = 'INSERT INTO users (user_id, user_type) VALUES (?, ?)';
            conn.query(insertUserIdQuery, [paramId, 'cus'], (err) => {
                if (err) {
                    conn.release();
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                    res.write('<h1>사용자 ID 추가 실패</h1>');
                    res.end();
                    return;
                }

                const exec = conn.query(
                    'INSERT INTO cus (cus_id, cus_name, cus_age, cus_password) VALUES (?, ?, ?, ?)',
                    [paramId, paramName, paramAge, paramPassword],
                    (err, result) => {
                        conn.release();
                        if (err) {
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                            res.write('<h1>SQL query 실패</h1>');
                            res.end();
                            return;
                        }

                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                        res.write('<h2>사용자 추가 성공</h2>');
                        res.end();
                    }
                );
            });
        });
    });
};

module.exports = { login, register };