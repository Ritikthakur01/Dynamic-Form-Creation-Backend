import express from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { loginSchema } from '../validations/authValidation';

const router = express.Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), (req, res) => {
  authController.login(req, res);
});

export default router;
