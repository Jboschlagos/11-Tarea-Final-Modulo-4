const grid = document.getElementById("pokemonGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const modal = new bootstrap.Modal(document.getElementById("pokemonModal"));
const modalTitle = document.getElementById("modalTitle");
const modalImg = document.getElementById("modalImg");
const modalDesc = document.getElementById("modalDesc");
const modalHeight = document.getElementById("modalHeight");
const modalWeight = document.getElementById("modalWeight");
const modalTypes = document.getElementById("modalTypes");

const BASE = "https://pokeapi.co/api/v2";
const LIMIT = 12;

let currentList = [];
let offset = 0;
let currentType = "all";

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  loadAll();
  setupTabs();
});

/* CARGA GENERAL */
async function loadAll() {
  const res = await fetch(`${BASE}/pokemon?limit=100`);
  const data = await res.json();
  currentList = await Promise.all(
    data.results.map((p) => fetch(p.url).then((r) => r.json()))
  );
  resetAndRender();
}

/* POR TIPO */
async function loadByType(type) {
  const res = await fetch(`${BASE}/type/${type}`);
  const data = await res.json();
  currentList = await Promise.all(
    data.pokemon.map((p) => fetch(p.pokemon.url).then((r) => r.json()))
  );
  resetAndRender();
}

/* RENDER */
function renderMore() {
  const slice = currentList.slice(offset, offset + LIMIT);
  slice.forEach((p) => createCard(p));
  offset += LIMIT;

  loadMoreBtn.classList.toggle("d-none", offset >= currentList.length);
}

function resetAndRender() {
  grid.innerHTML = "";
  offset = 0;
  renderMore();
}

/* CARD */
function createCard(pokemon) {
  const col = document.createElement("div");
  col.className = "col-6 col-md-3";

  col.innerHTML = `
    <div class="poke-card">
      <img src="${pokemon.sprites.front_default}">
      <h6 class="text-capitalize">${pokemon.name}</h6>
      <div>
        ${pokemon.types
          .map((t) => `<span class="type ${t.type.name}">${t.type.name}</span>`)
          .join("")}
      </div>
      <button class="btn btn-sm btn-dark mt-2">Ver más</button>
    </div>
  `;

  col.querySelector("button").addEventListener("click", () => {
    openModal(pokemon.id);
  });

  grid.appendChild(col);
}

/* MODAL */
async function openModal(id) {
  const pokemon = await fetch(`${BASE}/pokemon/${id}`).then((r) => r.json());
  const species = await fetch(`${BASE}/pokemon-species/${id}`).then((r) =>
    r.json()
  );

  const desc =
    species.flavor_text_entries.find((d) => d.language.name === "es") ||
    species.flavor_text_entries[0];

  modalTitle.textContent = pokemon.name;
  modalImg.src = pokemon.sprites.other["official-artwork"].front_default;
  modalDesc.textContent = desc.flavor_text.replace(/\n/g, " ");
  modalHeight.textContent = pokemon.height / 10 + " m";
  modalWeight.textContent = pokemon.weight / 10 + " kg";

  modalTypes.innerHTML = pokemon.types
    .map((t) => `<span class="type ${t.type.name}">${t.type.name}</span>`)
    .join("");

  modal.show();
}

/* TABS */
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentType = btn.dataset.type;
      currentType === "all" ? loadAll() : loadByType(currentType);
    });
  });

  loadMoreBtn.addEventListener("click", renderMore);
}
