import mongoose, { Schema, Document } from 'mongoose';

export interface IValidation {
  min?: number;
  max?: number;
  pattern?: string; // regex pattern
  minLength?: number;
  maxLength?: number;
}

export interface IField extends Document {
  formId: mongoose.Types.ObjectId;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'checkbox' | 'radio' | 'select' | 'file';
  name: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: IValidation;
  order: number;
}

const FieldSchema: Schema = new Schema(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'email', 'date', 'checkbox', 'radio', 'select', 'file'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      minLength: Number,
      maxLength: Number,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique field name within a form
FieldSchema.index({ formId: 1, name: 1 }, { unique: true });

export default mongoose.model<IField>('Field', FieldSchema);

