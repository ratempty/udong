import { setupModalListeners } from './modal.js';

// 추천모임 이미지 가져오기

export async function bringCommunity() {
	const currentUrl = window.location.href;
	const urlParams = new URLSearchParams(new URL(currentUrl).search);
	const id = urlParams.get('id');
	if (!id) {
		try {
			const response = await fetch('/api/recommendCom', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			for (let i = 0; i < data.data.length; i++) {
				const nav = document.querySelector('.nav-images');
				const newDiv = document.createElement('div');
				const newImg = document.createElement('img');
				newImg.alt = data.data[i].comName;

				newDiv.appendChild(newImg);
				nav.appendChild(newDiv);
				newImg.addEventListener('click', () => {
					window.location.href = 'community.html?id=' + data.data[i].id;
				});
			}
		} catch (error) {
			console.log('요청 중 오류 발생:', error);
		}
	}
}

// 모임 설명 채우기
async function getCommunity() {
	try {
		const currentUrl = window.location.href;
		const urlParams = new URLSearchParams(new URL(currentUrl).search);
		const id = urlParams.get('id');
		if (id) {
			const response = await fetch(`/api/community/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			const currData = data.data[0];
			const title = currData.comName;
			const interest = currData.interest;
			const explane = currData.communityContent;
			document.querySelector('.title').innerHTML = `모임 이름 : ${title}`;
			document.querySelector('.interesting').innerHTML =
				`모임 관심사 : ${interest}`;
			document.querySelector('.explane').innerHTML = `모임 설명 : ${explane}`;
		}
	} catch (error) {
		console.log('요청 중 오류 발생:', error);
	}
}

getCommunity();

// 모임 게시글
async function getCommunityPosts() {
	try {
		const currentUrl = window.location.href;
		const urlParams = new URLSearchParams(new URL(currentUrl).search);
		const id = urlParams.get('id');

		if (id) {
			const response = await fetch(`/api/community/post/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (!response.ok) {
				const main = document.querySelector('.main');
				main.innerHTML += '<div class="wrapper">글이 없습니다.</div>';
				return;
			}
			const data = await response.json();
			const sortedData =
				data?.data?.sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
				) ?? [];
			const main = document.querySelector('.main');
			if (sortedData.length > 0) {
				for (let i = 0; i < sortedData.length; i++) {
					const title = sortedData[i].title;
					const content = sortedData[i].content;
					const wrapper = `
									<div class="wrapper">
											<p class="postTitle">${title}</p>
											<p class="postContent">${content}</p>
									</div>
							`;
					main.innerHTML += wrapper;
				}
			}
		}
	} catch (error) {
		console.log('요청 중 오류:', error);
	}
}

getCommunityPosts();

// 모임 글작성

async function makePost() {
	try {
		const currentUrl = window.location.href;
		const urlParams = new URLSearchParams(new URL(currentUrl).search);
		const id = urlParams.get('id');
		if (id) {
			document
				.querySelector('#postForm')
				.addEventListener('submit', async function (e) {
					e.preventDefault();

					const formData = new FormData(this);

					for (const x of formData) {
						console.log(x);
					}
					try {
						const response = await fetch(`/api/community/${id}`, {
							method: 'POST',
							body: formData,
						});
					} catch (error) {
						console.log('서버 요청 중 오류:', error);
					}
				});
		}
	} catch (error) {
		console.log('처리 중 오류:', error);
	}
}

makePost();

document.querySelector('#logo').addEventListener('click', () => {
	window.location.href = 'http://udong.store:3000/';
});
