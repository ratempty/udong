import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/index.js";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import authMiddleWare from "../middleware/auth.middleware.js";

const router = express.Router();

//모임 게시글 조회 => 해당모임을 선택하면 게시글 뿌려줌
router.get("/:communityId", async (req, res, next) => {
  try {
    const { communityID } = req.params;

    const findCommuinty = await prisma.community.findFirst({
      where: { ID: +communityID },
    });
    if (!findCommuinty) {
      return res
        .status(404)
        .json({ message: "모임 정보가 존재하지 않습니다." });
    }
    const community = await prisma.community.findMany({
      where: {
        ID: +communityID,
      },
      include: {
        comName: true,
        interest: true,
        Posts: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            Users: {
              select: {
                name: true,
              },
            },
            Likes: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({ data: community });
  } catch (err) {
    next(err);
  }
});

export default router;
