const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 리뷰 라우트 설정
const reviewsRoute = require('./src/routes/reviews');
app.use('/reviews', reviewsRoute);

// 채팅 라우트 설정
const charttingRoute = require('./src/routes/charttingRoute');
app.use('/chat', charttingRoute);

app.listen(3000, () => {
    console.log("Starting server on http://localhost:3000");
});







