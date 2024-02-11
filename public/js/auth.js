export function login(email, password) {
	fetch('/api/sign-in', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email: email,
			password: password,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.message === '로그인 성공') {
				console.log('로그인 성공:', data);
				loginSuccess();
			} else {
				alert('로그인 실패: ' + data.message);
			}
		})
		.catch((error) => {
			console.error('로그인 요청 중 오류 발생:', error);
		});
}

export function setupSignupForm() {
	document
		.getElementById('submit-signup')
		.addEventListener('click', function (event) {
			event.preventDefault();

			const formData = new FormData();
			formData.append('email', document.getElementById('signup-email').value);
			formData.append(
				'password',
				document.getElementById('signup-password').value,
			);
			formData.append(
				'password_check',
				document.getElementById('signup-password-check').value,
			);
			formData.append('name', document.getElementById('signup-name').value);
			formData.append(
				'interest',
				document.getElementById('signup-interest').value,
			);

			const profileImage = document.getElementById('signup-profile-image')
				.files[0];
			if (profileImage) {
				formData.append('profileImage', profileImage);
			}

			fetch('/api/sign-up', {
				method: 'POST',
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.message) {
						alert(data.message);
					}
					location.reload()
				})
				.catch((error) => {
					console.error('회원가입 요청 중 오류 발생:', error);
					location.reload()
				});
		});
}
/**
 * SETUP
 */
export function setupLoginListener() {
	document
		.getElementById('submit-login')
		.addEventListener('click', function (event) {
			event.preventDefault();

			// 로그인 폼 데이터를 가져옵니다.
			var email = document.getElementById('username').value;
			var password = document.getElementById('loginPassword').value;

			// login 함수를 호출하여 로그인 처리
			login(email, password);
		});
}

// 로그인 성공 후 모달 닫기 및 UI 업데이트
function loginSuccess() {
	closeModal(); // 모달 창 닫기 함수 호출
	updateUIAfterLogin(); // UI 업데이트 함수 호출
}

// 모달 창 닫기 함수
function closeModal() {
	let modal = document.querySelector('.modal');
	if (modal) {
		modal.style.display = 'none';
	}
}

// 로그인 후 UI 업데이트 함수
function updateUIAfterLogin() {
	let loginButton = document.getElementById('btn-login');
	let logoutButton = document.getElementById('btn-logout');
	let userInfo = document.getElementById('user-info');

	// 로그인 버튼을 숨기고 로그아웃 버튼을 표시
	if (loginButton) loginButton.style.display = 'none';
	if (logoutButton) logoutButton.style.display = 'block';

	// 사용자 정보 업데이트 (예시)
	if (userInfo) userInfo.innerText = '환영합니다, [사용자 이름]!';
}
