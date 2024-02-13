import {
	myInfoListener,
	setupLoginListener,
	setupSignupForm,
	setupLogoutListener,
	chkLogin,
} from './auth.js';
import { bringCommunity } from './community.js';
import { setupModalListeners } from './modal.js';

document.addEventListener('DOMContentLoaded', function () {
	setupModalListeners();
	setupLoginListener();
	setupLogoutListener();
	setupSignupForm();
	chkLogin();
	bringCommunity();
});
