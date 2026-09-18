import { Router } from 'express';
import { listAvailableRepos, connectRepo, listConnectedRepos, getRepoAnalyses } from '../controller/repo.controller';
import { isloggedin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', isloggedin, listConnectedRepos);
router.get('/available', isloggedin, listAvailableRepos);
router.get('/:repoId/analyses', isloggedin, getRepoAnalyses);
router.post('/connect', isloggedin, connectRepo);

export default router;