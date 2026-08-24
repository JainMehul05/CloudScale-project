import { describe, it, expect } from 'vitest';
import { validatePassword, PASSWORD_REQUIREMENTS } from '../password';

describe('Password Validation', () => {
  describe('Valid passwords', () => {
    it('should accept CloudScale@2026Secure', () => {
      const result = validatePassword('CloudScale@2026Secure');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password meeting all requirements', () => {
      const result = validatePassword('ValidPass123!');
      expect(result.valid).toBe(true);
    });

    it('should accept password with multiple special characters', () => {
      const result = validatePassword('Test@#$%^&*123');
      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid passwords - minimum length', () => {
    it('should reject password with 11 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    });

    it('should reject password with 8 characters', () => {
      const result = validatePassword('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('Invalid passwords - missing uppercase', () => {
    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });
  });

  describe('Invalid passwords - missing lowercase', () => {
    it('should reject password without lowercase', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });
  });

  describe('Invalid passwords - missing number', () => {
    it('should reject password without number', () => {
      const result = validatePassword('NoNumbersHere!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('Invalid passwords - missing special character', () => {
    it('should reject password without special character', () => {
      const result = validatePassword('NoSpecialChar123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)');
    });

    it('should reject common weak passwords', () => {
      const weakPasswords = ['password123', '12345678', 'cloudscale', 'Password123', 'PASSWORD123'];
      for (const pwd of weakPasswords) {
        const result = validatePassword(pwd);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('Multiple missing requirements', () => {
    it('should report all missing requirements', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Password strength scoring', () => {
    it('should give score 5 for valid password', () => {
      const result = validatePassword('ValidPass123!');
      expect(result.score).toBe(5);
    });

    it('should give lower score for weaker passwords', () => {
      const result = validatePassword('weak');
      expect(result.score).toBeLessThan(5);
    });
  });
});