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
