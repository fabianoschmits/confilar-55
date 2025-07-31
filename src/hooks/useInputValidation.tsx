import { useState } from 'react';
import { sanitizeText } from '@/lib/sanitize';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue: string;
}

export const useInputValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (
    name: string,
    value: string,
    rules: ValidationRules
  ): ValidationResult => {
    const sanitizedValue = sanitizeText(value);
    
    // Required check
    if (rules.required && !sanitizedValue.trim()) {
      const error = 'Este campo é obrigatório';
      setErrors(prev => ({ ...prev, [name]: error }));
      return { isValid: false, error, sanitizedValue };
    }

    // Min length check
    if (rules.minLength && sanitizedValue.length < rules.minLength) {
      const error = `Mínimo de ${rules.minLength} caracteres`;
      setErrors(prev => ({ ...prev, [name]: error }));
      return { isValid: false, error, sanitizedValue };
    }

    // Max length check
    if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      const error = `Máximo de ${rules.maxLength} caracteres`;
      setErrors(prev => ({ ...prev, [name]: error }));
      return { isValid: false, error, sanitizedValue };
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
      const error = 'Formato inválido';
      setErrors(prev => ({ ...prev, [name]: error }));
      return { isValid: false, error, sanitizedValue };
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(sanitizedValue);
      if (customError) {
        setErrors(prev => ({ ...prev, [name]: customError }));
        return { isValid: false, error: customError, sanitizedValue };
      }
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    return { isValid: true, sanitizedValue };
  };

  const clearError = (name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateField,
    clearError,
    clearAllErrors
  };
};