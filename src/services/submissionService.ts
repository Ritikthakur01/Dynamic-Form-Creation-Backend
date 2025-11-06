import Submission from '../models/Submission';
import Form from '../models/Form';
import Field from '../models/Field';
import { ISubmission } from '../models/Submission';
import { validateSubmission } from '../utils/validation';

export interface SubmissionPaginationResult {
  submissions: ISubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SubmitFormData {
  answers: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class SubmissionService {
  async submitForm(formId: string, data: SubmitFormData): Promise<ISubmission> {
    const form = await Form.findOne({ _id: formId, isActive: true }).populate('fields');
    if (!form) {
      throw {
        statusCode: 404,
        message: 'Form not found or inactive',
      };
    }

    const fields = form.fields as any[];

    // Validate submission
    const validationErrors = validateSubmission(fields, data.answers);
    if (validationErrors.length > 0) {
      throw {
        statusCode: 400,
        message: 'Validation failed',
        errors: validationErrors,
      };
    }

    // Create submission with form version
    const submission = new Submission({
      formId,
      formVersion: form.version,
      answers: Object.entries(data.answers).map(([fieldName, value]) => ({
        fieldName,
        value,
      })),
      ip: data.ip,
      userAgent: data.userAgent,
    });

    return await submission.save();
  }

  async getSubmissions(
    formId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SubmissionPaginationResult> {
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ formId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({ formId });

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async exportSubmissionsAsCSV(formId: string): Promise<string> {
    const form = await Form.findById(formId).populate('fields');
    if (!form) {
      throw new Error('Form not found');
    }

    const submissions = await Submission.find({ formId }).sort({ submittedAt: -1 });
    const fields = form.fields as any[];

    const fieldNames = fields.map((f) => f.name);

    // CSV header
    const headers = ['Submitted At', 'IP Address', 'Form Version', ...fieldNames].join(',');

    // CSV rows
    const rows = submissions.map((submission) => {
      const answersMap = new Map(
        submission.answers.map((a) => [a.fieldName, a.value])
      );

      const values = [
        submission.submittedAt.toISOString(),
        submission.ip || '',
        submission.formVersion.toString(),
        ...fieldNames.map((name) => {
          const value = answersMap.get(name);
          if (value === undefined || value === null) return '';
          if (Array.isArray(value)) return `"${value.join('; ')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }),
      ];

      return values.join(',');
    });

    return [headers, ...rows].join('\n');
  }
}

