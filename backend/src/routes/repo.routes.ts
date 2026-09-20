import { Router } from 'express';
import { listAvailableRepos, connectRepo, listConnectedRepos, getRepoAnalyses, disconnectRepo } from '../controller/repo.controller';
import { isloggedin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', isloggedin, listConnectedRepos);
router.get('/available', isloggedin, listAvailableRepos);
router.get('/:repoId/analyses', isloggedin, getRepoAnalyses);
router.post('/connect', isloggedin, connectRepo);
router.delete('/:repoId', isloggedin, disconnectRepo);

export default router;