import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  fieldName: string;
  value: any; // Can be string, number, array, etc.
}

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  formVersion: number; // Store the version at submission time
  answers: IAnswer[];
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
}

const SubmissionSchema: Schema = new Schema(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true,
    },
    formVersion: {
      type: Number,
      required: true,
    },
    answers: [
      {
        fieldName: {
          type: String,
          required: true,
        },
        value: Schema.Types.Mixed,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);

