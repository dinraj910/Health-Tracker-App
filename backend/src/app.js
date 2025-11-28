import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World! Server is up and running. ✅😁👍");
});

export default app;
