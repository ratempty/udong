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

	if (followerId == followingId) {
		return res.status(400).json({ message: '본인은 팔로우할 수 없습니다.' });
	}

	try {
		const existingFollow = await prisma.follow.findFirst({
			where: {
				followerId: +followerId,
				followingId: +followingId,
			},
		});

		if (existingFollow) {
			return res.status(409).json({ message: '이미 팔로우한 유저입니다.' });
		}

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
		const existingFollow = await prisma.follow.findFirst({
			where: {
				followerId: +followerId,
				followingId: +followingId,
			},
		});

		if (!existingFollow) {
			return res
				.status(404)
				.json({ message: '해당 유저를 팔로우하고 있지 않습니다.' });
		}
		const unfollow = await prisma.follow.delete({
			where: {
				id: +existingFollow.id,
			},
		});
		res.status(200).json({ message: '언팔로우 성공', unfollow });
	} catch (error) {
		res.status(404).json({ message: '언팔로우 실패', error: error.message });
	}
});

/**
 * 팔로워 목록 조회
 */
router.get('/followers/:userId', authMiddleWare, async (req, res) => {
	const { userId } = req.params;

	try {
		const followers = await prisma.follow.findMany({
			where: {
				followingId: +userId,
			},
			include: {
				follower: {
					select: {
						name: true,
						interest: true,
						email: true,
					},
				},
			},
		});
		res.status(200).json(followers.map((follow) => follow.follower));
	} catch (error) {
		res
			.status(500)
			.json({
				message: '팔로워 목록 조회 중 오류가 발생했습니다.',
				error: error.message,
			});
	}
});

/**
 * 특정 유저의 팔로잉 조회
 */
router.get('/following/:userId', authMiddleWare, async (req, res) => {
	const { userId } = req.params;

	try {
		const followings = await prisma.follow.findMany({
			where: {
				followerId: +userId,
			},

			include: {
				following: {
					select: {
						name: true,
						interest: true,
						email: true,
					},
				},
			},
		});
		res.status(200).json(followings.map((follow) => follow.following));
	} catch (error) {
		res
			.status(500)
			.json({
				message: '팔로잉 목록 조회 중 오류가 발생했습니다.',
				error: error.message,
			});
	}
});

// 팔로잉 및 팔로워 수 집계 함수
async function getFollowingCount(userId) {
	return await prisma.follow.count({
		where: { followerId: userId },
	});
}

async function getFollowerCount(userId) {
	return await prisma.follow.count({
		where: { followingId: userId },
	});
}

/**
 * 팔로우/팔로워 수 조회
 */
router.get('/follow/follow-stats/:userId', authMiddleWare, async (req, res) => {
	const userId = parseInt(req.params.userId);

	try {
		const followingCount = await getFollowingCount(userId);
		const followerCount = await getFollowerCount(userId);
		res.status(200).json({
			followingCount,
			followerCount,
		});
	} catch (error) {
		res.status(500).json({ message: '서버 오류', error: error.message });
	}
});

export default router;