import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import router from "./routes/index.js";
const app = express();
const port = process.env.PORT ?? 5000;
const frontendUrl = process.env.FRONTEND_TEST
const nginxUrl = process.env.FRONTEND_NGINX;
app.use(
    cors({
        origin: [frontendUrl!, nginxUrl!],
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());


app.use("/api", router);



app.get("/", (_req, res) => {
    res.send("Hello, World!");
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


