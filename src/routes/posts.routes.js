import express from 'express';
import { prisma } from '../utils/index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * 댓글 등록
 */
router.post('/comment/:parentsId', async (req, res, next) => {
	const { content } = req.body;
	const { parentsId } = req.params;
	//const loginId = req.user.userId;
	const loginId = 1;

	if (!loginId) {
		return res.status(401).json({ message: '작성자 정보를 찾을 수 없습니다.' });
	}

	if (!parentsId) {
		return res.status(401).json({ message: '원글을 찾을 수 없습니다.' });
	}
	if (!content) {
		return res.status(401).json({ message: '댓글 내용을 입력하세요.' });
	}

	const postCommunity = await prisma.posts.findFirst({
		where: {
			id: +parentsId,
			isComment: false,
		},
	});

	if (!postCommunity) {
		return res
			.status(409)
			.json({ message: '존재하지 않는 커뮤니티의 게시글입니다.' });
	}

	try {
		const communityId = postCommunity.communityId;
		const comment = await prisma.posts.create({
			data: {
				userId: +loginId,
				communityId,
				title: '댓글',
				content,
				isComment: true,
			},
		});

		return res.status(201).json({ message: '댓글이 정상 등록되었습니다.' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.', error: error.message });
	}
});
/**
 * 댓글 수정
 */
router.patch('/comment/:postId', async (req, res, next) => {
	const { postId } = req.params;
	const { content } = req.body;

	//const loginId = req.user.userId;
	const loginId = 1;

	try {
		const existingComment = await prisma.posts.findUnique({
			where: {
				id: +postId,
				isComment: true,
			},
		});

		if (!existingComment) {
			return res
				.status(404)
				.json({ message: '해당 댓글 조회에 실패하였습니다.' });
		}

		if (existingComment.userId !== loginId) {
			return res
				.status(404)
				.json({ message: '본인의 댓글만 수정하실 수 있습니다.' });
		}

		const updatedComment = await prisma.posts.update({
			where: { id: +postId },
			data: {
				...(content && { content }),
			},
		});

		return res.status(200).json({
			message: '댓글이 정상 수정되었습니다.',
			resume: updatedComment,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.', error: error.message });
	}
});

/**
 * 댓글 조회
 */

export default router;
