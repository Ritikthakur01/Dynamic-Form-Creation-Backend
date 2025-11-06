import mongoose, { Schema, Document } from 'mongoose';

export interface IForm extends Document {
  title: string;
  description?: string;
  fields: mongoose.Types.ObjectId[];
  version: number;
  isActive: boolean; // Current active version
  previousVersion?: mongoose.Types.ObjectId; // Reference to previous version
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fields: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Field',
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    previousVersion: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IForm>('Form', FormSchema);

