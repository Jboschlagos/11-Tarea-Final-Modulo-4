const grid = document.getElementById("pokemonGrid");
const otherTypes = document.getElementById("otherTypes");

const modal = new bootstrap.Modal(document.getElementById("pokemonModal"));

const modalTitle = document.getElementById("modalTitle");
const modalImg = document.getElementById("modalImg");
const modalDesc = document.getElementById("modalDesc");
const modalHeight = document.getElementById("modalHeight");
const modalWeight = document.getElementById("modalWeight");
const modalTypes = document.getElementById("modalTypes");

const BASE = "https://pokeapi.co/api/v2";
const MAIN_TYPES = ["fire", "water", "grass", "electric"];

/* INIT */
loadPokemons();
loadOtherTypes();

/* POKEMON BASE */
async function loadPokemons() {
  grid.innerHTML = "";

  const res = await fetch(`${BASE}/pokemon?limit=12`);
  const data = await res.json();

  const pokemons = await Promise.all(
    data.results.map(p => fetch(p.url).then(r => r.json()))
  );

  render(pokemons);
}

/* POR TIPO */
async function loadByType(type) {
  grid.innerHTML = "";

  const res = await fetch(`${BASE}/type/${type}`);
  const data = await res.json();

  const slice = data.pokemon.slice(0, 12);

  const pokemons = await Promise.all(
    slice.map(p => fetch(p.pokemon.url).then(r => r.json()))
  );

  render(pokemons);
}

/* OTROS TIPOS */
async function loadOtherTypes() {
  const res = await fetch(`${BASE}/type`);
  const data = await res.json();

  data.results
    .filter(t => !MAIN_TYPES.includes(t.name))
    .forEach(type => {
      otherTypes.innerHTML += `
        <li>
          <a class="dropdown-item text-capitalize"
             href="#"
             onclick="loadByType('${type.name}')">
            ${type.name}
          </a>
        </li>
      `;
    });
}

// otras funciones
loadPokemons();
loadOtherTypes();

// 👇 ACÁ
function setActive(button) {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => tab.classList.remove("active"));
  button.classList.add("active");
}

/* RENDER */
function render(list) {
  grid.innerHTML = "";

  list.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-3";

    col.innerHTML = `
      <div class="poke-card">
        <img src="${p.sprites.front_default}">
        <h6 class="text-capitalize">${p.name}</h6>
        <div>
          ${p.types.map(t =>
            `<span class="type ${t.type.name}">${t.type.name}</span>`
          ).join("")}
        </div>
        <button class="btn btn-sm btn-dark mt-2" onclick="openModal(${p.id})">
          Ver más
        </button>
      </div>
    `;

    grid.appendChild(col);
  });
}

/* MODAL */
async function openModal(id) {
  const pokemon = await fetch(`${BASE}/pokemon/${id}`).then(r => r.json());
  const species = await fetch(`${BASE}/pokemon-species/${id}`).then(r => r.json());

  const desc =
    species.flavor_text_entries.find(d => d.language.name === "es") ||
    species.flavor_text_entries[0];

  modalTitle.textContent = pokemon.name;
  modalImg.src = pokemon.sprites.other["official-artwork"].front_default;
  modalHeight.textContent = pokemon.height / 10 + " m";
  modalWeight.textContent = pokemon.weight / 10 + " kg";
  modalDesc.textContent = desc.flavor_text.replace(/\n/g, " ");

  modalTypes.innerHTML = pokemon.types.map(t =>
    `<span class="type ${t.type.name}">${t.type.name}</span>`
  ).join("");

  modal.show();
}
