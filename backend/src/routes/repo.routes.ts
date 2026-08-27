import { Router } from 'express';
import { listAvailableRepos, connectRepo } from '../controller/repo.controller';
import { isloggedin } from '../middleware/auth.middleware';

const router = Router();

router.get('/available', isloggedin, listAvailableRepos);
router.post('/connect', isloggedin, connectRepo);

export default router;