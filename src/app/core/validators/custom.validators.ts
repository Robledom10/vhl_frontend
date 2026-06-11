import { AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {

	const password = control.get('password')?.value;
	const confirm = control.get('confirmPassword')?.value;

	if (!password || !confirm) return null;

	return password === confirm ? null : { mismatch: true }
}

export function minimumAgeValidator(minAge: number) {

	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value;
		if (!value) return null;

		const birthDate = new Date(value);
		const today = new Date();

		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age >= minAge ? null : { minAge: true };
	}
}

export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;

	if (!value) return null;

	const hasUpper = /[A-Z]/.test(value);
	const hasLower = /[a-z]/.test(value);
	const hasNumber = /\d/.test(value);
	const hasSpecial = /[@#$¡!*?&]/.test(value);

	const valid = hasUpper && hasLower && hasNumber && hasSpecial;

	return valid ? null : { weakPassword: true };
}