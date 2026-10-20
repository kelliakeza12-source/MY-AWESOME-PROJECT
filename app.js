const Tugendane = {
  keys: {
    user: "tugendane_user",
    paid: "tugendane_paid",
    balance: "tugendane_balance",
    ideas: "tugendane_ideas",
    lang: "tugendane_lang",
  },

  getLang() {
    const saved = localStorage.getItem(this.keys.lang);
    return saved === "rw" || saved === "fr" || saved === "en" ? saved : "en";
  },

  hasLangChoice() {
    return localStorage.getItem(this.keys.lang) !== null;
  },

  setLang(code) {
    const lang = code === "rw" || code === "fr" ? code : "en";
    localStorage.setItem(this.keys.lang, lang);
    document.documentElement.lang = lang;
    this.applyI18n();
    window.dispatchEvent(new CustomEvent("tugendane:lang"));
  },

  t(key, vars) {
    const table = I18N[this.getLang()] || I18N.en;
    let str = table[key] || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replaceAll("{" + k + "}", String(vars[k]));
      });
    }
    return str;
  },

  applyI18n(root) {
    const scope = root || document;
    document.documentElement.lang = this.getLang();
    const pageTitle = document.body?.dataset?.titleKey;
    if (pageTitle) document.title = this.t(pageTitle);
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", this.t(el.dataset.i18nPlaceholder));
    });
    this.paintLangButtons(scope);
  },

  langButtons() {
    const current = this.getLang();
    return ["rw", "en", "fr"]
      .map((code) => {
        const label = code === "rw" ? "KIN" : code === "fr" ? "FRA" : "ENG";
        const on = current === code;
        return `<button type="button" data-set-lang="${code}" class="rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${
          on ? "bg-sky-400 text-[#04261c]" : "bg-white/10 text-emerald-100/80"
        }">${label}</button>`;
      })
      .join("");
  },

  paintLangButtons(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-lang-switch]").forEach((el) => {
      el.innerHTML = this.langButtons();
    });
    scope.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.addEventListener("click", () => this.setLang(btn.dataset.setLang));
    });
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.user) || "null");
    } catch {
      return null;
    }
  },

  saveUser(user) {
    localStorage.setItem(this.keys.user, JSON.stringify(user));
  },

  isPaid() {
    return localStorage.getItem(this.keys.paid) === "1";
  },

  markPaid() {
    localStorage.setItem(this.keys.paid, "1");
    if (this.getBalance() === null) this.setBalance(4500);
  },

  getBalance() {
    const raw = localStorage.getItem(this.keys.balance);
    return raw === null ? null : Number(raw);
  },

  setBalance(amount) {
    localStorage.setItem(this.keys.balance, String(amount));
  },

  addBalance(amount) {
    const current = this.getBalance() ?? 4500;
    const next = current + amount;
    this.setBalance(next);
    return next;
  },

  requirePaid() {
    if (!this.getUser() || !this.isPaid()) {
      window.location.href = "index.html";
    }
  },

  formatRwf(n) {
    return Number(n).toLocaleString("en-RW") + " RWF";
  },

  getIdeas() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.ideas) || "[]");
    } catch {
      return [];
    }
  },

  saveIdea(idea) {
    const ideas = this.getIdeas();
    ideas.unshift(idea);
    localStorage.setItem(this.keys.ideas, JSON.stringify(ideas));
  },

  nav(active) {
    const items = [
      {
        id: "home",
        href: "index.html",
        label: this.t("navHome"),
        icon: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" fill="currentColor"/>',
      },
      {
        id: "places",
        href: "commerce.html",
        label: this.t("navPlaces"),
        icon: '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/>',
      },
      {
        id: "routes",
        href: "routes.html",
        label: this.t("navRoutes"),
        icon: '<path d="M7 4a3 3 0 0 0-3 3v1h4V4H7Zm9 0h-3v4h6V7a3 3 0 0 0-3-3ZM4 11v6a3 3 0 0 0 3 3h3v-4H4Zm10 9h3a3 3 0 0 0 3-3v-6h-6v9Z" fill="currentColor"/>',
      },
      {
        id: "ideas",
        href: "feedback.html",
        label: this.t("navIdeas"),
        icon: '<path d="M9 21h6v-1.2a7 7 0 1 0-6 0V21Zm1-3.5.4-.2A5 5 0 1 1 13.8 17l.2.2V19h-4v-1.5Z" fill="currentColor"/>',
      },
    ];

    return `
      <nav class="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#05261d]/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div class="grid grid-cols-4 gap-1">
          ${items
            .map((item) => {
              const on = item.id === active;
              return `
                <a href="${item.href}" class="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${on ? "bg-white/10 text-white" : "text-emerald-100/60"}">
                  <svg viewBox="0 0 24 24" class="h-5 w-5">${item.icon}</svg>
                  ${item.label}
                </a>`;
            })
            .join("")}
        </div>
      </nav>`;
  },
};
