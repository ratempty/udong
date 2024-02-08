import express from 'express';
import { prisma } from '../utils/index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * 모임 개설
 */
router.post('/community', async (req, res, next) => {
	const { comName, interest } = req.body;
	//const loginId = req.user.userId;
    const loginId  = 1;

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
                managerId : loginId,
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
router.delete('/community/:communityId', async (req, res, next) => {
	const { communityId } = req.params;
	//const loginId = req.user.userId;
    const loginId  = 1;

	if (!communityId) {
		return res
			.status(400)
			.json({ message: '잘못된 접근입니다. (삭제할 모임 확인 불가)' });
	}

	if (!loginId) {
		return res
			.status(401)
			.json({ message: '로그인하세요.' });
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

		if (loginId != existingCommunity.managerId) {
			return res.status(403).json({ message: '모임장만 삭제 가능합니다.' });
		}

		await prisma.community.delete({
            where: { id: +communityId  },
		});

		return res.status(200).json({ message: '성공적으로 모임을 삭제했습니다.' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: '서버 오류가 발생했습니다.', error: error.message });
	}
});

export default router;
