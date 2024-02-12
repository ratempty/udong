let loginButton = document.getElementById('btn-login');
let logoutButton = document.getElementById('btn-logout');
let signupButton = document.getElementById('btn-signup');
let userinfoButton = document.getElementById('btn-user-info');
let userInfo = document.getElementById('user-info');

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
				console.log('로그인 성공:', JSON.stringify(data));
				loginSuccess();
			} else {
				alert('로그인 실패: ' + data.message);
			}
		})
		.catch((error) => {
			console.error('로그인 요청 중 오류 발생:', error);
		});
}


export function logout() {
	fetch('/api/sign-out', {
        method: 'POST', 
        credentials: 'include', 
    })
	.then(response => {
        if (!response.ok) {
            throw new Error('로그아웃 처리 중 문제가 발생했습니다.');
        }
        return response.json(); 
    })
    .then(data => {
        console.log(data.message); 
		if (data.message === '성공적으로 로그아웃되었습니다.') { 
            updateUIBeforeLogin(); 
        } else {
            alert('로그아웃 실패: ' + data.message);
        }
    })
    .catch(error => {
        console.error('로그아웃 요청 중 오류 발생:', error);
    });
}

/**
 * SETUP
 */
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
					location.reload();
				})
				.catch((error) => {
					console.error('회원가입 요청 중 오류 발생:', error);
					location.reload();
				});
		});
}

export function fetchUserInfo() {
	fetch('/api/users')
		.then((response) => {
			if (!response.ok) {
				throw new Error('네트워크 응답이 올바르지 않습니다.');
			}
			return response.json();
		})
		.then((data) => {
			console.log('사용자 정보:', data);
		})
		.catch((error) => console.error('사용자 정보 조회 중 오류 발생:', error));
}

export function setupUserInfoUpdateForm() {
	const userId = localStorage.getItem('id');
	const accessToken = localStorage.getItem('accessToken');

	document
		.getElementById('userInfoForm')
		.addEventListener('submit', function (e) {
			e.preventDefault(); 
			
			const userInfo = {
				name: document.getElementById('user-name').value,
				email: document.getElementById('user-email').value,
				interest: document.getElementById('user-interest').value,
			};

			fetch(`/api/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`, // Bearer 토큰 포함
				},
				body: JSON.stringify(userInfo),
			})
				.then((response) => response.json())
				.then((data) => {
					// 성공적으로 업데이트되었다는 메시지 표시 또는 모달 닫기
					alert('사용자 정보가 성공적으로 업데이트되었습니다.');
					document.getElementById('modal-user-info').style.display = 'none';
				})
				.catch((error) => {
					console.error('사용자 정보 업데이트 중 오류 발생:', error);
				});
		});
}

export function setupLoginListener() {
	document
		.getElementById('submit-login')
		.addEventListener('click', function (event) {
			event.preventDefault();

			var email = document.getElementById('username').value;
			var password = document.getElementById('loginPassword').value;

			login(email, password);
		});
}
export function setupLogoutListener() {
	document
		.getElementById('btn-logout')
		.addEventListener('click', function (event) {
			event.preventDefault();
			logout();
		});
}


/**
 * 유저 로그인 확인
 */
export function chkLogin() {
	fetch('/api/sign-in-chk')
		.then((response) => {
			if (response.status === 401) {
                console.log('로그인이 필요합니다.');
				updateUIBeforeLogin();
				return '로그인하지 않은 유저';
			} else if (!response.ok) {
				throw new Error('서버에서 문제가 발생했습니다.');
			} else {
				updateUIAfterLogin();
			}
			return response.json(); 
		})
		.then((data) => {
			console.log('사용자 정보:', data); 
		})
		.catch((error) => {
			console.log(error.message); 
		});
}

// 로그인 성공 후 모달 닫기 및 UI 업데이트
function loginSuccess() {
	closeModal();
	updateUIAfterLogin();
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

	if (loginButton) loginButton.style.display = 'none';
	if (logoutButton) logoutButton.style.display = 'inline-block';
	if (userinfoButton) userinfoButton.style.display = 'inline-block';
	if (signupButton) signupButton.style.display = 'none';

	if (userInfo) userInfo.innerText = '환영합니다, [사용자 이름]!';
}

function updateUIBeforeLogin() {
	if (loginButton) loginButton.style.display = 'inline-block';
	if (userinfoButton) userinfoButton.style.display = 'none';
	if (signupButton) signupButton.style.display = 'inline-block';
	if (logoutButton) logoutButton.style.display = 'none';
}
