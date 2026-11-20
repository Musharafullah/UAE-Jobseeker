(function () {
  const root = document.getElementById("directory");
  if (!root) return;

  const base = document.body.dataset.base || "./";
  const source = root.dataset.source;
  const noun = root.dataset.noun || "item";
  const listed = (root.dataset.countries || "").split(",").map((s) => s.trim()).filter(Boolean);

  const countrySel = document.getElementById("dirCountry");
  const gridEl = document.getElementById("dirGrid");
  const countEl = document.getElementById("dirCount");

  let items = [];

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function buildCountries() {
    const all = [...new Set([...listed, ...items.map((i) => i.country)])];
    countrySel.innerHTML =
      `<option value="">All Countries</option>` + all.map((c) => `<option>${esc(c)}</option>`).join("");
  }

  function card(i) {
    return `
      <!-- START: Directory Card Component -->
      <div class="col-sm-6 col-lg-3">
        <article class="dcard">
          <div class="dcard-body">
            <span class="dcard-country"><i class="bi bi-geo-alt"></i> ${esc(i.country)}</span>
            <h3 class="dcard-name">${esc(i.name)}</h3>
          </div>
          <div class="dcard-foot">
            <a href="${esc(i.website)}" target="_blank" rel="noopener">Website</a>
            <a href="${esc(i.linkedin)}" target="_blank" rel="noopener" class="dcard-in" aria-label="${esc(i.name)} on LinkedIn">
              <i class="bi bi-linkedin"></i>
            </a>
          </div>
        </article>
      </div>
      <!-- END: Directory Card Component -->`;
  }

  function emptyState(country) {
    return `<div class="col-12"><div class="empty-state">
      <i class="bi bi-lock"></i>
      <p>No ${noun}s are listed for ${esc(country)} in the free preview.</p>
      <a href="${base}pages/auth/candidate-login.html" class="btn btn-olive btn-sm">Login to see the full list</a>
    </div></div>`;
  }

  function render() {
    const country = countrySel.value;
    const result = items.filter((i) => !country || i.country === country);

    countEl.textContent = `${result.length} ${noun}${result.length === 1 ? "" : "s"} found`;
    gridEl.innerHTML = result.length ? result.map(card).join("") : emptyState(country);
  }

  async function init() {
    try {
      const res = await fetch(`${base}${source}`);
      items = await res.json();
    } catch (err) {
      countEl.textContent = "Could not load the list.";
      console.error("Directory load failed", err);
      return;
    }
    buildCountries();
    countrySel.addEventListener("change", render);
    render();
  }

  init();
})();