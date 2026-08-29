import { Router } from 'express';
import { githubConnect, githubCallback } from '../controller/github.controller';
import { isloggedin } from '../middleware/auth.middleware';

const router = Router();

router.get('/connect', isloggedin, githubConnect);
router.get('/callback', isloggedin, githubCallback);

export default router;