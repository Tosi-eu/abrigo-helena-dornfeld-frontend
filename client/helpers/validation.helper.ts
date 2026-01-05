// Input validation and sanitization utilities

/**
 * Sanitizes string input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters and patterns
  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim();
}

/**
 * Validates and sanitizes email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "E-mail é obrigatório" };
  }

  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: "E-mail inválido" };
  }

  if (sanitized.length > 255) {
    return { valid: false, error: "E-mail muito longo (máximo 255 caracteres)" };
  }

  return { valid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
  strength?: "weak" | "medium" | "strong";
} {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Senha é obrigatória" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: "Senha deve ter no mínimo 8 caracteres",
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      error: "Senha muito longa (máximo 128 caracteres)",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const requirementsMet =
    [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (requirementsMet < 3) {
    return {
      valid: false,
      error:
        "Senha deve conter pelo menos 3 dos seguintes: letra maiúscula, letra minúscula, número, caractere especial",
    };
  }

  // Calculate strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (password.length >= 12 && requirementsMet === 4) {
    strength = "strong";
  } else if (password.length >= 10 || requirementsMet === 4) {
    strength = "medium";
  }

  return { valid: true, strength };
}

/**
 * Validates text input with length constraints
 */
export function validateTextInput(
  input: string,
  options: {
    minLength?: number;
    maxLength: number;
    required?: boolean;
    fieldName?: string;
  },
): { valid: boolean; error?: string; sanitized?: string } {
  const { minLength = 0, maxLength, required = false, fieldName = "Campo" } = options;

  if (required && (!input || input.trim().length === 0)) {
    return { valid: false, error: `${fieldName} é obrigatório` };
  }

  if (!input) {
    return { valid: true, sanitized: "" };
  }

  const sanitized = sanitizeInput(input);

  if (sanitized.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} deve ter no mínimo ${minLength} caracteres`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} deve ter no máximo ${maxLength} caracteres`,
    };
  }

  return { valid: true, sanitized };
}

/**
 * Validates number input
 */
export function validateNumberInput(
  input: string | number,
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    fieldName?: string;
  },
): { valid: boolean; error?: string; value?: number } {
  const { min, max, required = false, fieldName = "Campo" } = options;

  if (required && (input === null || input === undefined || input === "")) {
    return { valid: false, error: `${fieldName} é obrigatório` };
  }

  if (input === null || input === undefined || input === "") {
    return { valid: true, value: undefined };
  }

  const numValue = typeof input === "number" ? input : Number(input);

  if (isNaN(numValue)) {
    return { valid: false, error: `${fieldName} deve ser um número válido` };
  }

  if (min !== undefined && numValue < min) {
    return { valid: false, error: `${fieldName} deve ser no mínimo ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { valid: false, error: `${fieldName} deve ser no máximo ${max}` };
  }

  return { valid: true, value: numValue };
}

