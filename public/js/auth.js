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
				updateUIBeforeLogin();
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
					fetchUserInfo();
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
export function myInfoListener() {
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
					console.log('받은 유저 정보:', data.data);
					populateUserInfo(data.data);
				})
				.catch((error) => {
					console.error('에러 발생:', error); // 에러 처리
				});
		});
}
function populateUserInfo(userInfo) {
	document.getElementById('user-email').value = userInfo.email;
	document.getElementById('user-name').value = userInfo.name;
	document.getElementById('user-interest').value = userInfo.interest || '';
	const profileImagePath = userInfo.profileImage;
	const profileImageDisplay = document.getElementById('profile-image-display');
	if (profileImagePath) {
		const fullPath = `/uploads/profileImages/${profileImagePath}`;
		profileImageDisplay.src = fullPath || '기본 이미지 경로';
	} else {
		profileImageDisplay.parentNode.removeChild(profileImageDisplay);
	}
	document.getElementById('modal-user-info').style.display = 'block';
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
	window.location.reload();
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
