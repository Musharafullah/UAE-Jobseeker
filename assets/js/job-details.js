(function () {
  const base = document.body.dataset.base || "./";
  const titleEl = document.getElementById("jobTitle");
  if (!titleEl) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  function showNotFound() {
    titleEl.textContent = "Job not found";
    document.getElementById("jobContent").classList.add("d-none");
    document.getElementById("jobNotFound").classList.remove("d-none");
  }

  function renderHeader(job) {
    const parts = [job.country, job.city, job.type, `Salary: ${job.salary || "TBD"}`];
    document.getElementById("headerMeta").innerHTML = parts.map((p) => `<span>${esc(p)}</span>`).join("");
  }

  function renderInfo(job) {
    const items = [
      ["Company", job.company],
      ["Industry", job.industry],
      ["Job Function", job.jobFunction],
      ["Experience", job.experience],
      ["Education", job.education],
      ["Post Date", fmtDate(job.date)],
    ].filter(([, value]) => value);

    document.getElementById("infoGrid").innerHTML = items
      .map(
        ([label, value]) => `
        <div class="col-6 col-md-4">
          <div class="info-label">${label}</div>
          <div class="info-value">${esc(value)}</div>
        </div>`
      )
      .join("");
  }

  function renderDescription(job) {
    let html = "";

    if (job.points && job.points.length) {
      html += `<h2 class="detail-heading">${esc(job.pointsTitle || "Job Requirements")}</h2>
               <ul class="check-list">${job.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;
    }

    if (job.description) {
      html += `<h2 class="detail-heading">Job Description</h2>` +
        job.description
          .split(/\n\s*\n/)
          .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
          .join("");
    }

    if (!html) {
      html = `<h2 class="detail-heading">Job Description</h2>
              <p class="text-muted-uaejs mb-0">The full description for this job has not been added yet.</p>`;
    }

    document.getElementById("jobDescription").innerHTML = html;
  }

  function renderApply(job) {
    if (!job.applyUrl) return;
    document.getElementById("applyBox").innerHTML =
      `<a href="${esc(job.applyUrl)}" target="_blank" rel="noopener" class="btn btn-cta btn-lg">Apply Now</a>`;
    document.getElementById("applyCard").classList.remove("d-none");
  }

  function renderSimilar(job, all) {
    const list = all
      .filter((j) => j.id !== job.id && (j.city === job.city || j.type === job.type))
      .slice(0, 8);

    if (!list.length) {
      document.getElementById("similarBox").classList.add("d-none");
      return;
    }

    document.getElementById("similarList").innerHTML = list
      .map(
        (j) => `
        <a href="job-details.html?id=${j.id}" class="similar-job">
          <span class="similar-title">${esc(j.title)}</span>
          <span class="similar-meta"><i class="bi bi-geo-alt"></i> ${esc(j.city)}, ${esc(j.country)}</span>
          <span class="similar-link">View Details <i class="bi bi-arrow-right-short"></i></span>
        </a>`
      )
      .join("");
  }

  function setupShare(job) {
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(job.title);
    document.getElementById("shWa").href = `https://wa.me/?text=${text}%20${url}`;
    document.getElementById("shIn").href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    document.getElementById("shX").href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    document.getElementById("shFb").href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    document.getElementById("shTg").href = `https://t.me/share/url?url=${url}&text=${text}`;
  }

  async function init() {
    const id = Number(new URLSearchParams(location.search).get("id"));
    let jobs = [];
    try {
      const res = await fetch(`${base}data/jobs.json`);
      jobs = await res.json();
    } catch (err) {
      console.error("Jobs load failed", err);
      return showNotFound();
    }

    const job = jobs.find((j) => j.id === id);
    if (!job) return showNotFound();

    document.title = `${job.title} - UAE Job Seekers`;
    titleEl.textContent = job.title;

    renderHeader(job);
    renderInfo(job);
    renderDescription(job);
    renderApply(job);
    renderSimilar(job, jobs);
    setupShare(job);
  }

  init();
})();