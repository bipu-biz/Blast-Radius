import { Router } from 'express';
import { githubWebhook } from '../controller/webhook.controller';

const router = Router();

router.post('/github', githubWebhook);

export default router;