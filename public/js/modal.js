// 모달 열기 함수
export function openModal(modalSelector) {
	let modal = document.querySelector(modalSelector);
	modal.style.display = 'block';
}

export function closeModal(modal) {
	modal.style.display = 'none';

	// 모달 내의 폼을 찾아서 리셋
	let form = modal.querySelector('form');
	if (form) {
		form.reset();
	}
}
export function setupModalListeners() {
	// 모달 열기 이벤트 리스너
	document.getElementById('btn-login').addEventListener('click', function () {
		openModal(this.getAttribute('data-modal-target'));
	});
	document.getElementById('btn-signup').addEventListener('click', function () {
		openModal(this.getAttribute('data-modal-target'));
	});

	// 닫기 버튼에 이벤트 리스너 추가
	let closeButtons = document.querySelectorAll('.close');
	closeButtons.forEach(function (button) {
		button.addEventListener('click', function () {
			closeModal(this.closest('.modal'));
		});
	});

	// 모달 외부 클릭 시 닫기
	window.addEventListener('click', function (event) {
		if (event.target.classList.contains('modal')) {
			closeModal(event.target);
		}
	});
}
