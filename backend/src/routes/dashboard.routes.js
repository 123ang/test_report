import express from 'express';
import {
  getSummary,
  getTrends,
  getByApp,
  getRecent
} from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/by-app', getByApp);
router.get('/recent', getRecent);

export default router;
