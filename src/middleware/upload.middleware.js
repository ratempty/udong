import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

dotenv.config();

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_LOCATION } = process.env;

const s3Client = new S3Client({
	region: 'ap-northeast-2',
	credentials: {
		accessKeyId: AWS_ACCESS_KEY,
		secretAccessKey: AWS_SECRET_KEY,
	},
});

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp'];

export async function deleteExistingFile(bucket, key) {
	const deleteParams = {
		Bucket: bucket,
		Key: key,
	};
	try {
		console.log('키 : ' + key);
		await s3Client.send(new DeleteObjectCommand(deleteParams));
		console.log('기존 프로필 사진 삭제');
	} catch (err) {
		console.log('기존 프로필 사진 삭제 에러 :', err);
	}
}

const imageUploader = multer({
	storage: multerS3({
		s3: s3Client,
		bucket: 'udongimages',
		key: (req, file, callback) => {
			const imageType = req.body.imageType;
			const uploadDirectory =
				imageType === 'profile' ? 'profileImages' : 'communityImages';
			const extension = path.extname(file.originalname);
			if (!allowedExtensions.includes(extension)) {
				return callback(new Error('잘못된 extension'));
			}

			const newFileName = `udong_${Date.now()}${extension}`;
			callback(null, `${uploadDirectory}/${newFileName}`);
		},
		acl: 'public-read-write',
	}),
});

export default imageUploader;
