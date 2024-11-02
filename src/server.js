const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const professorRouter = require('./routes/professor/professorRouter');
const communityRouter = require('./routes/community/communityRouter');

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/professor", professorRouter);
app.use("/community", communityRouter);

app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(3000, () => {
    console.log("Starting server");
})