import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendMail = (email, number) => {
	const smtpTransport = nodemailer.createTransport({
		service: 'naver',
		host: 'smtp.naver.com',
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.NAVER_USER,
			pass: process.env.NAVER_PASS,
		},
	});

	const mailOptions = {
		from: process.env.NAVER_USER,
		to: email,
		subject: 'Udong 인증 관련 이메일 입니다.. ',
		html: '다음 숫자 6자리를 입력해 주세요' + number,
	};

	smtpTransport.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(info);
			console.log('에러 ' + error);
		} else {
			console.log('전송 완료 ' + info.response);
		}
	});
};

export default sendMail;
