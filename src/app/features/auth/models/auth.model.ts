export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	user: User;
}

export interface RegisterRequest {
	firstName: string;
	// middleName?: string;
	lastName: string;
	email: string;
	// birthdate: string,
	password: string;
	documentType: string;
	documentNumber: string;
}

export interface RegisterResponse {
	message: string;
	user: User;
}

export interface User {
	id: number;
	name: string;
	email: string;
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	token: string;
	newPassword: string;
	confirmPassword: string;
}