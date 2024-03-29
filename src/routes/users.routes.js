import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/index.js';
import { createAccessToken, createVerifyToken } from '../utils/token.js';
import authMiddleWare from '../middleware/auth.middleware.js';
import uploadMiddleWare, {
	deleteExistingFile,
} from '../middleware/upload.middleware.js';
import dotenv from 'dotenv';
import emailSender from '../utils/nodemailer.js';

const router = express.Router();
dotenv.config();

router.post('/email', async (req, res, next) => {
	const { email } = req.body;
	const user = await prisma.users.findUnique({ where: { email } });

	if (!user.isVerified) {
		const verifyToken = createVerifyToken(user.email);
		res.cookie('verification', `Bearer ${verifyToken}`);
		emailSender(email, verifyToken);
		try {
			res.json({
				ok: true,
				msg: '이메일이 성공적으로 전송되었습니다.',
				token: verifyToken,
			});
		} catch (error) {
			console.error('이메일 전송에 실패했습니다:', error);
			res.status(500).json({ ok: false, msg: '이메일 전송에 실패했습니다.' });
		}
	} else {
		res.status(400).json({ ok: false, msg: '이미 인증 완료된 이메일입니다.' });
	}
});

router.post(
	'/sign-up',
	uploadMiddleWare.single('profileImage'),
	async (req, res, next) => {
		try {
			const { email, password, password_check, name, interest } = req.body;
			const profileImage = req.file ? req.file.location : null;

			const isExistUser = await prisma.users.findFirst({
				where: {
					email,
				},
			});

			if (isExistUser) {
				return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
			}
			if (password !== password_check) {
				return res
					.status(409)
					.json({ message: '비밀번호는 비밀번호 확인과 일치해야 합니다.' });
			}
			if (password.length < 6) {
				return res
					.status(409)
					.json({ message: '비밀번호는 6글자 이상이여야 합니다.' });
			}
			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await prisma.users.create({
				data: {
					email,
					password: hashedPassword,
					name,
					interest,
					profileImage: profileImage,
				},
			});
			return res
				.status(201)
				.json({ message: `${name}님 회원가입을 축하합니다.` });
		} catch (err) {
			console.error('업로드 중 에러 발생:', error.message);
			res.status(500).send(err.message);
		}
	},
);

router.post('/sign-in', async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await prisma.users.findUnique({ where: { email } });

		if (!user)
			return res
				.status(401)
				.json({ message: '유효하지 않은 이메일 또는 비밀번호' });

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword)
			return res
				.status(401)
				.json({ message: '유효하지 않은 이메일 또는 비밀번호' });

		const accessToken = createAccessToken(user.id);

		res.cookie('authorization', `Bearer ${accessToken}`);
		return res.status(200).json({ message: '로그인 성공' });
	} catch (err) {
		next(err);
	}
});

/**
 * 로그아웃
 */
router.post('/sign-out', authMiddleWare, async (req, res, next) => {
	try {
		res.clearCookie('authorization', { httpOnly: true, sameSite: 'strict' });
		return res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.', error: error.message });
	}
});

/**
 * 로그인 체크
 */
router.get('/sign-in-chk', authMiddleWare, (req, res) => {
	return res.status(200).json({ message: '로그인 중...' });
});

/**
 * 본인 프로필 조회
 */
router.get('/users', authMiddleWare, async (req, res, next) => {
	const loginId = req.user.id;

	const user = await prisma.users.findFirst({
		where: { id: +loginId },
		select: {
			name: true,
			password: true,
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
 * 타인 프로필 조회
 */
router.get('/users/:userId', authMiddleWare, async (req, res, next) => {
	const { userId } = req.params;
	const { loginId } = req.user.id;

	const user = await prisma.users.findFirst({
		where: { id: +userId },
		select: {
			name: true,
			interest: true,
			profileImage: true,
		},
	});

	const isFollowing = await prisma.follow.findFirst({
		where: {
			followerId: loginId,
			followingId: +userId,
		},
	});

	if (!user) {
		return res.status(404).json({ message: '존재하지 않는 유저입니다.' });
	}
	return res.status(200).json({
		data: user,
		loginMatch: +req.user.id === +userId ? true : false,
		isFollowing: isFollowing !== null,
	});
});

/**
 * 본인 프로필 수정
 */
router.patch(
	'/users',
	authMiddleWare,
	uploadMiddleWare.single('profileImage'),
	async (req, res, next) => {
		const loginId = req.user.id;
		const { name, email, interest, pw: password } = req.body;
		const profileImage = req.file ? req.file.location : null;
		let hashedPassword = '';

		try {
			const existUser = await prisma.users.findUnique({
				where: { id: +loginId },
			});

			if (!existUser) {
				return res.status(404).json({ message: '존재하지 않는 유저입니다.' });
			}

			if (password) {
				hashedPassword = await bcrypt.hash(password, 10);
			}
			console.log(hashedPassword);
			if (profileImage && existUser.profileImage) {
				let existingImage = existUser.profileImage.replace(
					process.env.AWS_LOCATION,
					'',
				);
				await deleteExistingFile('udongimages', existingImage);
			}

			const updatedUser = await prisma.users.update({
				where: { id: +loginId },
				data: {
					...(name && { name }),
					...(password && { password: hashedPassword }),
					...(email && { email }),
					...(interest && { interest }),
					...(profileImage && { profileImage: profileImage }),
				},
			});

			return res.status(200).json({
				message: '회원정보가 정상 수정되었습니다.',
				user: updatedUser,
			});
		} catch (error) {
			return res.status(500).json({
				message: '서버 오류가 발생했습니다.' + error.message,
				error: error.message,
			});
		}
	},
);

export default router;
