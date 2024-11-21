// 로그인 상태 확인
const checkLogin = (req, res) => {
    const userId = req.cookies.user_id;

    if (userId) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>${userId}님이 로그인 상태입니다.</h2>`);
        res.end();
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
        res.write('<h2>로그인되지 않았습니다.</h2>');
        res.end();
    }
};

// 로그아웃
const logout = (req, res) => {
    res.clearCookie('user_id');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
    res.write('<h2>로그아웃 성공</h2>');
    res.end();
};

module.exports = {checkLogin, logout };