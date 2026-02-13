import express from 'express';
import {
  getTestRuns,
  getTestRunById,
  createTestRun,
  updateTestRun,
  uploadScreenshots
} from '../controllers/testRun.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getTestRuns);
router.get('/:id', getTestRunById);
router.post('/', createTestRun);
router.put('/:id', updateTestRun);
router.post('/:id/images', upload.array('screenshots', 5), uploadScreenshots);

export default router;
