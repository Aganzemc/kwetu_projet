import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// Alias pour compatibilité avec le frontend existant
router.post('/signup', register);

export default router;
