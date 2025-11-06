import { Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';

const submissionService = new SubmissionService();

export class SubmissionController {
  async submitForm(req: Request, res: Response): Promise<void> {
    try {
      const submission = await submissionService.submitForm(req.params.id, {
        answers: req.body.answers,
        ip: req.ip || (req.headers['x-forwarded-for'] as string) || undefined,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        message: 'Form submitted successfully',
        submissionId: submission._id,
      });
    } catch (error: any) {
      if (error.statusCode === 400) {
        res.status(400).json({
          error: error.message,
          errors: error.errors,
        });
        return;
      }
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await submissionService.getSubmissions(req.params.formId, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const csv = await submissionService.exportSubmissionsAsCSV(req.params.formId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="form-${req.params.formId}-submissions.csv"`);
      res.send(csv);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

