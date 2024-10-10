const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const professorRouter = require('./professor/professorRouter');

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/professor", professorRouter);

app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(3000, () => {
    console.log("Starting server");
})