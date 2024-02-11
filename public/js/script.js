import { setupLoginListener, setupSignupForm } from './auth.js';
import { setupModalListeners } from './modal.js';

document.addEventListener('DOMContentLoaded', function () {
	setupModalListeners();
	setupLoginListener();
	setupSignupForm();
});
