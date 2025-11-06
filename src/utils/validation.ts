import { IField, IValidation } from '../models/Field';

export interface ValidationError {
  fieldName: string;
  message: string;
}

export const validateFieldValue = (
  field: IField,
  value: any
): string | null => {
  // Check required
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }

  // Skip validation if value is empty and not required
  if (!field.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  const validation = field.validation;

  switch (field.type) {
    case 'text':
    case 'textarea':
      if (typeof value !== 'string') {
        return `${field.label} must be a string`;
      }
      if (validation?.minLength && value.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }
      if (validation?.maxLength && value.length > validation.maxLength) {
        return `${field.label} must be at most ${validation.maxLength} characters`;
      }
      if (validation?.pattern) {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return `${field.label} format is invalid`;
          }
        } catch (e) {
          return `${field.label} has invalid regex pattern`;
        }
      }
      break;

    case 'email':
      if (typeof value !== 'string') {
        return `${field.label} must be a string`;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field.label} must be a valid email address`;
      }
      break;

    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a number`;
      }
      if (validation?.min !== undefined && numValue < validation.min) {
        return `${field.label} must be at least ${validation.min}`;
      }
      if (validation?.max !== undefined && numValue > validation.max) {
        return `${field.label} must be at most ${validation.max}`;
      }
      break;

    case 'date':
      if (typeof value !== 'string') {
        return `${field.label} must be a date string`;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${field.label} must be a valid date`;
      }
      break;

    case 'checkbox':
      if (!Array.isArray(value)) {
        return `${field.label} must be an array`;
      }
      if (field.options && value.some((v: string) => !field.options?.includes(v))) {
        return `${field.label} contains invalid options`;
      }
      break;

    case 'radio':
    case 'select':
      if (field.options && !field.options.includes(value)) {
        return `${field.label} must be one of: ${field.options.join(', ')}`;
      }
      break;

    case 'file':
      // File validation can be extended
      if (typeof value !== 'string') {
        return `${field.label} must be a file path or base64 string`;
      }
      break;
  }

  return null;
};

export const validateSubmission = (
  fields: IField[],
  answers: Record<string, any>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check all required fields are present
  for (const field of fields) {
    const value = answers[field.name];
    const error = validateFieldValue(field, value);
    if (error) {
      errors.push({ fieldName: field.name, message: error });
    }
  }

  // Check for extra fields that don't exist
  const fieldNames = new Set(fields.map((f) => f.name));
  for (const fieldName in answers) {
    if (!fieldNames.has(fieldName)) {
      errors.push({
        fieldName,
        message: `Unknown field: ${fieldName}`,
      });
    }
  }

  return errors;
};

