(function () {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  const base = document.body.dataset.base || "./";
  const pagerEl = document.getElementById("blogPager");

  // Tasveerein abhi original server se aati hain.
  // Local karne ke liye: tasveerein assets/images/blog/ mein rakho aur ye line badlo:
  // const IMAGE_BASE = base + "assets/images/blog/";
  const IMAGE_BASE = "https://uaejobseekers.com/Blog-Images/";
  const PAGE_SIZE = 12;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  function card(b) {
    const link = `blog-details.html?id=${b.id}`;
    return `
      <!-- START: Blog Card Component -->
      <div class="col-md-6 col-lg-4">
        <article class="blog-card">
          <a href="${link}" class="blog-thumb" tabindex="-1" aria-hidden="true">
            <img src="${IMAGE_BASE}${b.image}" alt="" loading="lazy"
                 onerror="this.closest('.blog-thumb').classList.add('no-img')">
          </a>
          <div class="blog-body">
            <p class="blog-date">${fmtDate(b.date)}</p>
            <h3 class="blog-title"><a href="${link}">${esc(b.title)}</a></h3>
            <a href="${link}" class="btn btn-olive-outline">Read More</a>
          </div>
        </article>
      </div>
      <!-- END: Blog Card Component -->`;
  }

  // Original jaisa pager: 1 2 3 ... 22 »   (doosre page par « bhi)
  function renderPager(page, pages) {
    if (pages <= 1) { pagerEl.innerHTML = ""; return; }

    const show = new Set([1, pages, page - 1, page, page + 1]);
    if (page <= 2) show.add(3);
    const list = [...show].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

    const link = (p, label, active) =>
      `<li class="page-item ${active ? "active" : ""}"><a class="page-link" href="?page=${p}">${label}</a></li>`;

    let html = "";
    if (page > 1) html += link(page - 1, "&laquo;");

    let prev = 0;
    list.forEach((p) => {
      if (p - prev > 1) html += `<li class="page-item disabled"><span class="page-link">&hellip;</span></li>`;
      html += link(p, p, p === page);
      prev = p;
    });

    if (page < pages) html += link(page + 1, "&raquo;");
    pagerEl.innerHTML = html;
  }

  async function init() {
    let blogs = [];
    try {
      const res = await fetch(`${base}data/blogs.json`);
      blogs = await res.json();
    } catch (err) {
      grid.innerHTML = `<div class="col-12"><div class="empty-state"><i class="bi bi-exclamation-circle"></i><p>Could not load the blogs.</p></div></div>`;
      console.error("Blogs load failed", err);
      return;
    }

    const pages = Math.max(1, Math.ceil(blogs.length / PAGE_SIZE));
    let page = Number(new URLSearchParams(location.search).get("page")) || 1;
    page = Math.min(Math.max(page, 1), pages);

    const start = (page - 1) * PAGE_SIZE;
    grid.innerHTML = blogs.slice(start, start + PAGE_SIZE).map(card).join("");
    renderPager(page, pages);
  }

  init();
})();