export function followUser(userId) {
	fetch(`/api/follow/${userId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include', // 쿠키를 포함시키려면 이 옵션을 사용
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('팔로우 요청 실패');
			}
			return response.json();
		})
		.then((data) => {
			console.log('팔로우 성공:', data);
			// 팔로우 성공 후 UI 변경
			document.getElementById('btn-follow').classList.add('hidden');
			document.getElementById('btn-unfollow').classList.remove('hidden');
		})
		.catch((error) => {
			console.error('팔로우 요청 중 에러 발생:', error);
		});
}

export function unfollowUser(userId) {
	fetch(`/api/unfollow/${userId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			// 필요한 경우 인증 토큰을 추가
			// 'Authorization': `Bearer ${yourAuthToken}`
		},
		credentials: 'include', // 쿠키를 포함시키려면 이 옵션을 사용
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('언팔로우 요청 실패');
			}
			return response.json();
		})
		.then((data) => {
			console.log('언팔로우 성공:', data);
			// 언팔로우 성공 후 UI 변경
			document.getElementById('btn-unfollow').classList.add('hidden');
			document.getElementById('btn-follow').classList.remove('hidden');
		})
		.catch((error) => {
			console.error('언팔로우 요청 중 에러 발생:', error);
		});
}

/**
 * @param {*} userId 
 */
export function loadFollowers(userId) {
    fetch(`/api/followers/${userId}`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        const followersList = document.getElementById('followers-list');
        followersList.innerHTML = ''; 
        data.forEach(follower => {
            const listItem = document.createElement('li');
            listItem.textContent = `${follower.name} - ${follower.interest}`;
            followersList.appendChild(listItem);
        });
    })
    .catch(error => console.error('팔로워 목록 조회 실패:', error));
}

/**
 * @param {*} userId 
 */
export function loadFollowings(userId) {
    fetch(`/api/following/${userId}`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        const followingList = document.getElementById('following-list');
        followingList.innerHTML = ''; 
        data.forEach(following => {
            const listItem = document.createElement('li');
            listItem.textContent = `${following.name} - ${following.interest}`;
            followingList.appendChild(listItem);
        });
    })
    .catch(error => console.error('팔로잉 목록 조회 실패:', error));
}