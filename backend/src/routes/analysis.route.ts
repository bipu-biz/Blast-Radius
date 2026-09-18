import { Router } from 'express';
import { getAnalysisById } from '../controller/repo.controller';
import { isloggedin } from '../middleware/auth.middleware';

const router = Router();

router.get('/:analysisId', isloggedin, getAnalysisById);

export default router;