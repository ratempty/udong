import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/index.js';
import { createAccessToken } from "../utils/token.js";

const router = express.Router();

router.post('/sign-up', async (req, res, next) => {
	try {
		const {
			email,
			password,
			password_check,
			name, interest,
			profileImage
		} = req.body;

		const isExistUser = await prisma.users.findFirst({
			where: {
				email,
			},
		});
		if (isExistUser) {
			return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
		}
		if (password !== password_check) {
			return res.status(409).json({ message: '비밀번호는 비밀번호 확인과 일치해야 합니다.' })
		}
		if (password.length < 6) {
			return res.status(409).json({ message: '비밀번호는 6글자 이상이여야 합니다.' })
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.users.create({
			data: {
				email,
				password: hashedPassword,
				name,
				interest,
				profileImage
			},
		});
		return res.status(201).json({ message: `${name}님 회원가입을 축하합니다.` });
	}
	catch (err) {
		next(err);
	}
});

router.post('/sign-in', async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await prisma.users.findUnique({ where: { email } });

		if (!user)
			return res.status(401).json({ message: '유효하지 않은 이메일 또는 비밀번호' });

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword)
			return res.status(401).json({ message: '유효하지 않은 이메일 또는 비밀번호' });

		const accessToken = createAccessToken(user.userId);

		res.cookie('authorization', `Bearer ${accessToken}`);
		return res.status(200).json({ message: '로그인 성공' });
	} catch (err) {
		next(err);
	}
});

/**
 * 프로필 조회
 */
router.get('/users/:userId', async (req, res, next) => {
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

		return res.status(404).json({ message: '존재하지 않는 유저입니다.' });

	}

	return res.status(200).json({ data: user });
});

/**
 * 본인 프로필 수정
 */
router.patch('/users/:userId', async (req, res, next) => {
	const { userId } = req.params;
	//const userId = req.user.userId;
	const { name, email, interest, profileImage } = req.body;

	try {
		const existUser = await prisma.users.findUnique({
			where: { id: +userId },
		});

		if (!existUser) {
			return res.status(404).json({ message: '존재하지 않는 유저입니다.' });
		}

		if (existUser.id !== +userId) {
			return res
				.status(404)
				.json({ message: '본인의 회원정보만 수정하실 수 있습니다.' });
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
			message: '회원정보가 정상 수정되었습니다.',
			user: updatedUser,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.', error: error.message });
	}
});

export default router;
