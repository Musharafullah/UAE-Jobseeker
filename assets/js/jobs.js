(function () {
  const base = document.body.dataset.base || "./";
  const PAGE_SIZE = 10;
  
  const COUNTRIES = ["United Arab Emirates", "Qatar", "Saudi Arabia", "Pakistan"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const listEl = document.getElementById("jobsList");
  if (!listEl) return;

  const countEl = document.getElementById("jobCount");
  const pagerEl = document.getElementById("pager");
  const chipsEl = document.getElementById("activeChips");
  const countryEl = document.getElementById("countryList");
  const form = document.getElementById("filterForm");
  const fKeyword = document.getElementById("fKeyword");
  const fSort = document.getElementById("fSort");
  const fReset = document.getElementById("fReset");

  let jobs = [];
  let page = 1;
  let applied = { kw: "", countries: [] }; // filters Search dabane par lagte hain

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
  };

  const typeClass = (t) => "type-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  function buildCountries() {
    const counts = {};
    jobs.forEach((j) => (counts[j.country] = (counts[j.country] || 0) + 1));
    const all = [...new Set([...COUNTRIES, ...jobs.map((j) => j.country)])];

    countryEl.innerHTML = all
      .map((c, i) => {
        const n = counts[c] || 0;
        return `
        <div class="form-check">
        <input class="form-check-input country-check" type="checkbox" value="${esc(c)}" id="c${i}">
          <label class="form-check-label" for="c${i}">${esc(c)} (${n})</label>
        </div>`;
      })
      .join("");
  }

  const checkedCountries = () =>
    [...document.querySelectorAll(".country-check:checked")].map((el) => el.value);

  function jobCard(j) {
    const salary = j.salary ? esc(j.salary) : "TBD";
    return `
      <!-- START: Job Card Component -->
      <article class="job-card">
        <div class="job-top">
          <h3 class="job-title">${esc(j.title)}</h3>
          <span class="job-date"><i class="bi bi-calendar3"></i> ${fmtDate(j.date)}</span>
        </div>
        <div class="job-row">
          <span class="type-badge ${typeClass(j.type)}">${esc(j.type)}</span>
          <span><i class="bi bi-geo-alt"></i> ${esc(j.city)}, ${esc(j.country)}</span>
        </div>
        <div class="job-row">
          <span><i class="bi bi-cash-stack"></i> Salary: ${salary}</span>
        </div>
        <a href="job-details.html?id=${j.id}" class="job-link">View Details <i class="bi bi-arrow-right"></i></a>
      </article>
      <!-- END: Job Card Component -->`;
  }

  function renderChips() {
    const chips = [];
    if (applied.kw) chips.push({ label: `"${applied.kw}"`, clear: () => (fKeyword.value = "") });
    applied.countries.forEach((c) =>
      chips.push({
        label: c,
        clear: () => (document.querySelector(`.country-check[value="${c}"]`).checked = false),
      })
    );

    chipsEl.innerHTML = chips
      .map((c, i) => `<button type="button" class="filter-chip" data-i="${i}">${esc(c.label)} <i class="bi bi-x"></i></button>`)
      .join("");
    chipsEl.querySelectorAll(".filter-chip").forEach((btn) =>
      btn.addEventListener("click", () => {
        chips[btn.dataset.i].clear();
        applyFilters();
      })
    );
  }

    function renderPager(total) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    pagerEl.innerHTML = `
      <button type="button" class="pg-btn" data-dir="-1" ${page === 1 ? "disabled" : ""}>Previous</button>
      <span class="pg-page">Page ${page}</span>
      <button type="button" class="pg-btn" data-dir="1" ${page === pages ? "disabled" : ""}>Next</button>`;

    pagerEl.querySelectorAll(".pg-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        page += Number(btn.dataset.dir);
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
    );
  }

  function render() {
    const kw = applied.kw.toLowerCase();
    let result = jobs.filter(
      (j) =>
        (!kw || j.title.toLowerCase().includes(kw)) &&
        (!applied.countries.length || applied.countries.includes(j.country))
    );

    const sort = fSort.value;
    result.sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title)
      : sort === "old" ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
    );

    countEl.textContent = `${result.length} job${result.length === 1 ? "" : "s"} found`;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = result.slice(start, start + PAGE_SIZE);

    listEl.innerHTML = pageItems.length
      ? pageItems.map(jobCard).join("")
      : `<div class="empty-state"><i class="bi bi-search"></i><p>No jobs match your filters.</p></div>`;

    renderChips();
    renderPager(result.length);
  }

  function closeMobilePanel() {
    const panel = document.getElementById("filterPanel");
    const inst = window.bootstrap && bootstrap.Offcanvas.getInstance(panel);
    if (inst) inst.hide();
  }

  function applyFilters() {
    applied = { kw: fKeyword.value.trim(), countries: checkedCountries() };
    page = 1;
    render();
  }

  async function init() {
    try {
      const res = await fetch(`${base}data/jobs.json`);
      jobs = await res.json();
    } catch (err) {
      countEl.textContent = "Could not load jobs.";
      console.error("Jobs load failed", err);
      return;
    }

    buildCountries();

    // Home page ke search se aane wali value (?q=...)
    fKeyword.value = new URLSearchParams(location.search).get("q") || "";

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
      closeMobilePanel();
    });
    fReset.addEventListener("click", () => {
      fKeyword.value = "";
      document.querySelectorAll(".country-check").forEach((el) => (el.checked = false));
      applyFilters();
    });
    fSort.addEventListener("change", () => { page = 1; render(); });

    applyFilters();
  }

  init();
})();
