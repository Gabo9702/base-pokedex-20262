// Referencias a los elementos del DOM
const input = document.getElementById('pokemon-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');

// URL base de la PokeAPI
const API_URL = 'https://pokeapi.co/api/v2/pokemon/';

// Contador para descartar respuestas de búsquedas obsoletas (condición de carrera)
let currentRequestId = 0;

// Función principal: busca el Pokémon usando fetch + async/await
async function searchPokemon() {
  const query = input.value.trim().toLowerCase();

  // Validación básica: que no esté vacío
  if (!query) {
    resultContainer.innerHTML = `
      <p class="text-gray-500">Escribe un nombre o ID para buscar.</p>
    `;
    return;
  }

  const requestId = ++currentRequestId;
  searchBtn.disabled = true;

  // Mensaje de carga mientras llega la respuesta
  resultContainer.innerHTML = `<p class="text-gray-500">Buscando...</p>`;

  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);

    // Si la API responde con error (404, etc.), lo tratamos como "no encontrado"
    if (!response.ok) {
      throw new Error('Pokémon no encontrado');
    }

    const data = await response.json();

    // La "especie" real (ej. "Pokémon Ratón") viene del endpoint pokemon-species,
    // no del nombre del recurso species (que casi siempre coincide con el nombre).
    let species = data.species.name;
    try {
      const speciesResponse = await fetch(data.species.url);
      if (speciesResponse.ok) {
        const speciesData = await speciesResponse.json();
        const genus =
          speciesData.genera.find(g => g.language.name === 'es') ||
          speciesData.genera.find(g => g.language.name === 'en');
        if (genus) species = genus.genus;
      }
    } catch (_) {
      // Si falla, nos quedamos con el nombre de especie como respaldo
    }

    // Si el usuario ya disparó otra búsqueda mientras esta esperaba, se descarta
    if (requestId !== currentRequestId) return;

    renderPokemon(data, species);
  } catch (error) {
    if (requestId !== currentRequestId) return;
    resultContainer.innerHTML = `
      <p class="text-red-500 font-medium">
        ❌ Pokémon no encontrado. Verifica el nombre o ID e intenta de nuevo.
      </p>
    `;
  } finally {
    if (requestId === currentRequestId) searchBtn.disabled = false;
  }
}

// Función que toma el JSON de la API y pinta la información en el DOM
function renderPokemon(data, species) {
  const id = data.id;
  const name = data.name;
  const sprite = data.sprites.front_default || 'https://placehold.co/128x128?text=%3F';

  // data.types es un array de objetos: [{ slot: 1, type: { name: 'electric' } }, ...]
  // Extraemos solo el nombre de cada tipo y los unimos en un string
  const types = data.types.map(t => t.type.name).join(', ');

  resultContainer.innerHTML = `
    <img src="${sprite}" alt="${name}" class="mx-auto mb-4 w-32 h-32" />
    <h2 class="text-xl font-semibold text-gray-800 capitalize">${name}</h2>
    <p class="text-gray-500 mb-2">ID: #${id}</p>
    <p class="text-gray-700"><span class="font-medium">Especie:</span> <span class="capitalize">${species}</span></p>
    <p class="text-gray-700"><span class="font-medium">Tipo(s):</span> <span class="capitalize">${types}</span></p>
  `;
}

// Evento: clic en el botón
searchBtn.addEventListener('click', searchPokemon);

// Evento: tecla Enter dentro del input
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchPokemon();
  }
});