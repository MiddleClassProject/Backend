const express = require('express') //웹서버 만들기 install 설치
const multer = require('multer');
const mysql = require('mysql') // npm install mysql , mysql 연결
const path = require('path') // 서브 디렉토리 'public' 사용 위한 경로 패키지
const static = require('serve-static') // serve.js 경로 설정
const cookieParser = require('cookie-parser'); //쿠키 모듈


// Database connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user : 'root',
    password: '1234' ,
    database: 'data',
    debug:false
})

// 서버 시작 시 테이블 확인 및 생성

const app = express()
app.use(express.urlencoded({extended:true})) 
app.use(express.json())
app.use('/public', static(path.join(__dirname, 'public'))); //public 폴더 안의 파일을 /public URL로 접근할 수 있도록 하고 있음
app.use(cookieParser());



//고객 로그인 라우터
app.post('/process/cuslogin', (req, res)=>{
    console.log('/process/cuslogin 호출됨 '+req)
    const paramId =req.body.id;
    const paramPassword = req.body.password;

    console.log('로그인 요청 '+paramId+''+paramPassword);

    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            console.log('Mysql getConnection error. aborted');
            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
            res.write('<h1>DB 서버 연결 실패</h1>')
            res.end();
            return;
        }

        const exec = conn.query('select `cus_id` from `cus` where `cus_id` = ? and `cus_password`=?',
                   [paramId, paramPassword],
                   (err, rows) => {
                        conn.release();
                        console.log('실행된 SQL query: '+exec.sql);
                        
                        if(err){
                            console.dir(err);
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h1>SQL query 실패</h1>')
                            res.end();
                            return;
                        }

                        if(rows.length > 0){
                            console.log('아이디 [%s], 패스워드가 일치하는 사용자 [%s] 찾음', paramId, rows[0].cus_id);                      
                            res.cookie('user_id', paramId, { maxAge: 900000, httpOnly: true }); // 고객 쿠키
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>로그인 성공</h2>')
                            res.end();
                            return;
                        }
                        else{
                            console.log('아이디[%s], 패스워드가 일치없음', paramId)
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>로그인 실패, 아이디와 패스워드를 확인하세요.</h2>')
                            res.end();
                            return;
                        }
                   }
        ) 
    })

});


app.post('/process/cus', (req, res)=>{
    console.log('/process/cus 호출됨'+req)
    
    const paramId = req.body.id;
    const paramName = req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;
    

    pool.getConnection((err, conn)=>
    {

        if (err) {
            conn.release();
            console.log('Mysql getConnection error. aborted');
            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
            res.write('<h1>DB 서버 연결 실패</h1>')
            res.end();
            return;
        }

        console.log('데이터베이스 연결 끈 얻었습니다.');

        // users 테이블에서 ID 중복 확인
        const checkUserIdQuery = 'SELECT user_id FROM users WHERE user_id = ?';
        conn.query(checkUserIdQuery, [paramId], (err, rows) => {
            if (err || rows.length > 0) {
                conn.release();
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write('<h2>이미 존재하는 사용자 ID입니다.</h2>');
                res.end();
                return;
            }

            // ID가 중복되지 않으면 users 테이블에 ID 추가
            const insertUserIdQuery = 'INSERT INTO users (user_id, user_type) VALUES (?, ?)';
            conn.query(insertUserIdQuery, [paramId, 'cus'], (err, result) => {
                if (err) {
                    conn.release();
                    res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                    res.write('<h1>사용자 ID 추가 실패</h1>');
                    res.end();
                    return;
                } 
            const exec = conn.query('insert into cus (cus_id, cus_name, cus_age, cus_password) values (?,?,?,?);',
                    [paramId,paramName,paramAge,paramPassword],
                    (err, result)=>{
                        conn.release();
                        console.log('실행된 SQL: '+exec.sql)
                    
                        if(err){
                            console.log('SQL 실행시 오류 발생')
                            console.dir(err);
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h1>SQL query 실패</h1>')
                            res.end();
                            return
                        }

                        if(result){
                            console.dir(result)
                            console.log('Inserted 성공')

                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>사용자 추가 성공</h2>')
                            res.end();
                        }
                        else {
                            console.log('Inserted 실패')

                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h1>사용자 추가 실패</h1>')
                            res.end();
                        }
                    }
                );       
            });
        });    
    });
});

//교수 로그인 라우트 추가
app.post('/process/prologin', (req, res)=>{
    console.log('/process/prologin 호출됨 '+req)
    const paramId =req.body.id;
    const paramPassword = req.body.password;

    console.log('로그인 요청 '+paramId+''+paramPassword);

    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            console.log('Mysql getConnection error. aborted');
            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
            res.write('<h1>DB 서버 연결 실패</h1>')
            res.end();
            return;
        }

        const exec = conn.query('select `pro_id` from `pro` where `pro_id` = ? and `pro_password`=?',
                   [paramId, paramPassword],
                   (err, rows) => {
                        conn.release();
                        console.log('실행된 SQL query: '+exec.sql);
                        
                        if(err){
                            console.dir(err);
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h1>SQL query 실패</h1>')
                            res.end();
                            return;
                        }

                        if(rows.length > 0){
                            console.log('아이디 [%s], 패스워드가 일치하는 사용자 [%s] 찾음', paramId, rows[0].pro_id);                      
                            res.cookie('user_id', paramId, { maxAge: 900000, httpOnly: true });//pro 쿠키설정
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>로그인 성공</h2>')
                            res.end();
                            return;
                        }
                        else{
                            console.log('아이디[%s], 패스워드가 일치없음', paramId)
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>로그인 실패, 아이디와 패스워드를 확인하세요.</h2>')
                            res.end();
                            return;
                        }
                   }
        ) 
    })

});

// multer 설정 (파일을 C:/proimage에 저장)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/proimage'); // 파일 저장 경로
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // 파일 이름 설정
    }
});

const upload = multer({ storage: storage });

// 새로운 교수 회원가입 라우트 추가
app.post('/process/pro', upload.single('certificate'), (req, res) => {
    console.log('/process/pro 호출됨' + req);
    
    const paramId = req.body.id;
    const paramName = req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;
    const paramPath = req.file ? path.join('C:/proimage', req.file.filename) : ''; // 파일 경로
    
    pool.getConnection((err, conn) => {
        if (err) {
            conn.release();
            console.log('Mysql getConnection error. aborted');
            res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
            res.write('<h1>DB 서버 연결 실패</h1>');
            res.end();
            return;
        }

        console.log('데이터베이스 연결 끈 얻었습니다.');
                // users 테이블에서 ID 중복 확인
                const checkUserIdQuery = 'SELECT user_id FROM users WHERE user_id = ?';
                conn.query(checkUserIdQuery, [paramId], (err, rows) => {
                    if (err || rows.length > 0) {
                        conn.release();
                        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                        res.write('<h2>이미 존재하는 사용자 ID입니다.</h2>');
                        res.end();
                        return;
                    }

                    // ID가 중복되지 않으면 users 테이블에 ID 추가
                    const insertUserIdQuery = 'INSERT INTO users (user_id, user_type) VALUES (?, ?)';
                    conn.query(insertUserIdQuery, [paramId, 'pro'], (err, result) => {
                        if (err) {
                            conn.release();
                            res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                            res.write('<h1>사용자 ID 추가 실패</h1>');
                            res.end();
                            return;
                        }

                const exec = conn.query(
                    'insert into pro (pro_id, pro_name, pro_age, pro_password, pro_path, pro_check) values (?,?,?,?,?,?);',
                    [paramId, paramName, paramAge, paramPassword, paramPath, false], // 증명서 확인 디폴트로 false 설정
                    (err, result) => {
                        conn.release();
                        console.log('실행된 SQL: ' + exec.sql);

                        if (err) {
                            console.log('SQL 실행시 오류 발생');
                            console.dir(err);
                            res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                            res.write('<h1>SQL query 실패</h1>');
                            res.end();
                            return;
                        }

                        if (result) {
                            console.dir(result);
                            console.log('교수 추가 성공');

                            res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                            res.write('<h2>교수 추가 성공</h2>');
                            res.end();
                        } else {
                            console.log('교수 추가 실패');

                            res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                            res.write('<h1>교수 추가 실패</h1>');
                            res.end();
                        }
                    }
                );    
            });
        });
    });
});


//쿠키 값 읽어서 로그인 상태 확인하기
app.get('/check-login', (req, res) => {
    const userId = req.cookies.user_id;

    if (userId) {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>${userId}님이 로그인 상태입니다.</h2>`);
        res.end();
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
        res.write('<h2>로그인되지 않았습니다.</h2>');
        res.end();
    }
});

//로그아웃 시 쿠키 삭제
app.post('/process/logout', (req, res) => {
    res.clearCookie('user_id');
    res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
    res.write('<h2>로그아웃 성공</h2>');
    res.end();
});


app.listen(3000, ()=>{
    console.log('Listening on port 3000');
})
