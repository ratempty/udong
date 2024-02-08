import express from "express";
import { prisma } from "../utils/index.js";
import authMiddleware from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

//게시글 등록
router.post(
  "/community/:communityId",
  authMiddleware,
  async (req, res, next) => {
    const { communityId } = req.params;
    const user = req.user;
    const { title, content } = req.body;

    //유저가 커뮤니티에 속해있으면 작성 아니면 모임가입필요
    const isCommunityUser = await prisma.communityUsers.findFirst({
      where: {
        userId: +user.id,
        communityId: +communityId,
      },
    });

    if (isCommunityUser) {
      const post = await prisma.posts.create({
        data: {
          userId: +user.id,
          communityId: +communityId,
          title: title,
          content: content,
        },
      });
    } else {
      return res
        .status(403)
        .json({ message: "모임에 가입한 사람만 글을 작성할 수 있습니다." });
    }

    return res.status(201).json({ message: "작성완료" });
  }
);

// 게시글 수정
// localhost:3000/api/:communityId/:postId
router.patch("/community/:postId", authMiddleware, async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;
  const { title, content } = req.body;

  // 자기 글인지 확인
  const isMyPost = await prisma.posts.findFirst({
    where: {
      id: +postId,
    },
    select: {
      userId: true,
    },
  });

  if (!isMyPost) {
    return res.status(404).json({ message: "해당 글을 찾을 수 없습니다." });
  }

  if (isMyPost.userId !== userId) {
    return res.status(403).json({ message: "본인의 글만 수정할 수 있습니다." });
  }

  const updatePost = await prisma.posts.update({
    where: {
      id: +postId,
      userId: +userId,
    },
    data: {
      title: title,
      content: content,
    },
  });
  return res.status(200).json({ message: "수정 완료" });
});

// 게시글 삭제
//localhost:3000/api/:communityId/:postId
router.delete("/community/:postId", authMiddleware, async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;

  // 자기 글인지 확인
  const isMyPost = await prisma.posts.findFirst({
    where: {
      id: +postId,
    },
    select: {
      userId: true,
    },
  });

  if (!isMyPost) {
    return res.status(404).json({ message: "해당 글을 찾을 수 없습니다." });
  }

  if (isMyPost.userId !== userId) {
    return res.status(403).json({ message: "본인의 글만 삭제할 수 있습니다." });
  }

  await prisma.posts.delete({
    where: {
      id: +postId,
      userId: +userId,
    },
  });
  return res.status(204).json({ message: "삭제완료" });
});

export default router;
