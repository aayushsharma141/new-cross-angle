import { useState, useCallback } from 'react';

export interface ValidationErrors {
  [key: string]: string;
}

const CONTACT_FORM_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'projectType',
  'projectBudget',
  'location',
  'message',
] as const;

export const useLeadValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    
    // Strict email validation
    // 1. Basic format
    const basicRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!basicRegex.test(email)) return "Please enter a valid email address";
    
    // 2. No consecutive dots
    if (email.includes('..')) return "Email addresses cannot contain consecutive dots";
    
    // 3. Length checks
    if (email.length > 254) return "Email address is too long";
    
    // 4. Domain part must have at least one dot and a 2+ char TLD
    const parts = email.split('@');
    if (parts.length === 2) {
      const domainParts = parts[1].split('.');
      if (domainParts.length < 2) return "Please enter a valid domain";
      const tld = domainParts[domainParts.length - 1];
      if (tld.length < 2) return "Invalid domain extension";
    }

    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return "Phone number is required";
    
    // Robust Phone Validation (Supports international formats)
    // Allows optional +, country code, and 10-15 digits total
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
      return "Please enter a valid phone number";
    }
    
    return "";
  };

  const validateField = useCallback((name: string, value: string): string => {
    const trimmedValue = value.trim();

    switch (name) {
      case 'firstName':
        if (!trimmedValue) return "First name is required";
        return trimmedValue.length < 2 ? "Name is too short" : "";
      case 'lastName':
        if (!trimmedValue) return "Last name is required";
        return trimmedValue.length < 2 ? "Name is too short" : "";
      case 'email':
        return validateEmail(trimmedValue);
      case 'phone':
        return validatePhone(trimmedValue);
      case 'projectType':
        return trimmedValue ? "" : "Choose the type of project";
      case 'projectBudget':
        return trimmedValue ? "" : "Choose the expected budget";
      case 'location':
        return trimmedValue ? "" : "Select the project location";
      case 'message':
        return trimmedValue.length === 0 ? "Please tell us about your project" : "";
      default:
        return "";
    }
  }, []);

  const handleBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (data: Record<string, string>): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    CONTACT_FORM_FIELDS.forEach((key) => {
      const error = validateField(key, data[key] || '');
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(CONTACT_FORM_FIELDS.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  };

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    handleChange,
    validateForm,
    setErrors,
    setTouched
  };
};
