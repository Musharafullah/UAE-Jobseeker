(function () {
  const basePath = document.body.dataset.base || "./";
  const CHANNEL_URL = "https://whatsapp.com/channel/0029VaAd1HWEAKW8Al8BgS2P";

  /* ===== FAQ (data/faqs.json se) ===== */
  async function renderFaqs() {
    const box = document.getElementById("faqAccordion");
    if (!box) return;
    try {
      const res = await fetch(`${basePath}data/faqs.json`);
      const faqs = await res.json();
      box.innerHTML = faqs.map((f, i) => `
        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq${i}">
              ${f.question}
            </button>
          </h3>
          <div id="faq${i}" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">${f.answer}</div>
          </div>
        </div>`).join("");
    } catch (err) {
      console.error("FAQ load failed", err);
    }
  }

  /* ===== WhatsApp QR code ===== */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function renderQr() {
    const box = document.getElementById("waQr");
    if (!box) return;
    try {
      if (typeof QRCode === "undefined") {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
      }
      new QRCode(box, {
        text: CHANNEL_URL,
        width: 200,
        height: 200,
        colorDark: "#2b2d2a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (err) {
      console.error("QR code failed", err);
      box.innerHTML = `<a href="${CHANNEL_URL}" target="_blank" rel="noopener" class="btn btn-olive">Open the channel</a>`;
    }
  }

  renderFaqs();
  renderQr();
})();