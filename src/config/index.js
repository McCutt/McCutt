import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // Server settings
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // PokeAPI settings
  pokeapi: {
    baseUrl: process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2'
  },

  // Pagination settings
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT, 10) || 20,
    maxSearchLimit: parseInt(process.env.MAX_SEARCH_LIMIT, 10) || 1000
  }
};