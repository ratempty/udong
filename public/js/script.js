import {
	myInfoListener,
	setupLoginListener,
	setupSignupForm,
	setupLogoutListener,
	chkLogin,
	verifyEmail,
} from './auth.js';
import { setupModalListeners } from './modal.js';

document.addEventListener('DOMContentLoaded', function () {
	setupModalListeners();
	setupLoginListener();
	setupLogoutListener();
	setupSignupForm();
	chkLogin();
	verifyEmail();
});
