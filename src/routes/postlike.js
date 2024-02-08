import express from "express";
import authMiddleWare from "../middleware/auth.middleware.js";

const router = express.Router();

//좋아요
router.post("/like/:postId", authMiddleWare, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user; //임시, 수정필요

    // const findCommuinty = await prisma.community.findFirst({
    //   where: { id: +communityId },
    // });
    // if (!findCommuinty) {
    //   return res
    //     .status(404)
    //     .json({ message: "모임 정보가 존재하지 않습니다." });
    // }

    const Findpost = await prisma.posts.findFirst({
      where: { id: +postId },
    });

    if (!Findpost) {
      return res
        .status(404)
        .json({ message: "해당 게시글이 존재 하지 않습니다." });
    }

    //아이디에 해당하는 포스트를 찾아서,
    //인증된 유저 정보가 해당 포스트에 좋아요 기록이 없다면 좋아요, 있다면 좋아요 취소
    const like = await prisma.likes.findFirst({
      where: { userId: +userId, postId: +postId },
    });
    if (!like) {
      await prisma.likes.create({
        data: {
          id: 1,
        },
      });
    } else {
      return res
        .status(402)
        .json({ message: "좋아요는 한번만 누를 수 있습니다." });
    }
  } catch (err) {
    next(err);
  }
});

//좋아요취소
router.delete("/like/:postId", authMiddleWare, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user; //임시, 수정필요

    const Findpost = await prisma.posts.findFirst({
      where: { id: +postId },
    });

    if (!Findpost) {
      return res
        .status(404)
        .json({ message: "해당 게시글이 존재 하지 않습니다." });
    }

    const like = await prisma.likes.findFirst({
      where: { userId: +userId, postId: +postId },
    });
    if (like) {
      await prisma.likes.delete({
        where: { userId: +userId, postId: +postId },
      });
    } else {
      return res.status(402).json({ message: "좋아요 기록이 없습니다." });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
