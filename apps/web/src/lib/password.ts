export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  score: number;
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
} as const;

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password) {
    return { valid: false, errors: ["Password is required"], score: 0 };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?)");
  } else {
    score += 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    score,
  };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score <= 1) return "Very Weak";
  if (score === 2) return "Weak";
  if (score === 3) return "Fair";
  if (score === 4) return "Good";
  return "Strong";
}

export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return "text-red-400";
  if (score === 2) return "text-orange-400";
  if (score === 3) return "text-yellow-400";
  if (score === 4) return "text-lime-400";
  return "text-emerald-400";
}