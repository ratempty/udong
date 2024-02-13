import express from 'express';
import dotenv from 'dotenv';
import { prisma } from '../utils/index.js';
import authMiddleWare from '../middleware/auth.middleware.js';

dotenv.config();
const router = express.Router();

/**
 * 팔로우
 */
router.post('/follow/:followingId', authMiddleWare, async (req, res) => {
	const { followingId } = req.params;
	const followerId = req.user.id;

	try {
		const follow = await prisma.follow.create({
			data: {
				followerId: +followerId,
				followingId: +followingId,
			},
		});
		res.status(201).json(follow);
	} catch (error) {
		res.status(400).json({ message: '팔로우 실패', error: error.message });
	}
});

/**
 * 언팔로우
 */
router.delete('/unfollow/:followingId', authMiddleWare, async (req, res) => {
	const { followingId } = req.params;
	const followerId = req.user.id;
	try {
		const unfollow = await prisma.follow.delete({
			where: {
				followerId: +followerId,
				followingId: +followingId,
			},
		});
		res.status(204).json({ message: '언팔로우 성공', unfollow });
	} catch (error) {
		res.status(404).json({ message: '언팔로우 실패', error: error.message });
	}
});

export default router;
