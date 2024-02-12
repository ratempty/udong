import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const { GMAIL_USER, GAMIL_APP_PW } = process.env;

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: GMAIL_USER,
		pass: GAMIL_APP_PW,
	},
});

export default function emailSender(toEmail, Token) {
	const mailOptions = {
		from: GMAIL_USER,
		to: toEmail,
		subject: '우리동네 동아리(우동) 회원가입 인증',
		html:
			'<p>아래의 링크를 클릭해주세요 !</p>' +
			"<a href='http://localhost:3000/users/auth/?email=" +
			toEmail +
			'&token=' +
			Token +
			"'>인증하기</a>",
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
		} else {
			console.log('Email Sent : ', info);
		}
	});
}
