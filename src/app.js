import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api", []);
app.use(errorMiddleware());

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버 오픈");
});
