import express from 'express';
import { prisma } from '../utils/index.js';
import jwt from 'jsonwebtoken';
import authMiddleWare from '../middleware/auth.middleware.js';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const router = express.Router();

/**
 * 모임 개설
 */
router.post('/community', authMiddleWare, async (req, res, next) => {
	const { comName, interest, communityContent } = req.body;
	const loginId = req.user.id;

	if (!comName) {
		return res.status(400).json({ message: '모임 이름을 입력하세요.' });
	}

	if (!interest) {
		return res.status(400).json({ message: '관심사를 선택하세요.' });
	}

	if (!loginId) {
		return res.status(401).json({ message: '로그인하세요.' });
	}

	try {
		const community = await prisma.community.create({
			data: {
				comName,
				interest,
				managerId: loginId,
				communityContent,
			},
		});

		return res.status(201).json({ message: '모임이 정상 등록되었습니다.' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.', error: error.message });
	}
});

/**
 * 모임 삭제
 */

router.delete(
	'/community/:communityId',
	authMiddleWare,
	async (req, res, next) => {
		const { communityId } = req.params;
		const loginId = req.user.id;

		if (!communityId) {
			return res
				.status(400)
				.json({ message: '잘못된 접근입니다. (삭제할 모임 확인 불가)' });
		}

		if (!loginId) {
			return res.status(401).json({ message: '로그인하세요.' });
		}

		try {
			const existingCommunity = await prisma.community.findFirst({
				where: { id: +communityId },
			});

			if (!existingCommunity) {
				return res
					.status(404)
					.json({ message: '삭제하려는 모임이 존재하지 않습니다.' });
			}

			// if (loginId != existingCommunity.managerId) {
			//   return res.status(403).json({ message: "모임장만 삭제 가능합니다." });
			// }

			await prisma.community.delete({
				where: { id: +communityId },
			});

			return res
				.status(200)
				.json({ message: '성공적으로 모임을 삭제했습니다.' });
		} catch (error) {
			return res
				.status(500)
				.json({ message: '서버 오류가 발생했습니다.', error: error.message });
		}
	},
);

//모임가입
router.post(
	'/com-sign-up/:communityId',
	authMiddleWare,
	async (req, res, next) => {
		const { id } = req.user;
		const { communityId } = req.params;

		const findCommuinty = await prisma.community.findFirst({
			where: { id: +communityId },
		});
		if (!findCommuinty) {
			return res
				.status(404)
				.json({ message: '모임 정보가 존재하지 않습니다.' });
		}

		const User = await prisma.communityUsers.findFirst({
			where: {
				userId: +id,
			},
		});
		if (User) {
			return res
				.status(404)
				.json({ message: '이미 모임에 가입된 사용자 입니다.' });
		}

		const signupUser = await prisma.communityUsers.create({
			data: {
				communityId: +communityId,
				userId: +id,
			},
		});

		return res.status(201).json({ message: '모임 가입 완료했습니다.' });
	},
);

//모임 게시글 조회 => 해당모임을 선택하면 게시글 뿌려줌
router.get('/community/post/:communityId', async (req, res, next) => {
	try {
		const { communityId } = req.params;

		const findCommuinty = await prisma.community.findFirst({
			where: { id: +communityId },
		});
		if (!findCommuinty) {
			return res
				.status(404)
				.json({ message: '모임 정보가 존재하지 않습니다.' });
		}

		const findPosts = await prisma.posts.findFirst({
			where: {
				communityId: +communityId,
			},
		});
		if (!findPosts) {
			return res.status(404).json({ message: '표시할 게시글이 없습니다.' });
		}

		const posts = await prisma.posts.findMany({
			where: {
				communityId: +communityId,
			},
			select: {
				id: true,
				title: true,
				content: true,
				parentsId: true,
				createdAt: true,
				updatedAt: true,
				user: {
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

router.get('/recommendCom', authMiddleWare, async (req, res, next) => {
	try {
		const userId = req.user.id;

		// ** 관심사가 하나라도 일치하는 모임 출력하기
		// 1. 유저관심사 2. 커뮤니티 관심사 split(",")으로 나눈 배열을 for문 두개로 하나하나 비교하기
		// 일치하는 경우, 일치관심사배열에 넣기
		// 일치관심사 배열로 커뮤니티 조회하기

		//1. 유저의 관심사 모음
		const userInterest = await prisma.users.findMany({
			where: { id: +userId },
			select: {
				interest: true,
			},
		});

		if (!userInterest) {
			return res.status(401).json({ message: '관심사 정보를 추가해주십시오.' });
		}

		//2. 커뮤니티 관심사 모음
		const comInterest = await prisma.community.findMany({
			select: {
				interest: true,
			},
		});

		//관심사 배열
		const removeSpaces = (str) => str.split(' ').join('');
		const userInterArr = removeSpaces(userInterest[0].interest).split(',');
		const comInterArr = comInterest.map((item) =>
			removeSpaces(item.interest).split(','),
		);
		// console.log(userInterArr, comInterArr);
		const correctInter = [];
		for (let i = 0; i < userInterArr.length; i++) {
			for (let j = 0; j < comInterArr.length; j++) {
				for (let k = 0; k < comInterArr[j].length; k++) {
					if (userInterArr[i] === comInterArr[j][k]) {
						correctInter.push(userInterArr[i]);
						break;
					}
				}
			}
		}
		const uniqueCorrectInter = [...new Set(correctInter)];
		// console.log(uniqueCorrectInter);

		//관심사와 일치하는 모임 출력
		const correctCom = await prisma.community.findMany({
			where: {
				OR: uniqueCorrectInter.map((interest) => ({
					interest: {
						contains: interest,
					},
				})),
			},
			select: {
				id: true,
				comName: true,
				interest: true,
				communityImage: true,
			},
		});

		return res.status(201).json({ data: correctCom });
	} catch (err) {
		next(err);
	}
});

//로그인이 안되어있거나, 관심사를 선택하지 않은 유저의 경우 랜덤으로 커뮤니티 조회하기(첫화면)
router.get('/community', async (req, res, next) => {
	const comId = await prisma.community.findMany({
		select: {
			id: true,
		},
	});

	function Random() {
		const randomId = comId.map((item) => item.id);
		// Fisher-Yates 알고리즘을 사용하여 배열 랜덤 섞기
		for (let i = randomId.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			// 배열의 원소 위치 바꾸기
			[randomId[i], randomId[j]] = [randomId[j], randomId[i]];
		}
		return randomId;
	}
	const R = Random();

	const selectId = R.slice(0, 7);
	console.log(R, selectId);
	const randomCommunity = await prisma.community.findMany({
		where: { id: { in: selectId } },
		orderBy: { id: 'desc' },
		select: {
			id: true,
			comName: true,
			interest: true,
			communityImage: true,
			//   manageId: true,
		},
	});
	return res.status(201).json({ data: randomCommunity });
});

//모임 정보조회

router.get('/community/:communityId', async (req, res, next) => {
	try {
		const { communityId } = req.params;

		const findCommuinty = await prisma.community.findFirst({
			where: { id: +communityId },
		});
		if (!findCommuinty) {
			return res
				.status(404)
				.json({ message: '모임 정보가 존재하지 않습니다.' });
		}

		const community = await prisma.community.findMany({
			where: {
				id: +communityId,
			},
			select: {
				communityImage: true,
				comName: true,
				interest: true,
				communityContent: true,
			},
		});

		return res.status(201).json({ data: community });
	} catch (err) {
		next(err);
	}
});

export default router;
