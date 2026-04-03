const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const resetForm = document.getElementById("resetForm");
const authCard = document.getElementById("authCard");
const dashboard = document.getElementById("dashboard");
const signOutButton = document.getElementById("signOutButton");
const showRegisterButton = document.getElementById("showRegister");
const showLoginButton = document.getElementById("showLogin");
const showResetPasswordButton = document.getElementById("showResetPassword");
const backToLoginButton = document.getElementById("backToLogin");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const loginStatus = document.getElementById("loginStatus");
const welcomeTitle = document.getElementById("welcomeTitle");
const balanceValue = document.getElementById("balanceValue");
const detailName = document.getElementById("detailName");
const detailIdNumber = document.getElementById("detailIdNumber");
const detailEmail = document.getElementById("detailEmail");
const detailAccount = document.getElementById("detailAccount");

const registerFields = {
	firstName: document.getElementById("firstName"),
	lastName: document.getElementById("lastName"),
	phoneNumber: document.getElementById("phoneNumber"),
	registerEmail: document.getElementById("registerEmail"),
	registerIdNumber: document.getElementById("registerIdNumber"),
	registerPassword: document.getElementById("registerPassword"),
	confirmPassword: document.getElementById("confirmPassword"),
};

const loginFields = {
	loginIdNumber: document.getElementById("loginIdNumber"),
	loginPassword: document.getElementById("loginPassword"),
};

const resetFields = {
	resetIdNumber: document.getElementById("resetIdNumber"),
	resetPhoneNumber: document.getElementById("resetPhoneNumber"),
	resetOtp: document.getElementById("resetOtp"),
	resetPassword: document.getElementById("resetPassword"),
	resetConfirmPassword: document.getElementById("resetConfirmPassword"),
};

const sendOtpButton = document.getElementById("sendOtpButton");
const otpStatus = document.getElementById("otpStatus");

const demoState = {
	registeredAccount: null,
	signedIn: false,
	profile: null,
	resetOtp: null,
};

function setError(fieldName, message) {
	const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);
	const input = registerFields[fieldName] || loginFields[fieldName] || resetFields[fieldName];

	if (errorNode) {
		errorNode.textContent = message;
	}

	if (input) {
		input.classList.toggle("invalid", Boolean(message));
		input.setAttribute("aria-invalid", Boolean(message));
	}
}

function clearErrors(fieldGroup) {
	Object.keys(fieldGroup).forEach((fieldName) => setError(fieldName, ""));
}

function setLoginStatus(message) {
	loginStatus.textContent = message;
}

function isValidEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
	return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function isValidIdNumber(value) {
	return /^\d{6,16}$/.test(value);
}

function isValidPhoneNumber(value) {
	return /^\+?\d{10,15}$/.test(value);
}

function sanitizeNumeric(value) {
	return value.replace(/\D/g, "");
}

function validateRegisterForm() {
	const firstName = registerFields.firstName.value.trim();
	const lastName = registerFields.lastName.value.trim();
	const phoneNumber = sanitizeNumeric(registerFields.phoneNumber.value.trim());
	const email = registerFields.registerEmail.value.trim();
	const idNumber = sanitizeNumeric(registerFields.registerIdNumber.value.trim());
	const password = registerFields.registerPassword.value;
	const confirmPassword = registerFields.confirmPassword.value;
	let isValid = true;

	clearErrors(registerFields);

	if (firstName.length === 0) {
		setError("firstName", "This field cannot be empty.");
		isValid = false;
	} else if (firstName.length < 2) {
		setError("firstName", "Enter a valid first name.");
		isValid = false;
	}

	if (lastName.length === 0) {
		setError("lastName", "This field cannot be empty.");
		isValid = false;
	} else if (lastName.length < 2) {
		setError("lastName", "Enter a valid last name.");
		isValid = false;
	}

	if (phoneNumber.length === 0) {
		setError("phoneNumber", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidPhoneNumber(phoneNumber)) {
		setError("phoneNumber", "Enter a valid phone number (10 to 15 digits).");
		isValid = false;
	}

	if (email.length === 0) {
		setError("registerEmail", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidEmail(email)) {
		setError("registerEmail", "Enter a valid email address.");
		isValid = false;
	}

	if (idNumber.length === 0) {
		setError("registerIdNumber", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidIdNumber(idNumber)) {
		setError("registerIdNumber", "ID number must be 6 to 16 digits.");
		isValid = false;
	}

	if (password.length === 0) {
		setError("registerPassword", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidPassword(password)) {
		setError("registerPassword", "Password must be at least 8 characters and include letters and numbers.");
		isValid = false;
	}

	if (confirmPassword.length === 0) {
		setError("confirmPassword", "This field cannot be empty.");
		isValid = false;
	} else if (confirmPassword !== password) {
		setError("confirmPassword", "Passwords do not match.");
		isValid = false;
	}

	return isValid;
}

function validateLoginForm() {
	const idNumber = sanitizeNumeric(loginFields.loginIdNumber.value.trim());
	const password = loginFields.loginPassword.value;
	let isValid = true;

	clearErrors(loginFields);
	setLoginStatus("");

	if (idNumber.length === 0) {
		setError("loginIdNumber", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidIdNumber(idNumber)) {
		setError("loginIdNumber", "Enter a valid ID number.");
		isValid = false;
	}

	if (password.length === 0) {
		setError("loginPassword", "This field cannot be empty.");
		isValid = false;
	}

	if (!demoState.registeredAccount) {
		setError("loginIdNumber", "Account does not exist.");
		isValid = false;
	}

	if (
		demoState.registeredAccount &&
		(idNumber !== demoState.registeredAccount.idNumber || password !== demoState.registeredAccount.password)
	) {
		setError("loginPassword", "Invalid ID number or password.");
		isValid = false;
	}

	return isValid;
}

function validateResetForm() {
	const idNumber = sanitizeNumeric(resetFields.resetIdNumber.value.trim());
	const phoneNumber = sanitizeNumeric(resetFields.resetPhoneNumber.value.trim());
	const otp = sanitizeNumeric(resetFields.resetOtp.value.trim());
	const password = resetFields.resetPassword.value;
	const confirmPassword = resetFields.resetConfirmPassword.value;
	let isValid = true;

	clearErrors(resetFields);

	if (idNumber.length === 0) {
		setError("resetIdNumber", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidIdNumber(idNumber)) {
		setError("resetIdNumber", "Enter a valid ID number.");
		isValid = false;
	}

	if (phoneNumber.length === 0) {
		setError("resetPhoneNumber", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidPhoneNumber(phoneNumber)) {
		setError("resetPhoneNumber", "Enter a valid phone number.");
		isValid = false;
	}

	if (otp.length === 0) {
		setError("resetOtp", "This field cannot be empty.");
		isValid = false;
	} else if (!demoState.resetOtp) {
		setError("resetOtp", "Send and enter the OTP first.");
		isValid = false;
	} else if (otp !== demoState.resetOtp) {
		setError("resetOtp", "Invalid OTP.");
		isValid = false;
	}

	if (!demoState.registeredAccount) {
		setError("resetIdNumber", "Account does not exist.");
		isValid = false;
	}

	if (
		demoState.registeredAccount &&
		(idNumber !== demoState.registeredAccount.idNumber || phoneNumber !== demoState.registeredAccount.phoneNumber)
	) {
		setError("resetPhoneNumber", "ID number and phone number do not match our records.");
		isValid = false;
	}

	if (password.length === 0) {
		setError("resetPassword", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidPassword(password)) {
		setError("resetPassword", "Password must be at least 8 characters and include letters and numbers.");
		isValid = false;
	}

	if (confirmPassword.length === 0) {
		setError("resetConfirmPassword", "This field cannot be empty.");
		isValid = false;
	} else if (confirmPassword !== password) {
		setError("resetConfirmPassword", "Passwords do not match.");
		isValid = false;
	}

	return isValid;
}

function showDashboard(profile) {
	demoState.signedIn = true;
	demoState.profile = profile;

	welcomeTitle.textContent = `Account overview for ${profile.name}`;
	balanceValue.textContent = profile.balance;
	detailName.textContent = profile.name;
	detailIdNumber.textContent = profile.idNumber;
	detailEmail.textContent = profile.email;
	detailAccount.textContent = profile.phoneNumber;

	authCard.classList.add("hidden");
	dashboard.classList.remove("hidden");
}

function updateAuthHeader(mode) {
	if (mode === "register") {
		authTitle.textContent = "Create Your Account";
		authSubtitle.textContent = "Join today and start managing your finances securely.";
		authSubtitle.classList.remove("hidden");
		return;
	}

	if (mode === "login") {
		authTitle.textContent = "Welcome Back";
		authSubtitle.textContent = "";
		authSubtitle.classList.add("hidden");
		return;
	}

	authTitle.textContent = "Reset Password";
	authSubtitle.textContent = "Verify your ID number and phone number to continue.";
	authSubtitle.classList.remove("hidden");
}

function showRegisterView() {
	registerForm.classList.remove("hidden");
	loginForm.classList.add("hidden");
	resetForm.classList.add("hidden");
	setLoginStatus("");
	showRegisterButton.classList.add("is-active");
	showLoginButton.classList.remove("is-active");
	showRegisterButton.setAttribute("aria-selected", "true");
	showLoginButton.setAttribute("aria-selected", "false");
	updateAuthHeader("register");
}

function showLoginView() {
	registerForm.classList.add("hidden");
	loginForm.classList.remove("hidden");
	resetForm.classList.add("hidden");
	setLoginStatus("");
	showRegisterButton.classList.remove("is-active");
	showLoginButton.classList.add("is-active");
	showRegisterButton.setAttribute("aria-selected", "false");
	showLoginButton.setAttribute("aria-selected", "true");
	updateAuthHeader("login");
}

function showResetView() {
	registerForm.classList.add("hidden");
	loginForm.classList.add("hidden");
	resetForm.classList.remove("hidden");
	setLoginStatus("");
	showRegisterButton.classList.remove("is-active");
	showLoginButton.classList.add("is-active");
	showRegisterButton.setAttribute("aria-selected", "false");
	showLoginButton.setAttribute("aria-selected", "true");
	updateAuthHeader("reset");
}

function generateOtp() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

function sendOtp() {
	const idNumber = sanitizeNumeric(resetFields.resetIdNumber.value.trim());
	const phoneNumber = sanitizeNumeric(resetFields.resetPhoneNumber.value.trim());

	clearErrors(resetFields);
	demoState.resetOtp = null;

	if (!demoState.registeredAccount) {
		setError("resetIdNumber", "Account does not exist.");
		return;
	}

	if (!isValidIdNumber(idNumber)) {
		setError("resetIdNumber", idNumber.length === 0 ? "This field cannot be empty." : "Enter a valid ID number first.");
		return;
	}

	if (!isValidPhoneNumber(phoneNumber)) {
		setError("resetPhoneNumber", phoneNumber.length === 0 ? "This field cannot be empty." : "Enter a valid phone number first.");
		return;
	}

	if (idNumber !== demoState.registeredAccount.idNumber || phoneNumber !== demoState.registeredAccount.phoneNumber) {
		setError("resetPhoneNumber", "ID number and phone number do not match our records.");
		return;
	}

	demoState.resetOtp = generateOtp();
	otpStatus.textContent = `OTP sent: ${demoState.resetOtp}`;
}

function signOut() {
	demoState.signedIn = false;
	demoState.profile = null;
	demoState.resetOtp = null;
	loginForm.reset();
	resetForm.reset();
	clearErrors(loginFields);
	clearErrors(resetFields);
	setLoginStatus("");
	otpStatus.textContent = "OTP not sent yet.";
	dashboard.classList.add("hidden");
	authCard.classList.remove("hidden");
	showLoginView();
}

registerForm.addEventListener("submit", (event) => {
	event.preventDefault();

	if (!validateRegisterForm()) {
		return;
	}

	demoState.registeredAccount = {
		firstName: registerFields.firstName.value.trim(),
		lastName: registerFields.lastName.value.trim(),
		phoneNumber: sanitizeNumeric(registerFields.phoneNumber.value.trim()),
		email: registerFields.registerEmail.value.trim(),
		idNumber: sanitizeNumeric(registerFields.registerIdNumber.value.trim()),
		password: registerFields.registerPassword.value,
	};

	loginForm.reset();
	clearErrors(loginFields);
	setLoginStatus("");
	showLoginView();
});

resetForm.addEventListener("submit", (event) => {
	event.preventDefault();

	if (!validateResetForm()) {
		return;
	}

	demoState.registeredAccount.password = resetFields.resetPassword.value;
	demoState.resetOtp = null;
	resetForm.reset();
	clearErrors(resetFields);
	otpStatus.textContent = "OTP not sent yet.";
	showLoginView();
	loginFields.loginIdNumber.value = demoState.registeredAccount.idNumber;
	setLoginStatus("Password updated. Please log in with your new password.");
});

loginForm.addEventListener("submit", (event) => {
	event.preventDefault();

	if (!validateLoginForm()) {
		return;
	}

	const profile = {
		name: `${demoState.registeredAccount.firstName} ${demoState.registeredAccount.lastName}`,
		email: demoState.registeredAccount.email,
		idNumber: demoState.registeredAccount.idNumber,
		phoneNumber: demoState.registeredAccount.phoneNumber,
		balance: "$18,745.90",
	};

	showDashboard(profile);
});

Object.entries(registerFields).forEach(([fieldName, input]) => {
	input.addEventListener("input", () => setError(fieldName, ""));
});

Object.entries(loginFields).forEach(([fieldName, input]) => {
	input.addEventListener("input", () => {
		setError(fieldName, "");
		setLoginStatus("");
	});
});

Object.entries(resetFields).forEach(([fieldName, input]) => {
	input.addEventListener("input", () => setError(fieldName, ""));
});

showRegisterButton.addEventListener("click", showRegisterView);
showLoginButton.addEventListener("click", showLoginView);
showResetPasswordButton.addEventListener("click", showResetView);
backToLoginButton.addEventListener("click", showLoginView);
sendOtpButton.addEventListener("click", sendOtp);

signOutButton.addEventListener("click", signOut);
