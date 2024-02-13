let loginButton = document.getElementById('btn-login');
let logoutButton = document.getElementById('btn-logout');
let signupButton = document.getElementById('btn-signup');
let userinfoButton = document.getElementById('btn-user-info');

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
		.then((response) => {
			if (!response.ok) {
				throw new Error('로그아웃 처리 중 문제가 발생했습니다.');
			}
			return response.json();
		})
		.then((data) => {
			console.log(data.message);
			if (data.message === '성공적으로 로그아웃되었습니다.') {
				location.reload();
			} else {
				alert('로그아웃 실패: ' + data.message);
			}
		})
		.catch((error) => {
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

export function verifyEmail() {
	document
		.getElementById('verify-user')
		.addEventListener('click', function (event) {
			event.preventDefault();
			const emailInput = document.getElementById('user-email');
			const email = emailInput.value;

			fetch('/api/email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email,
				}),
			})
				.then((response) => {
					if (!response.ok) {
						alert('이미 인증이 완료된 계정입니다.');
					} else {
						alert('이메일 발송 완료.');
					}
				})
				.catch((error) => {
					console.error('이메일 발송 오류:', error);
				});
		});
}

export function setupUserInfoForm() {
	document
		.getElementById('userInfoForm')
		.addEventListener('submit', function (event) {
			event.preventDefault();

			const formData = new FormData(this);
			const profileImage =
				document.getElementById('user-profile-image').files[0];
			if (profileImage) {
				formData.append('profileImage', profileImage);
				formData.delete('user-profile-image');
			}

			if (profileImage) {
				for (const x of formData) {
					console.log(x);
				}
			}

			fetch('/api/users', {
				method: 'PATCH',
				credentials: 'include',
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					alert('사용자 정보가 성공적으로 업데이트되었습니다.');
					closeModal();
				})
				.catch((error) => {
					console.error('정보 수정 중 에러 발생:', error);
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
 * 유저 정보 확인
 */
export function myInfoListener(options = {}) {
	document
		.getElementById('btn-user-info')
		.addEventListener('click', function (event) {
			event.preventDefault();

			fetch('/api/users', {
				method: 'GET',
				credentials: 'include',
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('프로필 정보를 불러오는데 실패했습니다.');
					}
					return response.json();
				})
				.then((data) => {
					populateUserInfo(data.data, options);
				})
				.catch((error) => {
					console.error('에러 발생:', error);
				});
		});
}
function populateUserInfo(userInfo, options = {}) {
	const {
		emailSelector = 'user-email',
		nameSelector = 'user-name',
		interestSelector = 'user-interest',
		profileImageSelector = 'profile-image-display',
		profileImagePathPrefix = '/uploads/profileImages/',
		defaultProfileImage = '기본 이미지 경로',
		modalSelector = 'modal-user-info',
	} = options;

	// 이메일, 이름, 관심사 설정
	if (document.getElementById(emailSelector)) {
		document.getElementById(emailSelector).value = userInfo.email || '';
	}
	document.getElementById(nameSelector).value = userInfo.name;
	document.getElementById(interestSelector).value = userInfo.interest || '';

	// 프로필 이미지 설정
	const profileImageDisplay = document.getElementById(profileImageSelector);
	if (profileImageDisplay) {
		if (userInfo.profileImage) {
			const fullPath = `${profileImagePathPrefix}${userInfo.profileImage}`;
			profileImageDisplay.src = fullPath;
		} else {
			profileImageDisplay.src = defaultProfileImage;
		}
	}

	if (modalSelector && document.getElementById(modalSelector)) {
		document.getElementById(modalSelector).style.display = 'block';
	}
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
				// 내정보 조회~
				myInfoListener();
				setupUserInfoForm();
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
	chkLogin();
	updateUIAfterLogin();
}

// 모달 창 닫기 함수
function closeModal() {
	let modals = document.querySelectorAll('.modal');
	modals.forEach(function (modal) {
		modal.style.display = 'none';
	});
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
}

function updateUIBeforeLogin() {
	if (loginButton) loginButton.style.display = 'inline-block';
	if (userinfoButton) userinfoButton.style.display = 'none';
	if (signupButton) signupButton.style.display = 'inline-block';
	if (logoutButton) logoutButton.style.display = 'none';
}

// export function InfoListener() {
// 	document
// 		.getElementById('btn-user-info')
// 		.addEventListener('click', function (event) {
// 			event.preventDefault();

// 			fetch('/api/users', {
// 				method: 'GET',
// 				credentials: 'include',
// 			})
// 				.then((response) => {
// 					if (!response.ok) {
// 						throw new Error('프로필 정보를 불러오는데 실패했습니다.');
// 					}
// 					return response.json();
// 				})
// 				.then((data) => {
// 					console.log('받은 유저 정보:', data.data);
// 					newUserInfo(data.data);
// 				})
// 				.catch((error) => {
// 					console.error('에러 발생:', error); // 에러 처리
// 				});
// 		});
// }
// function newUserInfo(userInfo) {
// 	document.getElementById('user-name-display').value = userInfo.name;
// 	document.getElementById('user-interest-display').value =
// 		userInfo.interest || '';
// 	const profileImagePath = userInfo.profileImage;
// 	const profileImageDisplay = document.getElementById('profile-image-display');
// 	if (profileImagePath) {
// 		const fullPath = `/uploads/profileImages/${profileImagePath}`;
// 		profileImageDisplay.src = fullPath || '기본 이미지 경로';
// 	} else {
// 		profileImageDisplay.parentNode.removeChild(profileImageDisplay);
// 	}
// 	document.getElementById('modal-user-info').style.display = 'block';
// }
