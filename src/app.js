import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import community from "./routes/community.routes.js";
import postlike from "./routes/postlike.js";
import userRouter from "./routes/users.router.js";
import postRouter from "./routes/posts.router.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [userRouter, community, postRouter, postlike]);

// app.use(errorMiddleware());

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버 오픈");
});
