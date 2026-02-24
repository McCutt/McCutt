import { Router } from 'express';
import pokemonRoutes from './pokemonRoutes.js';

const router = Router();

// Mount all Pokemon routes at root
router.use('/', pokemonRoutes);

export default router;