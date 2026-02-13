import express from 'express';
import {
  getTestCases,
  getTestCaseById,
  createTestCase,
  updateTestCase,
  deleteTestCase
} from '../controllers/testCase.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getTestCases);
router.get('/:id', getTestCaseById);
router.post('/', createTestCase);
router.put('/:id', updateTestCase);
router.delete('/:id', deleteTestCase);

export default router;
