import { followUser, unfollowUser, loadFollowers, loadFollowings } from './follow.js';

document.addEventListener('DOMContentLoaded', function () {
	const queryParams = new URLSearchParams(window.location.search);
	const userId = queryParams.get('userId');

	if (userId) {
		userInfoSearch(userId);
		setupFollowUnfollowButtons();
		setupToggleListeners();
	} else {
		console.error('유저 아이디가 URL에 없습니다.');
		location.href = '../';
	}
});

function userInfoSearch(userId) {
	fetch('/api/users/' + userId, {
		method: 'GET',
		credentials: 'include',
	})
		.then((response) => {
			if (!response.ok) {
				if (response.status == '401') {
					throw new Error('로그인 후 확인할 수 있습니다.');
				} else {
					throw new Error('프로필 정보를 불러오는데 실패했습니다.');
				}
			}
			return response.json();
		})
		.then((data) => {
			populateUserInfo(data.data, data.loginMatch, data.isFollowing);
		})
		.catch((error) => {
			console.error('에러 발생:', error);
			alert(error.message);
			location.href = '../';
		});
}

function populateUserInfo(userInfo, loginMatch, isFollowing, options = {}) {
	const userNameDisplay = document.getElementById('user-name-display');
	if (userNameDisplay) userNameDisplay.textContent = userInfo.name;

	// 사용자 관심사 설정
	const userInterestDisplay = document.getElementById('user-interest-display');
	if (userInterestDisplay)
		userInterestDisplay.textContent = `관심사: ${userInfo.interest || '없음'}`;

	// 프로필 이미지 설정
	const profileImageDisplay = document.getElementById('user-image-display');
	if (profileImageDisplay) {
		profileImageDisplay.src = userInfo.profileImage
			? `/uploads/profileImages/${userInfo.profileImage}`
			: '/path/to/default/image.jpg';
		profileImageDisplay.alt = `${userInfo.name}의 프로필 이미지`;
	}

	const btnFollow = document.getElementById('btn-follow');
	const btnUnfollow = document.getElementById('btn-unfollow');

	if (isFollowing) {
		btnFollow.classList.add('hidden');
		btnUnfollow.classList.remove('hidden');
	} else {
		btnFollow.classList.remove('hidden');
		btnUnfollow.classList.add('hidden');
	}

	if (loginMatch == true) {
		btnFollow.style.display = 'none';
		btnUnfollow.style.display = 'none';
	}
}

function setupFollowUnfollowButtons() {
	const btnFollow = document.getElementById('btn-follow');
	const btnUnfollow = document.getElementById('btn-unfollow');
	const userId = new URLSearchParams(window.location.search).get('userId');

	btnFollow.addEventListener('click', () => followUser(userId));
	btnUnfollow.addEventListener('click', () => unfollowUser(userId));
}
function setupToggleListeners() {
	const urlParams = new URLSearchParams(window.location.search);
	const userId = urlParams.get('userId');


    document.getElementById('toggle-followers-list').addEventListener('click', function() {
		const followersList = document.getElementById('followers-list');
		followersList.classList.toggle('hidden');
		if (!followersList.classList.contains('hidden')) {
			loadFollowers(userId); 
		}
	});
	
	document.getElementById('toggle-following-list').addEventListener('click', function() {
		const followingList = document.getElementById('following-list');
		followingList.classList.toggle('hidden');
		if (!followingList.classList.contains('hidden')) {
			loadFollowings(userId); 
		}
	});	
}

