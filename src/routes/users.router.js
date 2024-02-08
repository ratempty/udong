import express from "express";
import { prisma } from "../utils/index.js";

const router = express.Router();

/**
 * 프로필 조회
 */
router.get("/users/:userId", async (req, res, next) => {
  //const { userId } = req.user;
  const { userId } = req.params;

  const user = await prisma.users.findFirst({
    where: { id: +userId },
    select: {
      name: true,
      email: true,
      interest: true,
      profileImage: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "존재하지 않는 유저입니다." });
  }

  return res.status(200).json({ data: user });
});

/**
 * 본인 프로필 수정
 */
router.patch("/users/:userId", async (req, res, next) => {
  const { userId } = req.params;
  //const userId = req.user.userId;
  const { name, email, interest, profileImage } = req.body;

  try {
    const existUser = await prisma.users.findUnique({
      where: { id: +userId },
    });

    if (!existUser) {
      return res.status(404).json({ message: "존재하지 않는 유저입니다." });
    }

    if (existUser.id !== +userId) {
      return res
        .status(404)
        .json({ message: "본인의 회원정보만 수정하실 수 있습니다." });
    }

    const updatedUser = await prisma.users.update({
      where: { id: +userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(interest && { interest }),
        ...(profileImage && { profileImage }),
      },
    });

    return res.status(200).json({
      message: "회원정보가 정상 수정되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

export default router;
