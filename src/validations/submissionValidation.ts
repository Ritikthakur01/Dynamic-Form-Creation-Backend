import Joi from 'joi';

export const submitFormSchema = Joi.object({
  answers: Joi.object().required()
    .messages({
      'object.base': 'Answers must be an object',
      'any.required': 'Answers are required',
    }),
});

