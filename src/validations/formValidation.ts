import Joi from 'joi';

export const createFormSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 200 characters',
    }),
  description: Joi.string().trim().max(1000).optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 1000 characters',
    }),
});

export const updateFormSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional()
    .messages({
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 200 characters',
    }),
  description: Joi.string().trim().max(1000).optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 1000 characters',
    }),
});

export const createFieldSchema = Joi.object({
  label: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Label is required',
      'string.min': 'Label must be at least 1 character',
      'string.max': 'Label must not exceed 200 characters',
    }),
  type: Joi.string().valid('text', 'textarea', 'number', 'email', 'date', 'checkbox', 'radio', 'select', 'file').required()
    .messages({
      'any.only': 'Invalid field type',
    }),
  name: Joi.string().trim().min(1).max(100).pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/).required()
    .messages({
      'string.empty': 'Name is required',
      'string.pattern.base': 'Name must start with a letter and contain only letters, numbers, and underscores',
    }),
  required: Joi.boolean().optional().default(false),
  options: Joi.array().items(Joi.string().trim()).optional(),
  validation: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    pattern: Joi.string().optional(),
    minLength: Joi.number().integer().min(0).optional(),
    maxLength: Joi.number().integer().min(0).optional(),
  }).optional(),
  order: Joi.number().integer().min(0).optional().default(0),
}).custom((value, helpers) => {
  // Validate options for radio/select
  if ((value.type === 'radio' || value.type === 'select') && (!value.options || value.options.length === 0)) {
    return helpers.error('any.custom', { message: 'Options are required for radio/select fields' });
  }
  return value;
});

export const updateFieldSchema = Joi.object({
  label: Joi.string().trim().min(1).max(200).optional()
    .messages({
      'string.min': 'Label must be at least 1 character',
      'string.max': 'Label must not exceed 200 characters',
    }),
  type: Joi.string().valid('text', 'textarea', 'number', 'email', 'date', 'checkbox', 'radio', 'select', 'file').optional(),
  name: Joi.string().trim().min(1).max(100).pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/).optional()
    .messages({
      'string.pattern.base': 'Name must start with a letter and contain only letters, numbers, and underscores',
    }),
  required: Joi.boolean().optional(),
  options: Joi.array().items(Joi.string().trim()).optional(),
  validation: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    pattern: Joi.string().optional(),
    minLength: Joi.number().integer().min(0).optional(),
    maxLength: Joi.number().integer().min(0).optional(),
  }).optional(),
  order: Joi.number().integer().min(0).optional(),
});

export const reorderFieldsSchema = Joi.object({
  fieldOrders: Joi.array().items(
    Joi.object({
      fieldId: Joi.string().required(),
      order: Joi.number().integer().min(0).required(),
    })
  ).min(1).required()
    .messages({
      'array.min': 'At least one field order is required',
    }),
});

export const createVersionSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional()
    .messages({
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 200 characters',
    }),
  description: Joi.string().trim().max(1000).optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 1000 characters',
    }),
});

