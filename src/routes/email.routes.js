import express from 'express';
import { prisma } from '../utils/index.js';

const router = express.Router();

router.get('/auth', async (req, res) => {
	const { email, token } = req.query;
	try {
		const decodedToken = jwt.verify(token, process.env.CUSTOM_SECRET_KEY);
		if (decodedToken.email === email) {
			// await prisma.users.update({
			//     where: {
			//         email: email
			//     },
			//     data: {
			//         isVerified: true
			//     }
			// });

			res.send('Email 인증 처리 완료.');
		} else {
			res.status(400).send('부적절한 email 또는 token.');
		}
	} catch (error) {
		console.error('토큰 인증 오류:', error);
		res.status(500).send('토큰 인증 오류.');
	}
});

export default router;
