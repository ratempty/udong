export async function fetchData() {
	try {
		const response = await fetch('/api/postlike', {
			method: 'get',
			credentials: 'omit',
		});
		const data = await response.json();

		displayData(data.data);
	} catch (error) {
		console.error('게시글 데이터를 가져오지 못했습니다:', error);
	}
}

// HTML에 데이터를 뿌려주는 함수
export function displayData(posts) {
	const postContainer = document.getElementById('content-ground');

	// 받아온 데이터를 반복해서 처리
	if (postContainer && posts) {
		posts.forEach((post) => {
			const postElement = document.createElement('div');
			if (post._count.Likes !== 0) {
				postElement.innerHTML = `
				<h2>${post.title}</h2>
				<p>${post.content}</p>
				<p>좋아요 수: ${post._count.Likes}</p>
				<p>작성일자: ${post.createdAt}</p>
			`;

				postContainer.appendChild(postElement);
			}
		});
	}
}
