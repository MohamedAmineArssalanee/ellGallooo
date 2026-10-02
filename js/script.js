/* ==========================================================================
   eLL gAllo — Practical Activities Monitor
   Vanilla JS · JSON-driven content · EN/中文 languages · dark/light themes
   ========================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const FALLBACK_IMG =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#1b1b1e"/><rect x="24" y="24" width="552" height="752" fill="none" stroke="#2c2c30" stroke-width="2"/><text x="300" y="380" fill="#55555a" font-family="monospace" font-size="18" letter-spacing="4" text-anchor="middle">IMAGE</text><text x="300" y="412" fill="#55555a" font-family="monospace" font-size="13" letter-spacing="2" text-anchor="middle">PENDING</text></svg>`
    );

  const isPlaceholder = (url = "") =>
    !url || /replace[_\s-]*with/i.test(url) || /^(https?:\/\/)?example\.com\//i.test(url);

  const img = (url, attrs = "") =>
    `<img src="${isPlaceholder(url) ? FALLBACK_IMG : esc(url)}" ${attrs} loading="lazy" decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">`;

  const ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 6.2H21l-5 3.9 1.8 6.1-5.8-3.7-5.8 3.7L8 12.1 3 8.2h6.6z"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-5.5 5.4M12 11.5l5.5 5.4"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
  };

  /* ------------------------------------------------------------------ *
   *  State
   * ------------------------------------------------------------------ */
  let DATA = null;
  let UI = { lang: "en" };
  const lightbox = { items: [], index: 0, onKey: null };
  let cvViewerKey = null;

  const T = () => DATA.ui[UI.lang];
  const C = () => DATA.content[UI.lang];

  /* ------------------------------------------------------------------ *
   *  Renderers
   * ------------------------------------------------------------------ */
  const renderers = {
    /* ---------- hero ---------- */
    hero() {
      const { personal } = DATA;
      const c = C();
      setText("heroRole", DATA.position);
      setText("heroRealName", personal.name);
      setText("heroLead", c.hero.lead);
      setText("metaNationality", personal.nationality[UI.lang]);
      setText("metaSchool", personal.school[UI.lang]);
      setText("metaMajor", personal.major[UI.lang]);
      setText("metaBorn", c.hero.born);
      setText("portraitTag1", T().labels.portraitTag1);
      setText("portraitTag2", T().labels.portraitTag2);

      const heroImg = $("#heroImage");
      heroImg.alt = personal.nickname;
      heroImg.src = isPlaceholder(DATA.media.heroImage) ? FALLBACK_IMG : DATA.media.heroImage;
      heroImg.addEventListener("error", () => (heroImg.src = FALLBACK_IMG), { once: true });
    },

    /* ---------- marquee ---------- */
    marquee() {
      const chunk = C().marquee.map((t) => `<span class="mq-item">${esc(t)}<i aria-hidden="true">/</i></span>`).join("");
      $("#marqueeTrack").innerHTML = chunk + chunk;
    },

    /* ---------- about ---------- */
    about() {
      const c = C();
      const p = DATA.personal;
      setText("aboutLead", c.about.lead);
      setText("aboutSub", c.about.sub);

      const aboutImg = $("#aboutImage");
      aboutImg.src = isPlaceholder(DATA.media.profileImage) ? FALLBACK_IMG : DATA.media.profileImage;
      aboutImg.alt = `${p.nickname} — ${p.name}`;

      $("#factList").innerHTML = T()
        .facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join("");

      $("#counters").innerHTML = T()
        .counters.map(
          (ct) => `<div class="counter">
            <span class="counter-n">${esc(ct.prefix + ct.n + ct.suffix)}</span>
            <span class="counter-l">${esc(ct.label)}</span>
          </div>`
        )
        .join("");
    },

    /* ---------- experience timeline ---------- */
    timeline() {
      $("#timeline").innerHTML = C()
        .experience.map(
          (e, i) => `
        <li class="tl-item" data-reveal>
          <div class="tl-head">
            <span class="tl-num">${String(i + 1).padStart(2, "0")}</span>
            <h3 class="tl-title">${esc(e.title)}</h3>
            ${e.period ? `<span class="tl-tag">${esc(e.period)}</span>` : ""}
          </div>
          <div class="tl-grid">
            <div>
              <p class="tl-desc">${esc(e.description)}</p>
              ${(e.skills ?? []).length
                ? `<div class="tl-skills">${e.skills.map((s) => `<span class="tl-skill">${esc(s)}</span>`).join("")}</div>`
                : ""}
            </div>
            <figure class="tl-media">${img(DATA.media.experience[i], `alt="${esc(e.imageAlt ?? e.title)}"`)}</figure>
          </div>
        </li>`
        )
        .join("");
    },

   /* ---------- why me ---------- */
why() {
  const whyImage = isPlaceholder(DATA.media.whyImage)
    ? FALLBACK_IMG
    : DATA.media.whyImage;

  const imageBlock = `
    <figure class="why-media" data-reveal>
      <img
        src="${esc(whyImage)}"
        alt="${esc(DATA.personal.nickname)} — Practical Activities Monitor"
        loading="lazy"
        decoding="async"
        onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
      >
    </figure>
  `;

  const cards = C()
    .why.map(
      (w, i) => `
    <article class="why-card" style="--i:${i}">
      <span class="why-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="why-ico" aria-hidden="true">${ICONS[w.icon] || ICONS.star}</span>
      <h3 class="why-k">${esc(w.title)}</h3>
      <p class="why-p">${esc(w.text)}</p>
    </article>`
    )
    .join("");

  $("#whyGrid").innerHTML = imageBlock + cards;
},

    /* ---------- activities / vision ---------- */
    activities() {
      const a = C().activities;
      setText("activitiesLead", a.lead);
      setText("activitiesStrip", a.strip);

      $("#pillarList").innerHTML = a.pillars
        .map(
          (p, i) => `
        <article class="pillar" style="--i:${i}">
          <span class="pillar-n">${String(i + 1).padStart(2, "0")}</span>
          <h4 class="pillar-k">${esc(p.title)}</h4>
          <p class="pillar-p">${esc(p.text)}</p>
        </article>`
        )
        .join("");

      $("#activityList").innerHTML = a.list
        .map((x, i) => `<li><span class="a-n">${String(i + 1).padStart(2, "0")}</span><span>${esc(x)}</span></li>`)
        .join("");
    },

    /* ---------- sports ---------- */
    sports() {
      const s = C().sports;
      setText("sportsStory1", s.story1);
      setText("sportsStory2", s.story2);
      setText("fightWord", T().labels.fightWord);

      $("#disciplineList").innerHTML = s.disciplines
        .map(
          (d) => `
        <div class="sport-card ${d.featured ? "featured" : ""}">
          <div class="s-name">${esc(d.name)}</div>
          <div class="s-note">${esc(d.note)}</div>
        </div>`
        )
        .join("");

      $("#sportValues").innerHTML = s.values.map((v) => `<span class="value-chip">${esc(v)}</span>`).join("");
    },

    /* ---------- certificates ---------- */
    certificates() {
      const L = T().labels;
      $("#certGroups").innerHTML = C()
        .certificates.map((g, gi) => {
          const n = g.items.length;
          const cards = g.items
            .map((c, ci) => {
              const tall = n > 2 && ci === 0 ? "tall" : "";
              const wide = !isPlaceholder(DATA.media.certificates[gi]) && c.wide ? "wide" : "";
              return `
              <button class="cert-card ${tall} ${wide}" type="button"
                      data-lb="certs" data-g="${gi}" data-i="${ci}"
                      aria-label="Open certificate: ${esc(c.title)}">
                ${img(DATA.media.certificates[gi], `alt="${esc(c.title)}" ${isPlaceholder(DATA.media.certificates[gi]) ? 'data-pending="true"' : ""}`)}
                <span class="cert-meta">
                  <span class="cert-meta-left">
                    <span class="cert-tag">${esc(c.tag ?? g.title)}</span>
                    <span class="cert-name">${esc(c.title)}</span>
                    ${c.issuer ? `<span class="cert-issuer">${esc(c.issuer)}</span>` : ""}
                  </span>
                </span>
              </button>`;
            })
            .join("");
          return `
          <div class="cert-group" data-reveal>
            <div class="cert-group-head">
              <h3 class="cg-title">${esc(g.title)}</h3>
              <span class="cg-count">${n} ${n === 1 ? L.one of a lot : L.one of a lot}</span>
            </div>
            <div class="cg-grid">${cards}</div>
          </div>`;
        })
        .join("");
    },

    /* ---------- gallery ---------- */
    gallery() {
      const items = C().gallery;
      const L = T().labels;
      const cats = [L.all, ...new Set(items.map((i) => i.category))];
      $("#galleryFilters").innerHTML =
        `<div class="g-filters-row">` +
        cats
          .map(
            (cat, i) =>
              `<button class="g-btn ${i === 0 ? "active" : ""}" type="button" data-cat="${esc(cat)}"
                        aria-pressed="${i === 0}">${esc(cat)}</button>`
          )
          .join("") +
        `</div>`;

      $("#galleryGrid").innerHTML = items
        .map((g, i) => {
          const span = g.span === "big" ? "b2" : g.span === "wide" ? "w2" : g.span === "tall" ? "h2" : "";
          return `
          <figure class="g-item ${span}" data-cat="${esc(g.category)}" data-reveal style="--i:${i % 6}">
            <button type="button" class="g-open" data-lb="gallery" data-i="${i}"
                    aria-label="Open photo: ${esc(g.caption ?? g.category)}">
              ${img(DATA.media.gallery[i], `alt="${esc(g.alt ?? g.caption ?? g.category)}" ${isPlaceholder(DATA.media.gallery[i]) ? 'data-pending="true"' : ""}`)}
              <span class="g-cap"><b>${esc(g.caption ?? "")}</b><span>${esc(g.category)}</span></span>
            </button>
          </figure>`;
        })
        .join("");
    },

    /* ---------- cv ---------- */
    cv() {
      const cvUrl = isPlaceholder(DATA.media.cv) ? null : DATA.media.cv;
      /* HTML CVs open as a page; PDFs and images open in the built-in viewer */
      const isHtml = /\.html?(\?|$)/i.test(cvUrl ?? "") || /\/$/.test(cvUrl ?? "");
      const viewBtn = $("#cvViewBtn");
      const dlBtn = $("#cvDownloadBtn");
      const frameBtn = $("#cvFrameBtn");

      setText("cvNote", C().cv.note);
      setText("cvSheetName", DATA.personal.name.toUpperCase());
      setText("cvSheetRole", C().cv.sheetRole);
      setText("cvvTitle", T().labels.cvTitle);

      if (cvUrl) {
        dlBtn.href = cvUrl;
        dlBtn.target = "_blank";
        viewBtn.disabled = false;
        viewBtn.style.opacity = dlBtn.style.opacity = "";
        const open = isHtml ? () => window.open(cvUrl, "_blank", "noopener") : () => openCvViewer(cvUrl);
        if (!viewBtn.dataset.bound) {
          viewBtn.addEventListener("click", open);
          frameBtn.addEventListener("click", open);
          viewBtn.dataset.bound = "1";
        }
      } else {
        viewBtn.disabled = true;
        viewBtn.title = dlBtn.title = T().labels.cvNotConfigured;
        viewBtn.style.opacity = dlBtn.style.opacity = "0.55";
        if (!frameBtn.dataset.bound) {
          frameBtn.addEventListener("click", () => viewBtn.click());
          frameBtn.dataset.bound = "1";
        }
        dlBtn.removeAttribute("href");
      }

      $("#cvvDownload").href = cvUrl ?? "#";
    },

    /* ---------- section titles ---------- */
    titles() {
      const st = T().sectionTitles;
      const set = (id, key) => {
        const el = document.getElementById(id);
        if (!el || !st[key]) return;
        el.innerHTML = Array.isArray(st[key]) ? st[key][0] : st[key];
      };
      set("stAbout", "about");
      set("stExperience", "experience");
      set("stWhy", "why");
      set("stActivities", "activities");
      set("stSports", "sports");
      set("stProof", "proof");
      set("stGallery", "gallery");
      set("stCV", "cv");
    },

    /* ---------- footer ---------- */
    footer() {
      setText("footerLine", C().footer.line);
      const social = (DATA.social ?? []).filter(
        (s) => s.label && s.label !== "Add later (optional)" && s.url && !isPlaceholder(s.url)
      );
      $("#footerLinks").innerHTML = social
        .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`)
        .join("");
      $("#footerMeta").textContent = `© ${new Date().getFullYear()} · ${DATA.personal.name} — ${DATA.position}`;
    },

    /* ---------- static UI strings ---------- */
    statics() {
      const L = T().labels;
      setText("btnDiscover", L.discover);
      setText("btnProof", L.theProof);
      setText("btnWalk", L.walkRecord);
      setText("factsTitle", L.idCard);
      setText("whySub", L.sub);
      setText("expSub", L.expSub);
      setText("proofSub", L.proofSub);
      setText("gallerySub", L.gallerySub);
      setText("runningList", L.runningList);
      setText("runningNote", L.runningNote);
      setText("cvViewTxt", L.cvView);
      setText("cvDlTxt", L.cvDownload);
      setText("cvvDlTxt", L.cvDownload);
      setText("cvZoomHint", L.cvOpen);
      setText("finalKicker", C().final.kicker);
      setText("backTopTxt", L.backTop);
      setText("mobileFoot", C().final.role);
      setText("pullText", `“${C().quote.text}”`);
      setText("pullCite", L.citePrefix + C().quote.cite);
      setText("heroCandWord", T().heroCandWord ?? "Candidate");
      $("#finalLines").innerHTML = C()
        .final.lines.map((ln, i) => {
          const isAccent = ln.includes(C().final.accentWord);
          return `<span class="fs-line">${esc(ln).replace(esc(C().final.accentWord), `<em class="fs-accent">${esc(C().final.accentWord)}</em>`)}</span>`;
        })
        .join("");
      document.title = `${DATA.personal.nickname} — ${C().final.role}`;
      $$("[data-i18n-aria]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria");
        if (L[key]) el.setAttribute("aria-label", L[key]);
      });
    },
  };

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  };

  function renderAll() {
    Object.values(renderers).forEach((fn) => fn());
    observeReveals();
  }

  /* ==================================================================== *
   *  NAVIGATION
   * ==================================================================== */
  function initNav() {
    const nav = $("#siteNav");
    const burger = $("#navBurger");
    const mobile = $("#navLinksMobile");
    const indicator = $("#navIndicator");
    const links = $$("#navLinks a");

    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
      $("#toTop").classList.toggle("show", window.scrollY > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const closeMobile = () => {
      burger.classList.remove("open");
      mobile.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    burger.addEventListener("click", () => {
      const open = !mobile.classList.contains("open");
      burger.classList.toggle("open", open);
      mobile.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $("#navOverlay").addEventListener("click", closeMobile);

    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMobile();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", id);
      });
    });

    const map = new Map();
    links.forEach((l) => {
      const sec = document.querySelector(l.getAttribute("href"));
      if (sec) map.set(sec, l);
    });
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const link = map.get(en.target);
          if (!link) return;
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
          if (indicator.offsetWidth) {
            indicator.style.left = link.offsetLeft + "px";
            indicator.style.width = link.offsetWidth + "px";
            indicator.classList.add("on");
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    map.forEach((_, sec) => spy.observe(sec));
  }

  /* ==================================================================== *
   *  REVEALS
   * ==================================================================== */
  const observed = new WeakSet();
  let revealIO = null;

  function observeReveals() {
    const els = $$("[data-reveal]").filter((el) => !observed.has(el));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.classList.add("in");
            revealIO.unobserve(en.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
    }
    els.forEach((el) => {
      observed.add(el);
      revealIO.observe(el);
    });
  }

  /* ==================================================================== *
   *  LIGHTBOX
   * ==================================================================== */
  function openLightbox(items, index) {
    lightbox.items = items;
    lightbox.index = index;
    const lb = $("#lightbox");
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add("open"));
    document.body.style.overflow = "hidden";
    updateLightbox();
    lightbox.onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") stepLightbox(1);
      if (e.key === "ArrowLeft") stepLightbox(-1);
    };
    window.addEventListener("keydown", lightbox.onKey);
    $("#lbClose").focus();
  }

  function updateLightbox() {
    const { items, index } = lightbox;
    const item = items[index];
    const lbImg = $("#lbImg");
    lbImg.src = isPlaceholder(item.image) ? FALLBACK_IMG : item.image;
    lbImg.alt = item.alt ?? item.title ?? "";
    $("#lbTitle").textContent = item.title ?? item.caption ?? "";
    $("#lbCat").textContent = item.category ?? item.issuer ?? "";
    $("#lbCount").textContent = index + 1 + T().labels.counterSep + items.length;
    $("#lbPrev").hidden = $("#lbNext").hidden = items.length < 2;
  }

  function stepLightbox(dir) {
    const n = lightbox.items.length;
    if (!n) return;
    lightbox.index = (lightbox.index + dir + n) % n;
    updateLightbox();
  }

  function closeLightbox() {
    const lb = $("#lightbox");
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => (lb.hidden = true), 320);
    window.removeEventListener("keydown", lightbox.onKey);
  }

  function initLightboxControls() {
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", () => stepLightbox(-1));
    $("#lbNext").addEventListener("click", () => stepLightbox(1));
    $("#lightbox").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeLightbox();
    });

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-lb]");
      if (!trigger) return;
      if (trigger.dataset.lb === "gallery") {
        const items = C().gallery.map((g, i) => ({
          image: DATA.media.gallery[i],
          title: g.caption ?? g.category,
          category: g.category,
          alt: g.alt ?? g.caption,
        }));
        openLightbox(items, Number(trigger.dataset.i));
      } else if (trigger.dataset.lb === "certs") {
        const g = Number(trigger.dataset.g);
        const items = C().certificates[g].items.map((c) => ({
          image: DATA.media.certificates[g],
          title: c.title,
          issuer: c.issuer ?? C().certificates[g].title,
          alt: c.title,
        }));
        openLightbox(items, Number(trigger.dataset.i));
      }
    });
  }

  /* ==================================================================== *
   *  CV VIEWER
   * ==================================================================== */
  function openCvViewer(url) {
    const viewer = $("#cvViewer");
    const body = $("#cvvBody");
    body.querySelectorAll("iframe, img, p").forEach((n) => n.remove());
    $("#cvvLoading").style.display = "grid";
    viewer.hidden = false;
    document.body.style.overflow = "hidden";

    const isPdf = /\.pdf(\?|$)/i.test(url);
    const media = document.createElement(isPdf ? "iframe" : "img");
    if (isPdf) {
      media.src = url + "#view=FitH";
      media.title = "CV document";
    } else {
      media.src = url;
      media.alt = DATA.personal.name;
    }
    media.addEventListener("load", () => ($("#cvvLoading").style.display = "none"));
    media.addEventListener("error", () => {
      $("#cvvLoading").style.display = "none";
      const old = body.querySelector("p");
      if (old) old.remove();
      const L = T().labels;
      body.insertAdjacentHTML(
        "beforeend",
        `<p style="color:var(--ink-2);padding:40px;text-align:center">${esc(L.cvLoadFail)}<br>
          <a href="${esc(url)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${esc(L.cvOpenDirect)}</a></p>`
      );
    });
    body.appendChild(media);

    cvViewerKey = (e) => e.key === "Escape" && closeCvViewer();
    window.addEventListener("keydown", cvViewerKey);
    $("#cvvClose").focus();
  }

  function closeCvViewer() {
    const viewer = $("#cvViewer");
    viewer.hidden = true;
    $("#cvvBody").querySelectorAll("iframe, img, p").forEach((n) => n.remove());
    document.body.style.overflow = "";
    window.removeEventListener("keydown", cvViewerKey);
  }

  /* ==================================================================== *
   *  GALLERY FILTERS
   * ==================================================================== */
  function initGalleryFilters() {
    $("#galleryFilters").addEventListener("click", (e) => {
      const btn = e.target.closest(".g-btn");
      if (!btn) return;
      $$(".g-btn").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const cat = btn.dataset.cat;
      $$("#galleryGrid .g-item").forEach((fig) => {
        const show = cat === T().labels.all || fig.dataset.cat === cat;
        fig.classList.toggle("hidden", !show);
      });
    });
  }

  /* ==================================================================== *
   *  BACK TO TOP
   * ==================================================================== */
  function initToTop() {
    $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ==================================================================== *
   *  THEME
   * ==================================================================== */
  function initTheme() {
    const btn = $("#themeBtn");
    btn.addEventListener("click", () => {
      const root = document.documentElement;
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("ga-theme", next);
      } catch (e) {
        /* private mode */
      }
    });
  }

  /* ==================================================================== *
   *  LANGUAGE
   * ==================================================================== */
  function applyLanguage(lang) {
    UI.lang = lang;
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");

    /* per-language position + hero candidate word */
    DATA.position = DATA.personal.position[lang] ?? DATA.personal.position.en;
    DATA.ui[lang].heroCandWord =
      lang === "zh" ? "候选人" : "Candidate";

    renderAll();

    /* kicker labels */
    T().kickers.forEach((k, i) => {
      const el = document.getElementById(`kick${i + 1}`);
      if (el) el.textContent = k;
    });

    /* nav labels — desktop (7 links) and mobile (8 links) have different sets */
    DATA.ui[lang].nav.forEach((label, i) => {
      const d = document.getElementById(`nl-${i}`);
      if (d) d.textContent = label;
    });
    DATA.ui[lang].mobileNav.forEach((label, i) => {
      const m = document.getElementById(`mn-${i}`);
      if (m) m.querySelector(".m-txt").textContent = label;
    });

    /* segmented control */
    $$(".seg-btn").forEach((b) => {
      const active = b.dataset.lang === lang;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    $("#langThumb").classList.toggle("zh", lang === "zh");

    try {
      localStorage.setItem("ga-lang", lang);
    } catch (e) {
      /* private mode */
    }
  }

  function initLang() {
    $$(".seg-btn").forEach((b) =>
      b.addEventListener("click", () => applyLanguage(b.dataset.lang))
    );
  }

  /* ==================================================================== *
   *  BOOT
   * ==================================================================== */
  async function boot() {
    try {
      const res = await fetch("data/data.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      DATA = await res.json();
      DATA.position = DATA.personal.position[DATA.settings.defaultLanguage] ?? "Practical Activities Monitor";
    } catch (err) {
      console.error("[eLL gAllo] Failed to load data/data.json:", err);
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<div style="position:fixed;inset:auto 16px 16px 16px;z-index:400;background:#2a1414;color:#ffb4b4;
          border:1px solid #5c2323;border-radius:10px;padding:14px 18px;font-size:14px">
          Could not load <b>data/data.json</b> (${esc(err.message)}).
          If you opened this file directly from disk, serve the folder with a local server instead
          (e.g. <code>serve.ps1</code> or <code>npx serve</code>).
        </div>`
      );
      return;
    }

    let lang = DATA.settings.defaultLanguage ?? "en";
    try {
      const saved = localStorage.getItem("ga-lang");
      if (saved && DATA.content[saved]) lang = saved;
    } catch (e) {
      /* private mode */
    }

    initTheme();
    initLang();
    applyLanguage(lang);

    initNav();
    initLightboxControls();
    initGalleryFilters();
    initToTop();
    $("#cvvClose").addEventListener("click", closeCvViewer);
    $("#cvViewer").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeCvViewer();
    });

    setText("navBrand", DATA.personal.nickname);
    $("#navBrand").innerHTML = DATA.personal.nickname.replace(" ", "&nbsp;");
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
