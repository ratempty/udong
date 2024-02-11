// 모달 열기 함수
function openModal() {
	let modalSelector = this.getAttribute('data-modal-target');
	let modal = document.querySelector(modalSelector);
	modal.style.display = 'block';
}

// 모달 닫기 함수
function closeModal() {
	let modal = this.closest('.modal');
	modal.style.display = 'none';

    // 모달 내의 폼을 찾아서 리셋
    let form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

document.addEventListener('DOMContentLoaded', function () {
	// 모달 열기 이벤트 리스너
	document.getElementById('btn-login').addEventListener('click', openModal);
	document.getElementById('btn-signup').addEventListener('click', openModal);

	// 닫기 버튼에 이벤트 리스너 추가
	let closeButtons = document.querySelectorAll('.close');
	closeButtons.forEach(function (button) {
		button.addEventListener('click', closeModal);
	});

	// 모달 외부 클릭 시 닫기
	window.addEventListener('click', function (event) {
		if (event.target.classList.contains('modal')) {
			event.target.style.display = 'none';
		}
        // 모달 내의 폼을 찾아서 리셋
        let form = event.target.querySelector('form');
        if (form) {
            form.reset();
        }
	});
});
