import express from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { FormController } from '../controllers/formController';
import { SubmissionController } from '../controllers/submissionController';
import {
  createFormSchema,
  updateFormSchema,
  createFieldSchema,
  updateFieldSchema,
  reorderFieldsSchema,
  createVersionSchema,
} from '../validations/formValidation';

const router = express.Router();
const formController = new FormController();
const submissionController = new SubmissionController();

// All admin routes require authentication
router.use(authenticateAdmin);

// Forms CRUD
router.post('/forms', validate(createFormSchema), (req, res) => {
  formController.createForm(req, res);
});

router.get('/forms', (req, res) => {
  formController.getAllForms(req, res);
});

router.get('/forms/:id', (req, res) => {
  formController.getFormById(req, res);
});

router.put('/forms/:id', validate(updateFormSchema), (req, res) => {
  formController.updateForm(req, res);
});

router.delete('/forms/:id', (req, res) => {
  formController.deleteForm(req, res);
});

// Create new version of form
router.post('/forms/:id/versions', validate(createVersionSchema), (req, res) => {
  formController.createNewVersion(req, res);
});

// Fields CRUD
router.post('/forms/:formId/fields', validate(createFieldSchema), (req, res) => {
  formController.createField(req, res);
});

router.put('/forms/:formId/fields/:fieldId', validate(updateFieldSchema), (req, res) => {
  formController.updateField(req, res);
});

router.delete('/forms/:formId/fields/:fieldId', (req, res) => {
  formController.deleteField(req, res);
});

// Reorder fields
router.patch('/forms/:formId/fields/reorder', validate(reorderFieldsSchema), (req, res) => {
  formController.reorderFields(req, res);
});

// Submissions
router.get('/forms/:formId/submissions', (req, res) => {
  submissionController.getSubmissions(req, res);
});

router.get('/forms/:formId/submissions/export', (req, res) => {
  submissionController.exportSubmissions(req, res);
});

export default router;
