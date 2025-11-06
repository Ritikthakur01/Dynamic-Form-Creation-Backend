import { Request, Response } from 'express';
import Form from '../models/Form';
import { FormService } from '../services/formService';

const formService = new FormService();

export class PublicController {
  async listForms(req: Request, res: Response): Promise<void> {
    try {
      const forms = await Form.find({ isActive: true }, 'title description createdAt')
        .sort({ createdAt: -1 });
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getForm(req: Request, res: Response): Promise<void> {
    try {
      const form = await formService.getActiveFormById(req.params.id);
      if (!form) {
        res.status(404).json({ error: 'Form not found' });
        return;
      }

      // Return only necessary fields for rendering
      const formData = {
        _id: form._id,
        title: form.title,
        description: form.description,
        version: form.version,
        fields: (form.fields as any[]).map((field: any) => ({
          _id: field._id,
          label: field.label,
          type: field.type,
          name: field.name,
          required: field.required,
          options: field.options,
          validation: field.validation,
          order: field.order,
        })),
      };

      res.json(formData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

