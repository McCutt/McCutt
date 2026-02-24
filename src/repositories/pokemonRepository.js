import axios from 'axios';
import { config } from '../config/index.js';

// Get the base URL from config
const { baseUrl: BASE_URL } = config.pokeapi;

/**
 * Fetch a paginated list of all Pokemon
 * @param {number} limit - Number of Pokemon to fetch
 * @param {number} offset - Starting position
 * @returns {Promise<Object>} - List of Pokemon with count
 */
export const getAllPokemon = async (limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch Pokemon list: ${error.message}`);
  }
};

/**
 * Fetch a single Pokemon by name or ID
 * @param {string|number} nameOrId - Pokemon name or ID
 * @returns {Promise<Object|null>} - Pokemon data or null if not found
 */
export const getPokemonByNameOrId = async (nameOrId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/pokemon/${nameOrId.toString().toLowerCase()}`
    );
    return response.data;
  } catch (error) {
    // Return null for 404 (not found) instead of throwing
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch Pokemon: ${error.message}`);
  }
};

/**
 * Fetch Pokemon species data (for descriptions)
 * @param {string|number} nameOrId - Pokemon name or ID
 * @returns {Promise<Object|null>} - Species data or null if not found
 */
export const getPokemonSpecies = async (nameOrId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/pokemon-species/${nameOrId.toString().toLowerCase()}`
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch Pokemon species: ${error.message}`);
  }
};

/**
 * Search Pokemon by name
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to search through
 * @returns {Promise<Object>} - Filtered Pokemon list
 */
export const searchPokemon = async (query, limit = config.pagination.maxSearchLimit) => {
  try {
    // Fetch all Pokemon up to the limit
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: { limit, offset: 0 }
    });

    // Filter by name locally
    const allPokemon = response.data.results;
    const filtered = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    );

    return {
      count: filtered.length,
      results: filtered
    };
  } catch (error) {
    throw new Error(`Failed to search Pokemon: ${error.message}`);
  }
};

/**
 * Fetch all Pokemon types
 * @returns {Promise<Array>} - List of types
 */
export const getPokemonTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/type`);
    return response.data.results;
  } catch (error) {
    throw new Error(`Failed to fetch Pokemon types: ${error.message}`);
  }
};

/**
 * Fetch all Pokemon of a specific type
 * @param {string} typeName - Type name (e.g., "electric")
 * @returns {Promise<Array|null>} - List of Pokemon or null if type not found
 */
export const getPokemonByType = async (typeName) => {
  try {
    const response = await axios.get(`${BASE_URL}/type/${typeName.toLowerCase()}`);
    // Extract just the Pokemon info from the nested structure
    return response.data.pokemon.map((p) => p.pokemon);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch Pokemon by type: ${error.message}`);
  }
};

