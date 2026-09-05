const state = { games: [], filter: "All", accountMode: "login" };
const modal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById("accountModal"));

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  bindFilters();
  bindAccountButtons();
  bindContact();
  await Promise.all([loadGames(), checkApi()]);
});

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

async function loadGames() {
  try {
    const data = await api("/api/games");
    state.games = data.games || [];
    renderGames();
  } catch (error) {
    document.getElementById("gameGrid").innerHTML =
      `<div class="col-12"><div class="empty-state">Unable to load the game lobby.</div></div>`;
  }
}

function renderGames() {
  const grid = document.getElementById("gameGrid");
  const empty = document.getElementById("gameEmpty");
  const list = state.games.filter(g => state.filter === "All" || g.category === state.filter);
  empty.classList.toggle("d-none", list.length !== 0);
  grid.innerHTML = list.map(g => `
    <div class="col-sm-6 col-lg-3">
      <article class="game-card">
        <img class="game-image" src="${g.image}" alt="${escapeHtml(g.name)}" loading="lazy">
        <div class="game-body">
          <h3 class="game-name">${escapeHtml(g.name)}</h3>
          <div class="game-meta">${escapeHtml(g.category)} · Demo</div>
          <button class="btn btn-brand play-btn" data-game="${g.id}">Play Demo</button>
        </div>
      </article>
    </div>
  `).join("");
  grid.querySelectorAll("[data-game]").forEach(btn => {
    btn.addEventListener("click", () => {
      alert("Demo mode: connect your authorized game provider here before production.");
    });
  });
}

function bindFilters() {
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.dataset.filter;
      renderGames();
    });
  });
}

function bindAccountButtons() {
  document.querySelectorAll('[data-action="login"]').forEach(btn => btn.addEventListener("click", () => openAccount("login")));
  document.querySelectorAll('[data-action="register"]').forEach(btn => btn.addEventListener("click", () => openAccount("register")));

  document.getElementById("accountForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const status = document.getElementById("accountStatus");
    status.textContent = "Connecting…";
    try {
      const endpoint = state.accountMode === "register" ? "/api/register" : "/api/login";
      const data = await api(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      localStorage.setItem("paqaobet30_token", data.token);
      status.textContent = `Welcome, ${data.user.username}.`;
      setTimeout(() => modal().hide(), 700);
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

function openAccount(mode) {
  state.accountMode = mode;
  document.getElementById("accountTitle").textContent = mode === "register" ? "Create Account" : "Login";
  document.getElementById("accountStatus").textContent = "";
  document.getElementById("username").value = "";
  modal().show();
}

async function checkApi() {
  const dot = document.getElementById("statusDot");
  const label = document.getElementById("apiStatus");
  try {
    await api("/api/health");
    dot.className = "status-dot ok";
    label.textContent = "Backend connected";
  } catch {
    dot.className = "status-dot bad";
    label.textContent = "Backend unavailable";
  }
}

function bindContact() {
  document.getElementById("contactForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById("contactStatus");
    status.textContent = "Sending…";
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const data = await api("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      status.textContent = data.message;
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}
