import { Router } from 'express';
import { githubConnect, githubCallback } from '../controller/github.controller';
import { ensureValidSession } from '../middleware/auth.middleware';

const router = Router();

router.get('/connect', ensureValidSession, githubConnect);
router.get('/callback', ensureValidSession, githubCallback);

export default router;