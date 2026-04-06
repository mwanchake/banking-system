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
const detailPhone = document.getElementById("detailPhone");
const detailAccountNumber = document.getElementById("detailAccountNumber");
const depositForm = document.getElementById("depositForm");
const withdrawForm = document.getElementById("withdrawForm");
const sendMoneyForm = document.getElementById("sendMoneyForm");
const transactionList = document.getElementById("transactionList");
const showMoreTransactionsButton = document.getElementById("showMoreTransactions");
const demoWarningCard = document.getElementById("demoWarningCard");
const dismissDemoWarningButton = document.getElementById("dismissDemoWarning");
const demoTipCard = document.getElementById("demoTipCard");
const dismissDemoTipButton = document.getElementById("dismissDemoTip");
const actionStatus = document.getElementById("actionStatus");

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

const actionFields = {
	depositAmount: document.getElementById("depositAmount"),
	withdrawAmount: document.getElementById("withdrawAmount"),
	sendAccount: document.getElementById("sendAccount"),
	confirmSendAccount: document.getElementById("confirmSendAccount"),
	sendAmount: document.getElementById("sendAmount"),
};

const sendOtpButton = document.getElementById("sendOtpButton");
const otpStatus = document.getElementById("otpStatus");
const quickDepositButtons = document.querySelectorAll("[data-deposit-figure]");
const quickWithdrawButtons = document.querySelectorAll("[data-withdraw-figure]");
const transactionConfirmation = document.getElementById("transactionConfirmation");
const confirmationCloseBtn = document.getElementById("confirmationCloseBtn");
const confirmationTitle = document.getElementById("confirmationTitle");
const confirmationMessage = document.getElementById("confirmationMessage");
const confirmationDetails = document.getElementById("confirmationDetails");
const errorConfirmation = document.getElementById("errorConfirmation");
const errorCloseBtn = document.getElementById("errorCloseBtn");
const errorMessage = document.getElementById("errorMessage");
const loadingBanner = document.getElementById("loadingBanner");
const loadingText = document.getElementById("loadingText");
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const ACCESS_TOKEN_KEY = "bank_access_token";
const REFRESH_TOKEN_KEY = "bank_refresh_token";
const TRANSACTION_PAGE_SIZE = 5;

const authState = {
	accessToken: null,
	refreshToken: null,
};

const demoState = {
	registeredAccount: null,
	signedIn: false,
	profile: null,
	resetOtp: null,
	balance: 0,
	accountNumber: null,
	transactionHistoryItems: [],
	visibleTransactionCount: TRANSACTION_PAGE_SIZE,
	demoWarningShown: false,
	demoTipShown: false,
};

function saveTokens(accessToken, refreshToken) {
	authState.accessToken = accessToken || null;
	authState.refreshToken = refreshToken || null;

	if (authState.accessToken) {
		localStorage.setItem(ACCESS_TOKEN_KEY, authState.accessToken);
	}

	if (authState.refreshToken) {
		localStorage.setItem(REFRESH_TOKEN_KEY, authState.refreshToken);
	}
}

function loadTokens() {
	authState.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
	authState.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
}

function clearTokens() {
	authState.accessToken = null;
	authState.refreshToken = null;
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function requestJson(endpoint, { method = "GET", payload, requiresAuth = false } = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	const headers = { "Content-Type": "application/json" };

	if (requiresAuth) {
		if (!authState.accessToken) {
			throw new Error("Session expired. Please log in again.");
		}
		headers.Authorization = `Bearer ${authState.accessToken}`;
	}

	const response = await fetch(url, {
		method,
		headers,
		body: payload !== undefined ? JSON.stringify(payload) : undefined,
	});

	const raw = await response.text();
	let data = {};
	try {
		data = raw ? JSON.parse(raw) : {};
	} catch {
		data = { error: raw || "Request failed." };
	}

	if (!response.ok) {
		throw new Error(data.error || data.message || `Request failed (${response.status}) at ${url}`);
	}

	return data;
}

async function postJson(endpoint, payload, requiresAuth = false) {
	return requestJson(endpoint, { method: "POST", payload, requiresAuth });
}

async function getJson(endpoint, requiresAuth = false) {
	return requestJson(endpoint, { method: "GET", requiresAuth });
}

function setError(fieldName, message) {
	const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);
	const input = registerFields[fieldName] || loginFields[fieldName] || resetFields[fieldName] || actionFields[fieldName];

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
	loginStatus.style.color = "var(--success)";
}

function setLoginErrorStatus(message) {
	loginStatus.textContent = message;
	loginStatus.style.color = "var(--danger)";
}

function showErrorPopup(message) {
	if (errorMessage) {
		errorMessage.textContent = message || "Something went wrong.";
	}

	if (errorConfirmation) {
		errorConfirmation.classList.remove("hidden");
	}
}

function showDemoWarning() {
	if (!demoWarningCard || demoState.demoWarningShown) {
		return;
	}

	demoWarningCard.classList.remove("hidden");
	demoState.demoWarningShown = true;
}

function showDemoTip() {
	if (!demoTipCard || demoState.demoTipShown) {
		return;
	}

	demoTipCard.classList.remove("hidden");
	demoState.demoTipShown = true;
}

function dismissDemoWarning() {
	if (!demoWarningCard) {
		return;
	}

	demoWarningCard.classList.add("hidden");
}

function dismissDemoTip() {
	if (!demoTipCard) {
		return;
	}

	demoTipCard.classList.add("hidden");
}

function closeErrorPopup() {
	if (errorConfirmation) {
		errorConfirmation.classList.add("hidden");
	}
}

function setLoadingState(isLoading, message) {
	if (loadingText) {
		loadingText.textContent = message || "Working...";
	}

	if (loadingBanner) {
		loadingBanner.classList.toggle("hidden", !isLoading);
	}

	registerForm.querySelectorAll("button").forEach((button) => {
		button.disabled = isLoading;
	});
	loginForm.querySelectorAll("button").forEach((button) => {
		button.disabled = isLoading;
	});
}

function setActionStatus(message) {
	actionStatus.textContent = message;
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

function parseAmount(value) {
	const normalized = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
	return Number.isFinite(normalized) ? normalized : NaN;
}

function isValidAccountNumber(value) {
	return /^\d{4,}$/.test(value);
}

function formatCurrency(amount) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

function addTransactionRow(title, dayLabel, amountValue, type) {
	const row = document.createElement("div");
	row.className = "transaction-row";

	const left = document.createElement("div");
	const titleNode = document.createElement("strong");
	titleNode.textContent = title;
	const dateNode = document.createElement("span");
	dateNode.textContent = dayLabel;
	left.appendChild(titleNode);
	left.appendChild(dateNode);

	const amountNode = document.createElement("span");
	amountNode.className = type === "credit" ? "credit" : "debit";
	amountNode.textContent = `${type === "credit" ? "+" : "-"} ${formatCurrency(amountValue)}`;

	row.appendChild(left);
	row.appendChild(amountNode);
	transactionList.appendChild(row);
}

function clearTransactionRows() {
	transactionList.innerHTML = "";
}

function addTransactionPlaceholder(message) {
	const row = document.createElement("div");
	row.className = "transaction-row";

	const left = document.createElement("div");
	const titleNode = document.createElement("strong");
	titleNode.textContent = message;
	const dateNode = document.createElement("span");
	dateNode.textContent = "Live account data loaded";
	left.appendChild(titleNode);
	left.appendChild(dateNode);

	const amountNode = document.createElement("span");
	amountNode.className = "credit";
	amountNode.textContent = "-";

	row.appendChild(left);
	row.appendChild(amountNode);
	transactionList.appendChild(row);
}

function updateShowMoreTransactionsButton() {
	if (!showMoreTransactionsButton) {
		return;
	}

	const remaining = demoState.transactionHistoryItems.length - demoState.visibleTransactionCount;
	const hasMore = remaining > 0;
	showMoreTransactionsButton.classList.toggle("hidden", !hasMore);

	if (hasMore) {
		showMoreTransactionsButton.textContent = `Show more (${remaining})`;
	}
}

function formatHistoryDateTime(item) {
	const rawTimestamp = item.timestamp || item.datetime || "";
	const rawDate = item.date || "";
	const rawTime = item.time || "";

	if (rawTimestamp) {
		const parsed = new Date(rawTimestamp);
		if (!Number.isNaN(parsed.getTime())) {
			const date = parsed.toLocaleDateString();
			const time = parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			return `${date} ${time}`;
		}
	}

	if (rawDate || rawTime) {
		return `${rawDate} ${rawTime}`.trim();
	}

	return "Date unavailable";
}

function getTransactionMeta(item) {
	const dateTime = formatHistoryDateTime(item);
	const ref = item.reference ? `REF: ${item.reference}` : "";
	return ref ? `${dateTime} • ${ref}` : dateTime;
}

function renderVisibleTransactionHistory() {
	clearTransactionRows();

	if (!demoState.transactionHistoryItems.length) {
		addTransactionPlaceholder("No transaction history yet.");
		updateShowMoreTransactionsButton();
		return;
	}

	const visibleItems = demoState.transactionHistoryItems.slice(0, demoState.visibleTransactionCount);
	visibleItems.forEach((item) => {
		const txType = String(item.transaction_type || "").toLowerCase();
		const title = getTransactionLabel(txType);
		const meta = getTransactionMeta(item);
		const amount = Number(item.amount) || 0;
		const direction = txType === "deposit" ? "credit" : "debit";
		addTransactionRow(title, meta, amount, direction);
	});

	updateShowMoreTransactionsButton();
}

function showMoreTransactions() {
	demoState.visibleTransactionCount = Math.min(
		demoState.visibleTransactionCount + TRANSACTION_PAGE_SIZE,
		demoState.transactionHistoryItems.length,
	);
	renderVisibleTransactionHistory();
}

function getTransactionLabel(transactionType) {
	if (transactionType === "deposit") {
		return "Deposit";
	}

	if (transactionType === "withdraw") {
		return "Withdrawal";
	}

	if (transactionType === "transfer") {
		return "Transfer";
	}

	return "Transaction";
}

function renderTransactionHistory(historyItems) {
	demoState.transactionHistoryItems = Array.isArray(historyItems) ? historyItems : [];
	demoState.visibleTransactionCount = Math.min(TRANSACTION_PAGE_SIZE, demoState.transactionHistoryItems.length);
	renderVisibleTransactionHistory();
}

async function refreshTransactionHistory() {
	const historyResponse = await getJson("/history/", true);
	renderTransactionHistory(historyResponse.data || []);
}

function mapDashboardResponse(payload) {
	const firstName = payload.first_name?.trim() || "";
	const lastName = payload.last_name?.trim() || "";
	const fullName = `${firstName} ${lastName}`.trim();

	return {
		name: fullName || payload.username || "Customer",
		email: payload.email || "-",
		idNumber: payload.username || "-",
		phoneNumber: payload.phone_number || demoState.registeredAccount?.phoneNumber || "-",
		balance: Number(payload.balance) || 0,
		accountNumber: payload.account_number || null,
	};
}

async function refreshDashboardData() {
	const dashboardData = await getJson("/dashboard/", true);
	const profile = mapDashboardResponse(dashboardData);
	showDashboard(profile);
	await refreshTransactionHistory();
	return profile;
}

function updateBalanceDisplay() {
	balanceValue.textContent = formatCurrency(demoState.balance);
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
	demoState.accountNumber = profile.accountNumber;

	welcomeTitle.textContent = `Account overview for ${profile.name}`;
	demoState.balance = profile.balance;
	updateBalanceDisplay();
	detailName.textContent = profile.name;
	detailIdNumber.textContent = profile.idNumber;
	detailEmail.textContent = profile.email;
	detailPhone.textContent = profile.phoneNumber;
	detailAccountNumber.textContent = profile.accountNumber || "-";

	authCard.classList.add("hidden");
	dashboard.classList.remove("hidden");
}

function validateDepositForm() {
	const rawAmount = actionFields.depositAmount.value.trim();
	let isValid = true;

	setError("depositAmount", "");

	if (rawAmount.length === 0) {
		setError("depositAmount", "This field cannot be empty.");
		isValid = false;
	} else {
		const amount = parseAmount(rawAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setError("depositAmount", "Enter a valid amount greater than 0.");
			isValid = false;
		}
	}

	return isValid;
}

function setDepositAmount(amount) {
	actionFields.depositAmount.value = amount;
	actionFields.depositAmount.focus();
	setError("depositAmount", "");
	setActionStatus("");
}

function setWithdrawAmount(amount) {
	actionFields.withdrawAmount.value = amount;
	actionFields.withdrawAmount.focus();
	setError("withdrawAmount", "");
	setActionStatus("");
}

function showTransactionConfirmation(type, amount, details) {
	const typeLabel = type === "credit" ? "Deposit" : type === "debit" ? "Withdrawal" : "Transfer";
	const typeEmoji = type === "credit" ? "📥" : type === "debit" ? "📤" : "💸";
	
	confirmationTitle.textContent = "Transaction Successful";
	confirmationMessage.textContent = `${typeEmoji} ${typeLabel} of ${formatCurrency(amount)}`;
	
	confirmationDetails.innerHTML = `
		<div class="confirmation-detail-row">
			<span class="confirmation-detail-label">Amount:</span>
			<span class="confirmation-detail-value">${formatCurrency(amount)}</span>
		</div>
		<div class="confirmation-detail-row">
			<span class="confirmation-detail-label">Type:</span>
			<span class="confirmation-detail-value">${typeLabel}</span>
		</div>
		${details ? `<div class="confirmation-detail-row">
			<span class="confirmation-detail-label">REF:</span>
			<span class="confirmation-detail-value">${details}</span>
		</div>` : ""}
		<div class="confirmation-detail-row">
			<span class="confirmation-detail-label">Time:</span>
			<span class="confirmation-detail-value">${new Date().toLocaleTimeString()}</span>
		</div>
	`;
	
	transactionConfirmation.classList.remove("hidden");
}

function closeTransactionConfirmation() {
	transactionConfirmation.classList.add("hidden");
}

function validateWithdrawForm() {
	const rawAmount = actionFields.withdrawAmount.value.trim();
	let isValid = true;

	setError("withdrawAmount", "");

	if (rawAmount.length === 0) {
		setError("withdrawAmount", "This field cannot be empty.");
		isValid = false;
	} else {
		const amount = parseAmount(rawAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setError("withdrawAmount", "Enter a valid amount greater than 0.");
			isValid = false;
		} else if (amount > demoState.balance) {
			setError("withdrawAmount", "Insufficient balance.");
			isValid = false;
		}
	}

	return isValid;
}

function validateSendMoneyForm() {
	const recipient = sanitizeNumeric(actionFields.sendAccount.value.trim());
	const confirmRecipient = sanitizeNumeric(actionFields.confirmSendAccount.value.trim());
	const rawAmount = actionFields.sendAmount.value.trim();
	let isValid = true;

	setError("sendAccount", "");
	setError("confirmSendAccount", "");
	setError("sendAmount", "");

	if (recipient.length === 0) {
		setError("sendAccount", "This field cannot be empty.");
		isValid = false;
	} else if (!isValidAccountNumber(recipient)) {
		setError("sendAccount", "Account number must be at least 4 digits.");
		isValid = false;
	}

	if (confirmRecipient.length === 0) {
		setError("confirmSendAccount", "This field cannot be empty.");
		isValid = false;
	} else if (recipient !== confirmRecipient) {
		setError("confirmSendAccount", "Account numbers do not match.");
		isValid = false;
	}

	if (rawAmount.length === 0) {
		setError("sendAmount", "This field cannot be empty.");
		isValid = false;
	} else {
		const amount = parseAmount(rawAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setError("sendAmount", "Enter a valid amount greater than 0.");
			isValid = false;
		} else if (amount > demoState.balance) {
			setError("sendAmount", "Insufficient balance.");
			isValid = false;
		}
	}

	return isValid;
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
	demoState.accountNumber = null;
	demoState.demoWarningShown = false;
	demoState.demoTipShown = false;
	clearTokens();
	loginForm.reset();
	resetForm.reset();
	clearErrors(loginFields);
	clearErrors(resetFields);
	clearErrors(actionFields);
	setLoginStatus("");
	setActionStatus("");
	otpStatus.textContent = "OTP not sent yet.";
	clearTransactionRows();
	dashboard.classList.add("hidden");
	authCard.classList.remove("hidden");
	showLoginView();
}

registerForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (!validateRegisterForm()) {
		return;
	}

	const payload = {
		first_name: registerFields.firstName.value.trim(),
		last_name: registerFields.lastName.value.trim(),
		phone_number: sanitizeNumeric(registerFields.phoneNumber.value.trim()),
		email: registerFields.registerEmail.value.trim(),
		id_number: sanitizeNumeric(registerFields.registerIdNumber.value.trim()),
		password: registerFields.registerPassword.value,
	};

	try {
		setLoadingState(true, "Creating your account...");
		const result = await postJson("/create_account/", payload);

		demoState.registeredAccount = {
			firstName: payload.first_name,
			lastName: payload.last_name,
			phoneNumber: payload.phone_number,
			email: payload.email,
			idNumber: payload.id_number,
			password: payload.password,
			accountNumber: result.account,
			balance: Number(result.balance) || 0,
		};

		registerForm.reset();
		loginForm.reset();
		clearErrors(loginFields);
		setLoginStatus("Account created successfully. Please log in.");
		showLoginView();
		loginFields.loginIdNumber.value = payload.id_number;
	} catch (error) {
		showErrorPopup(error.message || "Unable to create account right now.");
	} finally {
		setLoadingState(false);
	}
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

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (!validateLoginForm()) {
		return;
	}

	const idNumber = sanitizeNumeric(loginFields.loginIdNumber.value.trim());
	const password = loginFields.loginPassword.value;

	try {
		setLoadingState(true, "Signing you in...");
		const loginResult = await postJson("/login/", {
			id_number: idNumber,
			password,
		});
		saveTokens(loginResult.access, loginResult.refresh);

		setLoadingState(true, "Loading dashboard...");
		await refreshDashboardData();
		showDemoWarning();
		showDemoTip();

		setLoginStatus("Login successful.");
	} catch (error) {
		clearTokens();
		setError("loginPassword", error.message || "Invalid ID number or password.");
		showErrorPopup(error.message || "Login failed.");
	} finally {
		setLoadingState(false);
	}
});

depositForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	setActionStatus("");

	if (!validateDepositForm()) {
		return;
	}

	const amount = parseAmount(actionFields.depositAmount.value.trim());

	if (!demoState.accountNumber) {
		setActionStatus("Account number unavailable. Please sign in again.");
		return;
	}

	try {
		setLoadingState(true, "Depositing funds...");
		const result = await postJson(
			"/deposit/",
			{
				account_number: demoState.accountNumber,
				amount,
			},
			true,
		);
		await refreshDashboardData();
		showTransactionConfirmation("credit", amount, result.reference || "");
		setActionStatus(result.message || `Deposit successful: ${formatCurrency(amount)}.`);
		depositForm.reset();
	} catch (error) {
		showErrorPopup(error.message || "Deposit failed.");
	} finally {
		setLoadingState(false);
	}
});

withdrawForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	setActionStatus("");

	if (!validateWithdrawForm()) {
		return;
	}

	const amount = parseAmount(actionFields.withdrawAmount.value.trim());

	if (!demoState.accountNumber) {
		setActionStatus("Account number unavailable. Please sign in again.");
		return;
	}

	try {
		setLoadingState(true, "Processing withdrawal...");
		const result = await postJson(
			"/withdraw/",
			{
				account_number: demoState.accountNumber,
				amount,
			},
			true,
		);
		await refreshDashboardData();
		showTransactionConfirmation("debit", amount, result.reference || "");
		setActionStatus(result.message || `Withdrawal successful: ${formatCurrency(amount)}.`);
		withdrawForm.reset();
	} catch (error) {
		showErrorPopup(error.message || "Withdrawal failed.");
	} finally {
		setLoadingState(false);
	}
});

sendMoneyForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	setActionStatus("");

	if (!validateSendMoneyForm()) {
		return;
	}

	const amount = parseAmount(actionFields.sendAmount.value.trim());
	const recipient = sanitizeNumeric(actionFields.sendAccount.value.trim());

	if (!demoState.accountNumber) {
		setActionStatus("Account number unavailable. Please sign in again.");
		return;
	}

	try {
		setLoadingState(true, "Sending transfer...");
		const result = await postJson(
			"/transfer/",
			{
				from_account: demoState.accountNumber,
				to_account: recipient,
				amount,
			},
			true,
		);
		await refreshDashboardData();
		const recipientAccount = result.to_account || recipient;
		showTransactionConfirmation("transfer", amount, result.reference || "");
		setActionStatus(result.message || `Transfer successful: ${formatCurrency(amount)} sent to ${recipient}.`);
		sendMoneyForm.reset();
	} catch (error) {
		showErrorPopup(error.message || "Transfer failed.");
	} finally {
		setLoadingState(false);
	}
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

Object.entries(actionFields).forEach(([fieldName, input]) => {
	input.addEventListener("input", () => {
		setError(fieldName, "");
		setActionStatus("");
	});
});

if (showRegisterButton) {
	showRegisterButton.addEventListener("click", showRegisterView);
}

if (showLoginButton) {
	showLoginButton.addEventListener("click", showLoginView);
}

if (showResetPasswordButton) {
	showResetPasswordButton.addEventListener("click", showResetView);
}

if (backToLoginButton) {
	backToLoginButton.addEventListener("click", showLoginView);
}

if (sendOtpButton) {
	sendOtpButton.addEventListener("click", sendOtp);
}

if (showMoreTransactionsButton) {
	showMoreTransactionsButton.addEventListener("click", showMoreTransactions);
}

if (dismissDemoWarningButton) {
	dismissDemoWarningButton.addEventListener("click", dismissDemoWarning);
}

if (dismissDemoTipButton) {
	dismissDemoTipButton.addEventListener("click", dismissDemoTip);
}

quickDepositButtons.forEach((button) => {
	button.addEventListener("click", () => {
		setDepositAmount(button.dataset.depositFigure || "");
	});
});

quickWithdrawButtons.forEach((button) => {
	button.addEventListener("click", () => {
		setWithdrawAmount(button.dataset.withdrawFigure || "");
	});
});

if (confirmationCloseBtn) {
	confirmationCloseBtn.addEventListener("click", closeTransactionConfirmation);
}

if (errorCloseBtn) {
	errorCloseBtn.addEventListener("click", closeErrorPopup);
}

if (transactionConfirmation) {
	transactionConfirmation.addEventListener("click", (event) => {
		if (event.target === transactionConfirmation) {
			closeTransactionConfirmation();
		}
	});
}

if (errorConfirmation) {
	errorConfirmation.addEventListener("click", (event) => {
		if (event.target === errorConfirmation) {
			closeErrorPopup();
		}
	});
}

if (signOutButton) {
	signOutButton.addEventListener("click", signOut);
}

loadTokens();
if (authState.accessToken) {
	setLoadingState(true, "Restoring your session...");
	refreshDashboardData()
		.catch(() => {
			clearTokens();
			showLoginView();
		})
		.finally(() => {
			setLoadingState(false);
		});
}
