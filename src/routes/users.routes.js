import express from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { prisma } from '../utils/index.js';
import { createAccessToken } from '../utils/token.js';
import authMiddleWare from '../middleware/auth.middleware.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sendMail from '../utils/nodemailer.js';

const router = express.Router();
dotenv.config();

router.post('/mail', async (req, res, next) => {
	const { email } = req.body;
	const min = 111111;
	const max = 999999;
	const number = Math.floor(Math.random() * (max - min + 1)) + min;

	await sendMail(email, number);
	try {
		res.json({
			ok: true,
			msg: '이메일이 성공적으로 전송되었습니다.',
			authNum: number,
		});
	} catch (error) {
		console.error('이메일 전송에 실패했습니다:', error);
		res.status(500).json({ ok: false, msg: '이메일 전송에 실패했습니다.' });
	}
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../../public/uploads/profileImages'));
	},
	filename: (req, file, cb) => {
		cb(
			null,
			`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
		);
	},
});

const upload = multer({ storage: storage });

router.post(
	'/sign-up',
	upload.single('profileImage'),
	async (req, res, next) => {
		try {
			const { email, password, password_check, name, interest } = req.body;
			const profileImage = req.file ? req.file.filename : null;

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
			next(err);
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

		// export function createAccessToken(id) {
		//   return jwt.sign({ id }, process.env.CUSTOM_SECRET_KEY, { expiresIn: "15m" });
		// }

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
router.get('/users/:userId', async (req, res, next) => {
	//const { userId } = req.user;
	const { userId } = req.params;

	const user = await prisma.users.findFirst({
		where: { id: +userId },
		select: {
			name: true,
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
router.patch('/users', authMiddleWare, upload.single('profileImage'), async (req, res, next) => {

	const loginId = req.user.id;
	const { name, email, interest } = req.body;
	const profileImage = req.file ? req.file.filename : null;
	
	try {
		const existUser = await prisma.users.findUnique({
			where: { id: +loginId },
		});

		if (!existUser) {
			return res.status(404).json({ message: '존재하지 않는 유저입니다.' });
		}

		if(profileImage && existUser.profileImage) {
			fs.unlink(path.join(__dirname, '../../public/uploads/profileImages', existUser.profileImage), (err) => {
				if (err) console.log("기존 프로필 사진 삭제 불가:", err);
				else console.log("기존 프로필 사진 성공적으로 삭제");
			});
		}

		const updatedUser = await prisma.users.update({
			where: { id: +loginId },
			data: {
				...(name && { name }),
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
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.'+error.message, error: error.message });
	}
});

export default router;
