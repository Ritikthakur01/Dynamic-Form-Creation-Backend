import express from 'express';
import { PublicController } from '../controllers/publicController';
import { SubmissionController } from '../controllers/submissionController';
import { validate } from '../middleware/validation';
import { submitFormSchema } from '../validations/submissionValidation';

const router = express.Router();
const publicController = new PublicController();
const submissionController = new SubmissionController();

// List all available forms
router.get('/forms', (req, res) => {
  publicController.listForms(req, res);
});

// Get form definition with fields
router.get('/forms/:id', (req, res) => {
  publicController.getForm(req, res);
});

// Submit form response
router.post('/forms/:id/submit', validate(submitFormSchema), (req, res) => {
  submissionController.submitForm(req, res);
});

export default router;
