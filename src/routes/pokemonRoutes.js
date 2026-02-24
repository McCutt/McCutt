import { Router } from 'express';
import * as pokemonController from '../controllers/pokemonController.js';

const router = Router();

// ============================================
// VIEW ROUTES (Return HTML)
// ============================================

// Home page - list all Pokemon
router.get('/', pokemonController.getHomePage);

// Search Pokemon
router.get('/search', pokemonController.searchPokemon);

// Filter by type
router.get('/type/:type', pokemonController.getPokemonByType);

// Pokemon detail page
router.get('/pokemon/:nameOrId', pokemonController.getPokemonDetails);

// ============================================
// API ROUTES (Return JSON)
// ============================================

// Get all Pokemon (paginated)
router.get('/api/pokemon', pokemonController.apiGetAllPokemon);

// Search Pokemon
router.get('/api/pokemon/search', pokemonController.apiSearchPokemon);

// Get single Pokemon
router.get('/api/pokemon/:nameOrId', pokemonController.apiGetPokemonDetails);

// Get all types
router.get('/api/types', pokemonController.apiGetTypes);

// Get Pokemon by type
router.get('/api/types/:type', pokemonController.apiGetPokemonByType);

export default router;

