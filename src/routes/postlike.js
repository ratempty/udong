import express from 'express';
import authMiddleWare from '../middleware/auth.middleware.js';
import { prisma } from '../utils/index.js';

const router = express.Router();

//좋아요
router.post('/like/:postId', authMiddleWare, async (req, res, next) => {
	try {
		const { postId } = req.params;
		const { id } = req.user;

		const Findpost = await prisma.posts.findFirst({
			where: { id: +postId },
			select: {
				userId: true,
				parentsId: true,
			},
		});

		if (!Findpost) {
			return res
				.status(404)
				.json({ message: '해당 게시글이 존재 하지 않습니다.' });
		}

		//내 게시글은 좋아요 안되게 => 해당 포스트 작성자 아이디와 req.user id가 일치할 경우 안되게
		if (Findpost.userId == +id) {
			return res
				.status(402)
				.json({ message: '자신이 쓴 게시글은 좋아요를 누를 수 없습니다!!!' });
		}
		//아이디에 해당하는 포스트를 찾아서,
		//인증된 유저 정보가 해당 포스트에 좋아요 기록이 없다면 좋아요, 있다면 좋아요 취소
		const like = await prisma.likes.findFirst({
			where: { userId: +id, postId: +postId },
		});

		if (!like) {
			await prisma.likes.create({
				data: {
					userId: +id,
					postId: +postId,
				},
			});

			const undatedParentsId = Findpost.parentsId + 1;
			console.log(Findpost.parentsId, undatedParentsId);
			await prisma.posts.update({
				where: {
					id: +postId,
				},
				data: {
					parentsId: undatedParentsId,
				},
			});
		} else {
			return res
				.status(402)
				.json({ message: '좋아요는 한번만 누를 수 있습니다.' });
		}

		return res.status(201).json({ message: '좋아용' });
	} catch (err) {
		next(err);
	}
});

//좋아요취소
router.delete('/like/:postId', authMiddleWare, async (req, res, next) => {
	try {
		const { postId } = req.params;
		const { id } = req.user;

		const Findpost = await prisma.posts.findFirst({
			where: { id: +postId },
		});

		if (!Findpost) {
			return res
				.status(404)
				.json({ message: '해당 게시글이 존재 하지 않습니다.' });
		}

		const like = await prisma.likes.findFirst({
			where: { userId: +id, postId: +postId },
		});
		if (like) {
			await prisma.likes.delete({
				where: { id: like.id },
			});
			const undatedParentsId = Findpost.parentsId - 1;
			await prisma.posts.update({
				where: {
					id: +postId,
				},
				data: {
					parentsId: undatedParentsId,
				},
			});
		} else {
			return res.status(402).json({ message: '좋아요 기록이 없습니다.' });
		}
		return res.status(200).json({ message: '싫어요' });
	} catch (err) {
		next(err);
	}
});

export default router;
