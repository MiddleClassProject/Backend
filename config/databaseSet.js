const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'test_reviews'
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database");
});

module.exports = db;

