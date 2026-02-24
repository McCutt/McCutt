import * as pokemonService from '../services/pokemonService.js';

// ============================================
// VIEW CONTROLLERS (Return HTML via EJS)
// ============================================

/**
 * Home page - List all Pokemon with pagination
 */
export const getHomePage = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Fetch data from services
    const data = await pokemonService.getAllPokemon(page, limit);
    const types = await pokemonService.getPokemonTypes();

    // Render the index template
    res.render('index', {
      ...data,
      types,
      searchQuery: '',
      selectedType: ''
    });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Failed to load Pokemon',
      error: error.message
    });
  }
};

/**
 * Pokemon detail page
 */
export const getPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const pokemon = await pokemonService.getPokemonDetails(nameOrId);

    if (!pokemon) {
      return res.status(404).render('error', {
        message: 'Pokemon not found',
        error: `No Pokemon found with name or ID: ${nameOrId}`
      });
    }

    res.render('pokemon', { pokemon });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Failed to load Pokemon details',
      error: error.message
    });
  }
};

/**
 * Search results page
 */
export const searchPokemon = async (req, res) => {
  try {
    const { q } = req.query;
    const types = await pokemonService.getPokemonTypes();
    const data = await pokemonService.searchPokemon(q);

    res.render('index', {
      ...data,
      types,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      searchQuery: q || '',
      selectedType: ''
    });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Filter by type page
 */
export const getPokemonByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const types = await pokemonService.getPokemonTypes();
    const data = await pokemonService.getPokemonByType(type, page);

    if (!data) {
      return res.status(404).render('error', {
        message: 'Type not found',
        error: `No Pokemon type found: ${type}`
      });
    }

    res.render('index', {
      ...data,
      types,
      searchQuery: '',
      selectedType: type
    });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Failed to load Pokemon by type',
      error: error.message
    });
  }
};

// ============================================
// API CONTROLLERS (Return JSON)
// ============================================

/**
 * API: Get all Pokemon
 */
export const apiGetAllPokemon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const data = await pokemonService.getAllPokemon(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get Pokemon by name or ID
 */
export const apiGetPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const pokemon = await pokemonService.getPokemonDetails(nameOrId);

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: `Pokemon not found: ${nameOrId}`
      });
    }

    res.json({ success: true, data: pokemon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Search Pokemon
 */
export const apiSearchPokemon = async (req, res) => {
  try {
    const { q } = req.query;
    const data = await pokemonService.searchPokemon(q);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get all types
 */
export const apiGetTypes = async (req, res) => {
  try {
    const types = await pokemonService.getPokemonTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get Pokemon by type
 */
export const apiGetPokemonByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const data = await pokemonService.getPokemonByType(type, page);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: `Type not found: ${type}`
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

