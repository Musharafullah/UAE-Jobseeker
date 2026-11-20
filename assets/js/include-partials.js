const base = document.body.dataset.base || "./";

async function fetchPartial(file) {
  const res = await fetch(`${base}partials/${file}`);
  if (!res.ok) throw new Error(res.status);
  const html = await res.text();
  return html.replaceAll("{{base}}", base);
}

async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    el.innerHTML = await fetchPartial(file);
  } catch (err) {
    console.error(`Partial load failed: ${file}`, err);
  }
}

async function loadFloatingActions() {
  try {
    document.body.insertAdjacentHTML("beforeend", await fetchPartial("floating-actions.html"));
    const btn = document.getElementById("backToTop");
    const toggle = () => btn.classList.toggle("show", window.scrollY > 300);
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  } catch (err) {
    console.error("Floating actions load failed", err);
  }
}

// Share tab sirf un pages par aata hai jinke <body> mein "data-share" likha ho
async function loadShareTab() {
  if (!document.body.hasAttribute("data-share")) return;
  try {
    document.body.insertAdjacentHTML("beforeend", await fetchPartial("share-tab.html"));

    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(document.title);
    const setHref = (id, href) => (document.getElementById(id).href = href);

    setHref("stWa", `https://wa.me/?text=${text}%20${url}`);
    setHref("stIn", `https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
    setHref("stX", `https://twitter.com/intent/tweet?url=${url}&text=${text}`);
    setHref("stFb", `https://www.facebook.com/sharer/sharer.php?u=${url}`);
    setHref("stTg", `https://t.me/share/url?url=${url}&text=${text}`);

    const tab = document.getElementById("shareTab");
    const toggleBtn = document.getElementById("shareToggle");
    toggleBtn.addEventListener("click", () => {
      const open = tab.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", open);
    });

    const nativeBtn = document.getElementById("stNative");
    if (navigator.share) {
      nativeBtn.addEventListener("click", () =>
        navigator.share({ title: document.title, url: location.href }).catch(() => {})
      );
    } else {
      nativeBtn.remove();
    }
  } catch (err) {
    console.error("Share tab load failed", err);
  }
}

document.addEventListener("click", (e) => {
  const downloadItem = e.target.closest(".download-login-alert");
  if (!downloadItem) return;

  e.preventDefault();
  alert("Please Login to access this document.");
});

loadPartial("navbar", "navbar.html");
loadPartial("newsletter", "newsletter.html");
loadPartial("footer", "footer.html");
loadFloatingActions();
loadShareTab();