import * as pokemonRepository from '../repositories/pokemonRepository.js';
import { config } from '../config/index.js';

/**
 * Format Pokemon name for display
 * "mr-mime" → "Mr Mime"
 */
const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format stat names for display
 */
const formatStatName = (name) => {
  const statNames = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed'
  };
  return statNames[name] || formatName(name);
};

/**
 * Transform raw Pokemon data into display-ready format
 */
const formatPokemonData = (pokemon, species = null) => {
  // Get English description from species data
  const description =
    species?.flavor_text_entries
      ?.find((entry) => entry.language.name === 'en')
      ?.flavor_text?.replace(/\f/g, ' ') || 'No description available.';

  // Get English genus (e.g., "Mouse Pokémon")
  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus || 'Unknown';

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatName(pokemon.name),

    // Get best available image
    image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
    sprite: pokemon.sprites.front_default,

    // Simplify types array
    types: pokemon.types.map((t) => t.type.name),

    // Convert units
    height: pokemon.height / 10, // decimeters → meters
    weight: pokemon.weight / 10, // hectograms → kilograms

    // Format abilities
    abilities: pokemon.abilities.map((a) => ({
      name: formatName(a.ability.name),
      isHidden: a.is_hidden
    })),

    // Format stats
    stats: pokemon.stats.map((s) => ({
      name: formatStatName(s.stat.name),
      value: s.base_stat
    })),

    // Add species data
    description,
    genus,
    color: species?.color?.name || 'gray',
    captureRate: species?.capture_rate || 0,
    baseHappiness: species?.base_happiness || 0
  };
};

export const getPokemonDetails = async (nameOrId) => {
  // Get basic Pokemon data
  const pokemon = await pokemonRepository.getPokemonByNameOrId(nameOrId);

  if (!pokemon) {
    return null; // Not found
  }

  // Try to get species data (for descriptions)
  let species = null;
  try {
    species = await pokemonRepository.getPokemonSpecies(pokemon.id);
  } catch {
    // Species data is optional - continue without it
  }

  // Format and return
  return formatPokemonData(pokemon, species);
};

export const getAllPokemon = async (page = 1, limit = config.pagination.defaultLimit) => {
  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Get list of Pokemon
  const data = await pokemonRepository.getAllPokemon(limit, offset);

  // Fetch details for each Pokemon
  const pokemonWithDetails = await Promise.all(
    data.results.map(async (pokemon) => {
      const details = await getPokemonDetails(pokemon.name);
      return details;
    })
  );

  // Return with pagination info
  return {
    pokemon: pokemonWithDetails,
    totalCount: data.count,
    currentPage: page,
    totalPages: Math.ceil(data.count / limit),
    hasNextPage: offset + limit < data.count,
    hasPrevPage: page > 1
  };
};

export const searchPokemon = async (query) => {
  // Handle empty query
  if (!query || query.trim().length === 0) {
    return { pokemon: [], totalCount: 0 };
  }

  // First try exact match (faster)
  const exactMatch = await pokemonRepository.getPokemonByNameOrId(query);
  if (exactMatch) {
    const formatted = await getPokemonDetails(query);
    return {
      pokemon: formatted ? [formatted] : [],
      totalCount: formatted ? 1 : 0
    };
  }

  // If no exact match, search by partial name
  const searchResults = await pokemonRepository.searchPokemon(query);

  // Get details for first 20 results
  const pokemonWithDetails = await Promise.all(
    searchResults.results.slice(0, 20).map((pokemon) => {
      return getPokemonDetails(pokemon.name);
    })
  );

  return {
    pokemon: pokemonWithDetails.filter((p) => p !== null),
    totalCount: searchResults.count
  };
};

export const getPokemonTypes = async () => {
  const types = await pokemonRepository.getPokemonTypes();

  return types
    // Remove special types
    .filter((t) => t.name !== 'unknown' && t.name !== 'shadow')
    // Format for display
    .map((t) => ({
      name: t.name,
      displayName: formatName(t.name)
    }));
};

export const getPokemonByType = async (
  typeName,
  page = 1,
  limit = config.pagination.defaultLimit
) => {
  const pokemonList = await pokemonRepository.getPokemonByType(typeName);

  if (!pokemonList) {
    return null; // Type not found
  }

  // Manual pagination (API returns all at once)
  const offset = (page - 1) * limit;
  const paginatedList = pokemonList.slice(offset, offset + limit);

  // Get details for this page
  const pokemonWithDetails = await Promise.all(
    paginatedList.map((pokemon) => {
      return getPokemonDetails(pokemon.name);
    })
  );

  return {
    pokemon: pokemonWithDetails.filter((p) => p !== null),
    type: typeName,
    totalCount: pokemonList.length,
    currentPage: page,
    totalPages: Math.ceil(pokemonList.length / limit),
    hasNextPage: offset + limit < pokemonList.length,
    hasPrevPage: page > 1
  };
};