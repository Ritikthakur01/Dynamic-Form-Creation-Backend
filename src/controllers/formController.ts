import { Request, Response } from 'express';
import { FormService } from '../services/formService';

const formService = new FormService();

export class FormController {
  async createForm(req: Request, res: Response): Promise<void> {
    try {
      const form = await formService.createForm(req.body);
      res.status(201).json(form);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllForms(req: Request, res: Response): Promise<void> {
    try {
      const forms = await formService.getAllForms();
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFormById(req: Request, res: Response): Promise<void> {
    try {
      const form = await formService.getFormById(req.params.id);
      if (!form) {
        res.status(404).json({ error: 'Form not found' });
        return;
      }
      res.json(form);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateForm(req: Request, res: Response): Promise<void> {
    try {
      const form = await formService.updateForm(req.params.id, req.body);
      if (!form) {
        res.status(404).json({ error: 'Form not found' });
        return;
      }
      res.json(form);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteForm(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await formService.deleteForm(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Form not found' });
        return;
      }
      res.json({ message: 'Form deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createNewVersion(req: Request, res: Response): Promise<void> {
    try {
      const newForm = await formService.createNewVersion(req.params.id, req.body);
      if (!newForm) {
        res.status(404).json({ error: 'Form not found' });
        return;
      }
      res.status(201).json(newForm);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createField(req: Request, res: Response): Promise<void> {
    try {
      const field = await formService.createField(req.params.formId, req.body);
      res.status(201).json(field);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Field name must be unique within the form' });
        return;
      }
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async updateField(req: Request, res: Response): Promise<void> {
    try {
      const field = await formService.updateField(
        req.params.formId,
        req.params.fieldId,
        req.body
      );
      if (!field) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }
      res.json(field);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteField(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await formService.deleteField(req.params.formId, req.params.fieldId);
      if (!deleted) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }
      res.json({ message: 'Field deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async reorderFields(req: Request, res: Response): Promise<void> {
    try {
      const form = await formService.reorderFields(req.params.formId, req.body.fieldOrders);
      if (!form) {
        res.status(404).json({ error: 'Form not found' });
        return;
      }
      res.json(form);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

