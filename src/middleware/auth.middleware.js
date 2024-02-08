import jwt from "jsonwebtoken";
import { prisma } from "../utils/index.js";
import { createAccessToken } from "../utils/token.js";
import dotenv from "dotenv";

dotenv.config(); //process.env.(변수이름)

export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    console.log(authorization);

    if (!authorization)
      throw new Error("요청한 사용자의 토큰이 존재하지 않습니다.");

    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 Bearer 형식이 아닙니당");

    const decodedToken = jwt.verify(token, process.env.SESSION_SECRET_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
      select: {
        userId: true,
        userInfos: {
          select: {
            userInfoId: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("토큰 사용자가 존재하지않습니다.");
    }
    // console.log(user);
    req.user = user;
    user.userInfoId = user.userInfos.userInfoId;
    next();
  } catch (err) {
    console.log(err);
    if (err.name === "jwt expired")
      return res.status(401).json({ message: "토큰이 만료되었습니다." });

    // if ((err.name === "TokenExpiredError"))
    //   return res.status(401).json({ message: "토큰이 만료되었습니다." });

    // if ((err.name === "JsonWebTokenError"))
    //   return res.status(401).json({ message: "유효하지 않은 토큰입니다." });

    return res.status(400).json({ message: err.message });
  }
}
