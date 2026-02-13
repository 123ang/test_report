import express from 'express';
import multer from 'multer';
import {
  downloadTemplate,
  importTestCases,
  exportTestCases,
  exportTestRuns
} from '../controllers/csv.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for CSV upload (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authMiddleware);

router.get('/template', downloadTemplate);
router.post('/import', upload.single('file'), importTestCases);
router.get('/export/test-cases', exportTestCases);
router.get('/export/test-runs', exportTestRuns);

export default router;
