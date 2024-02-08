import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/index.js";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import authMiddleWare from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * 모임 개설
 */
router.post("/community", async (req, res, next) => {
  try {
    const { comName, interest } = req.body;
    //const loginId = req.user.userId;
    const loginId = 1;

    console.log(comName);
    if (!comName) {
      return res.status(400).json({ message: "모임 이름을 입력하세요." });
    }

    if (!interest) {
      return res.status(400).json({ message: "관심사를 선택하세요." });
    }

    if (!loginId) {
      return res.status(401).json({ message: "로그인하세요." });
    }
    const community = await prisma.community.create({
      data: {
        comName,
        interest,
        // managerId: loginId,
      },
    });

    return res.status(201).json({ message: "모임이 정상 등록되었습니다." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

/**
 * 모임 삭제
 */
router.delete("/community/:communityId", async (req, res, next) => {
  const { communityId } = req.params;
  //const loginId = req.user.userId;
  const loginId = 1;

  if (!communityId) {
    return res
      .status(400)
      .json({ message: "잘못된 접근입니다. (삭제할 모임 확인 불가)" });
  }

  if (!loginId) {
    return res.status(401).json({ message: "로그인하세요." });
  }

  try {
    const existingCommunity = await prisma.community.findFirst({
      where: { id: +communityId },
    });

    if (!existingCommunity) {
      return res
        .status(404)
        .json({ message: "삭제하려는 모임이 존재하지 않습니다." });
    }

    if (loginId != existingCommunity.managerId) {
      return res.status(403).json({ message: "모임장만 삭제 가능합니다." });
    }

    await prisma.community.delete({
      where: { id: +communityId },
    });

    return res.status(200).json({ message: "성공적으로 모임을 삭제했습니다." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

//모임 게시글 조회 => 해당모임을 선택하면 게시글 뿌려줌
router.get("/community/:communityId", async (req, res, next) => {
  try {
    const { communityId } = req.params;
    console.log(communityId);
    //
    const findCommuinty = await prisma.community.findFirst({
      where: { id: +communityId },
    });
    if (!findCommuinty) {
      return res
        .status(404)
        .json({ message: "모임 정보가 존재하지 않습니다." });
    }

    const findPosts = await prisma.posts.findFirst({
      where: {
        communityId: +communityId,
      },
    });
    if (!findPosts) {
      return res.status(404).json({ message: "표시할 게시글이 없습니다." });
    }

    //이 밑으로 확인 필요
    const posts = await prisma.posts.findMany({
      where: {
        communityId: +communityId,
      },
      include: {
        id: true,
        title: true,
        content: true,
        parentsId: true,
        createdAt: true,
        updatedAt: true,
        Users: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(201).json({ data: posts });
  } catch (err) {
    next(err);
  }
});

export default router;
