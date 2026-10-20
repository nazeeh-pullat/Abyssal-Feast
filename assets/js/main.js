/* Abyssal Feast website - all interactivity. No dependencies. Content comes from data.js (generated from the game's own data). */
(function () {
  "use strict";
  const D = window.AF_DATA, C = window.AF_CONFIG || { links: {} };
  const ic = window.AF_ICON || (() => "");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches && !/[?&]motion=1/.test(location.search);
  const IMG = "assets/img/";
  const bgOf = (l) => IMG + (l.type === "maze" ? "bg/maze" : "bg/bg" + String(l.bg).padStart(2, "0")) + ".webp";
  const src = (p) => IMG + (p.includes("/") ? p : "fish/" + p) + ".webp";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TYPE = {
    eat: { label: "Eat & grow", color: "#38bdf8" }, pool: { label: "Feeding pool", color: "#2dd4bf" }, timed: { label: "Timed trial", color: "#ffd166" },
    hunt: { label: "Hunt", color: "#ff5fa2" }, survival: { label: "Survival", color: "#ff9a4d" }, boss: { label: "Boss fight", color: "#ff5d5d" }, maze: { label: "Maze", color: "#a78bfa" },
  };

  /* ---------------------------------------------------------------- sprite sheets (one shared animation loop) */
  const sprites = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => { for (const o of sprites) if (o.el === e.target) o.vis = e.isIntersecting; }), { rootMargin: "100px" });
  function sprite(el, s) {
    el.classList.add("spr");
    el.style.backgroundImage = `url(${IMG}sheets/${s.src}.webp)`;
    el.style.backgroundSize = `${s.cols * 100}% ${s.rows * 100}%`;
    el.style.aspectRatio = `1 / ${s.ratio}`;
    const o = { el, s, i: Math.floor(Math.random() * s.frames), t: 0, vis: true };
    sprites.add(o); io.observe(el);
    return o;
  }
  function spriteHTML(s, cls = "") { return `<div class="${cls}" data-sheet='${JSON.stringify(s)}'></div>`; }
  function hydrateSprites(root = document) {
    $$("[data-sheet]", root).forEach((el) => { if (!el._spr) { el._spr = sprite(el, JSON.parse(el.dataset.sheet)); } });
  }
  let last = 0;
  function tick(now) {
    const dt = Math.min(100, now - last); last = now;
    for (const o of sprites) {
      if (!o.el.isConnected) { sprites.delete(o); continue; }
      if (!o.vis) continue;
      if (reduce) { if (!o.done) { o.el.style.backgroundPosition = "0% 0%"; o.done = 1; } continue; }
      o.t += dt;
      const step = 1000 / o.s.fps;
      while (o.t >= step) { o.t -= step; o.i = (o.i + 1) % o.s.frames; }
      const c = o.i % o.s.cols, r = Math.floor(o.i / o.s.cols);
      o.el.style.backgroundPosition = `${o.s.cols > 1 ? (c / (o.s.cols - 1)) * 100 : 0}% ${o.s.rows > 1 ? (r / (o.s.rows - 1)) * 100 : 0}%`;
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------- reveal on scroll */
  const rvio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rvio.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  function reveal(root = document) { $$(".rv:not(.in)", root).forEach((el, i) => { if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 4) * 0.07 + "s"); rvio.observe(el); }); }

  /* ---------------------------------------------------------------- 3D tilt */
  function tilt(root = document) {
    if (reduce || !matchMedia("(hover: hover)").matches) return;
    $$("[data-tilt]", root).forEach((el) => {
      if (el._tilt) return; el._tilt = 1;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-6px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------------- static content */
  function renderStats() {
    const S = D.stats, items = [[S.levels, "", "Levels in Chapter 1"], [S.fish, "", "Fish species"], [S.accessories, "+", "Accessories"], [S.achievements, "+", "Achievements"], [S.bosses, "", "Boss fights"], [S.chapters, "", "Chapters planned"]];
    $("#stats").innerHTML = items.map(([n, plus, l]) => `<div class="stat glass"><b data-count="${n}" data-plus="${plus}">0${plus}</b><span>${l}</span></div>`).join("");
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      const b = e.target, to = +b.dataset.count, t0 = performance.now();
      (function step(t) { const p = reduce ? 1 : clamp((t - t0) / 1400, 0, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3))); b.textContent = v + b.dataset.plus; if (p < 1) requestAnimationFrame(step); })(t0);
    }), { threshold: 0.6 });
    $$("[data-count]").forEach((b) => cio.observe(b));
  }

  function renderSteps() {
    const steps = [["tap", "Swim", "Drag anywhere to steer. One thumb is all you need - and you can move the ability button to either side."], ["fish", "Eat smaller fish", "Anything smaller than you is food. Anything bigger is hunting you. Watch the size of every fish."],
      ["growth", "Grow & win", "Every bite fills your growth bar. Grow through the size stages, fill it up and the level is yours - but lose all your hearts and it's over."], ["bolt", "Use your ability", "Every fish has a special power: suck in prey, dash, puff up, vanish or speed away. Tap it at the right moment."]];
    $("#steps").innerHTML = steps.map(([i, t, p]) => `<div class="step glass rv" data-tilt><div class="ico">${ic(i)}</div><h3>${t}</h3><p>${p}</p></div>`).join("");
  }

  function renderFeatures() {
    $("#features-grid").innerHTML = D.features.map((f) => `<article class="feat glass rv" data-tilt><div class="ico">${ic(f.icon)}</div><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></article>`).join("");
  }

  function renderModes() {
    $("#modes").innerHTML = D.modes.map((m) => `<article class="mode glass rv" data-tilt><div class="ico">${ic(m.icon)}</div><h3>${m.name}</h3><p>${m.text}</p><span class="chip">${m.open}</span></article>`).join("");
  }

  function renderRooms() {
    const rooms = [["Coral Cottage", "#f4c6cc", "#e89aa3", "#f7e4e4"], ["Cozy Den", "#8a5a36", "#5b3a22", "#6b4426"], ["Golden Hall", "#e0b44e", "#c9983a", "#efe3c8"], ["Midnight Study", "#27335f", "#171f3d", "#1d2548"],
      ["Mint Studio", "#9be3c9", "#6fcbb0", "#d9f5ec"], ["Royal Parlor", "#7e4fd0", "#5a32a8", "#e6d9fb"], ["Seaside Cottage", "#8fd0ee", "#5aaed8", "#eaf6fb"]];
    $("#rooms").innerHTML = rooms.map(([n, a, b, c]) => `<div class="room" style="--a:${a};--b:${b};--c:${c}"><i></i><span>${n}</span></div>`).join("");
  }

  function renderAccessories() {
    const names = ["hat_wizard_hat", "hat_birthday_crown", "hat_buccaneer_cap", "hat_halo_with_wings", "hat_crystal_shard_crown", "hat_graduation_cap", "hat_pizza_slice_hat", "hat_hot_dog_hat", "hat_lily_pad_hat", "hat_teacup_hat", "hat_birdhouse_hat",
      "hat_mini_windmill_hat", "hat_gold_top_hat", "hat_gold_laurel_crown", "face_gear_eye_visor", "face_donut_eye_frame", "face_lightning_eye_lens", "face_camera_lens_eye", "face_magnifier_loupe", "neck_jellyfish_charm", "neck_trophy_charm", "neck_sun_medallion",
      "neck_treasure_map_pendant", "neck_lucky_horseshoe_charm", "neck_shell_brooch", "neck_lantern_charm", "neck_jingle_bell", "neck_lighthouse_pendant"];
    const pretty = (n) => n.replace(/^(hat|face|neck)_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const make = (list) => { const h = list.map((n) => `<div class="acc" title="${pretty(n)}"><img src="${IMG}acc/${n}.webp" alt="${pretty(n)}" loading="lazy"></div>`).join(""); return h + h; };
    const half = Math.ceil(names.length / 2);
    $("#t1").innerHTML = make(names.slice(0, half)); $("#t2").innerHTML = make(names.slice(half));
  }

  function renderFaq() {
    $("#faq-list").innerHTML = D.faq.map(([q, a]) => `<details class="glass rv"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
  }

  function renderChapters() {
    $("#chapter-list").innerHTML = D.chapters.map((c) => {
      const cls = c.status === "live" ? "live" : c.classified ? "soon classified" : "soon";
      const chip = c.status === "live" ? `<span class="chip live"><i class="pulse"></i>Playable now</span>` : `<span class="chip soon">Coming soon</span>`;
      return `<article class="ch ${cls} rv"><div class="cbg" style="background-image:url(${IMG}${c.map}.webp)"></div>${c.status === "live" ? "" : `<div class="lock" aria-hidden="true">${ic(c.classified ? "lock" : "leaf")}</div>`}
        <div class="num">${c.n}</div><h3>${c.classified ? "Chapter " + c.n + " · ???" : esc(c.name)}</h3><p>${esc(c.text)}</p>${chip}
        ${c.status === "live" ? `<a class="btn go" href="#chapter1" style="padding:.6em 1.2em;font-size:.88rem">Explore</a>` : ""}</article>`;
    }).join("");
  }

  function renderCTA() {
    const L = C.links || {}, out = [];
    out.push(L.googlePlay ? `<a class="btn" href="${esc(L.googlePlay)}" target="_blank" rel="noopener">${ic("play")} Get it on Google Play</a>` : `<span class="btn" aria-disabled="true" style="--c1:#b8cfd8;--c2:#7fa0ae;box-shadow:0 8px 0 rgba(20,60,80,.5)">${ic("play")} Google Play - coming soon</span>`);
    if (L.discord) out.push(`<a class="btn ghost" href="${esc(L.discord)}" target="_blank" rel="noopener">${ic("chat")} Join the Discord</a>`);
    if (L.youtube) out.push(`<a class="btn ghost" href="${esc(L.youtube)}" target="_blank" rel="noopener">${ic("play")} YouTube</a>`);
    out.push(`<a class="btn ghost" href="mailto:nazeehfazal12@gmail.com">${ic("mail")} Say hello</a>`);
    $("#cta-links").innerHTML = out.join("");
    const f = [L.discord && ["Discord", L.discord], L.youtube && ["YouTube", L.youtube], L.tiktok && ["TikTok", L.tiktok], L.instagram && ["Instagram", L.instagram]].filter(Boolean);
    $("#f-links").innerHTML = f.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join(" · ");
  }

  /* ---------------------------------------------------------------- fish showcase */
  function renderFish() {
    const picks = $("#picks"), box = $("#fishbox"), info = $("#info");
    const all = [...D.player, { id: "secret", secret: true }];
    picks.innerHTML = all.map((f, i) => `<button class="pick ${f.secret ? "secret" : ""}" type="button" data-i="${i}" aria-pressed="${i === 0}" aria-label="${f.secret ? "Secret fish" : f.name}"><img src="${f.secret ? IMG + "fish/secret.webp" : src(f.img)}" alt="" loading="lazy"></button>`).join("");
    const segs = (n, max, cls = "") => `<div class="segs ${cls}">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? "on" : ""}">${cls ? ic("heart") : ""}</i>`).join("")}</div>`;
    function show(i) {
      const f = all[i];
      $$(".pick", picks).forEach((b, j) => b.setAttribute("aria-pressed", j === i));
      if (f.secret) {
        box.innerHTML = `<img src="${IMG}fish/secret.webp" alt="A mysterious golden silhouette" style="filter:drop-shadow(0 0 24px rgba(255,209,102,.7))">`;
        info.innerHTML = `<h3>???</h3><div class="ability"><div><b>Secret fish</b><span>Whispers say there is a golden clownfish out there - the fastest, toughest and flashiest swimmer in the sea. Nobody sells it. Keep your eyes open for a very special code.</span></div></div><p class="fact">Hint: it's not in the Shop.</p>`;
        return;
      }
      if (f.sheet) { box.innerHTML = spriteHTML(f.sheet, ""); hydrateSprites(box); } else box.innerHTML = `<img src="${src(f.img)}" alt="${esc(f.name)}">`;
      info.innerHTML = `<span class="chip" style="align-self:flex-start">${esc(f.how)}</span><h3>${esc(f.name)}</h3>
        <div class="ability"><div><b>${ic("bolt")} ${esc(f.ability)}</b><span>${esc(f.abilityText)}</span></div></div>
        <div class="bars"><div class="bar"><span>Health</span>${segs(f.hearts, 3, "hearts")}</div><div class="bar"><span>Speed</span>${segs(f.speed, 10)}</div></div>
        <p class="fact">${esc(f.fact)}</p>`;
    }
    picks.addEventListener("click", (e) => { const b = e.target.closest(".pick"); if (b) show(+b.dataset.i); });
    show(0);
  }

  function renderLadder() {
    $("#ladder").innerHTML = [1, 2, 3, 4].map((n) => {
      const fish = D.enemies.filter((e) => e.size === n);
      return `<div class="rung glass rv" style="--n:${n}"><h4>${D.ladder[n]}<small>${fish.length} species</small></h4><div class="row">${fish.map((e) => `<button class="mini" type="button" data-w="${e.id}" style="--n:${n}" title="${esc(e.name)}"><img src="${src(e.img)}" alt="${esc(e.name)}" loading="lazy"><span>${esc(e.name)}</span></button>`).join("")}</div></div>`;
    }).join("");
    $("#ladder").addEventListener("click", (e) => { const b = e.target.closest(".mini"); if (!b) return; document.querySelector('[data-p="p-fish"]').click(); location.hash = "wildlife"; setTimeout(() => { const t = $(`#c-fish [data-w="${b.dataset.w}"]`); t && t.scrollIntoView({ block: "center", behavior: "smooth" }); }, 100); });
  }

  /* ---------------------------------------------------------------- wildlife tabs */
  function renderWildlife() {
    const card = (o) => `<article class="wcard glass rv" data-w="${o.id || ""}" data-tilt>${o.level ? `<span class="chip first">Lv ${o.level}</span>` : ""}<div class="pic">${o.emoji ? `<span class="emoji">${ic(o.emoji)}</span>` : `<img src="${src(o.img)}" alt="${esc(o.name)}" loading="lazy">`}</div>
      <h4>${esc(o.name)}</h4>${o.tag ? `<div class="tagline">${esc(o.tag)}</div>` : ""}<p>${esc(o.fact)}</p></article>`;
    $("#c-fish").innerHTML = D.enemies.map((e) => card({ ...e, tag: `Size ${e.size}` })).join("");
    $("#c-marine").innerHTML = D.marine.map((m) => card({ ...m, tag: m.role + " · " + m.tag })).join("");
    $("#c-events").innerHTML = D.events.map((e) => card({ ...e, id: "", img: "", emoji: e.icon, level: e.level, tag: e.tag })).join("");
    const mini = (o, bad) => `<div class="wcard glass rv ${bad ? "bad" : ""}"><div class="pic"><img src="${src(o.img)}" alt="${esc(o.name)}" loading="lazy"></div><h4>${esc(o.name)}</h4><p>${esc(o.text)}</p></div>`;
    $("#c-power").innerHTML = D.powerups.map((p) => mini(p, p.bad)).join("");
    $("#c-perks").innerHTML = D.perks.map((p) => mini(p)).join("");
    const tabs = $$(".tab", $("#wtabs"));
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.setAttribute("aria-selected", x === t));
      $$(".panel", $("#wildlife")).forEach((p) => (p.hidden = p.id !== t.dataset.p));
      const p = document.getElementById(t.dataset.p); reveal(p); tilt(p);
    }));
  }

  /* ---------------------------------------------------------------- bosses */
  function renderBosses() {
    $("#boss-list").innerHTML = D.bosses.map((b, i) => `<article class="boss glass rv" id="boss-${b.id}">
      <div class="bossart" ${b.img2 ? 'data-swap="1" role="button" tabindex="0" aria-label="Switch Swarm Queen phase"' : ""}><img src="${src(b.img)}" alt="${esc(b.name)}" loading="lazy">${b.img2 ? '<span class="hint">Tap to switch phase</span>' : ""}</div>
      <div><span class="bosstag">${ic("swords")} ${esc(b.title)} · Level ${b.level}</span><h3 style="font-size:clamp(2rem,4vw,3rem);margin-top:.3em">${esc(b.name)}</h3><p style="color:var(--mist)">${esc(b.fact)}</p>
        <ul class="moves">${b.moves.map((m) => `<li>${esc(m)}</li>`).join("")}</ul><p style="margin:16px 0 0"><a class="btn ghost" href="#level-${b.level}" data-open="${b.level}" style="padding:.65em 1.3em;font-size:.9rem">See Level ${b.level}</a></p></div></article>`).join("");
    const q = D.bosses.find((b) => b.img2);
    $$("[data-swap]").forEach((el) => {
      let smooth = false;
      const swap = () => { smooth = !smooth; const im = $("img", el); im.style.opacity = 0; setTimeout(() => { im.src = src(smooth ? q.img2 : q.img); im.alt = q.name + (smooth ? " (smooth phase)" : " (spiky phase)"); im.style.opacity = 1; }, 180); };
      el.addEventListener("click", swap); el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); swap(); } });
      $("img", el).style.transition = "opacity .2s";
    });
  }

  /* ---------------------------------------------------------------- level explorer */
  let curFilter = "all";
  function renderLevels() {
    const L = D.levels;
    $("#legend").innerHTML = Object.entries(TYPE).map(([k, v]) => `<span style="--tc:${v.color}"><i></i>${v.label}</span>`).join("");
    $("#dots").innerHTML = L.map((l) => `<button class="dot" type="button" style="--tc:${TYPE[l.type].color}" data-lv="${l.n}" ${l.type === "boss" ? 'data-boss="1"' : ""} title="Level ${l.n} - ${esc(l.name)}" aria-label="Level ${l.n}: ${esc(l.name)}">${l.n}</button>`).join("");
    const groups = [["all", "All 31"], ["eat", "Eat & grow"], ["pool", "Feeding pools"], ["timed", "Timed trials"], ["hunt", "Hunts"], ["survival", "Survival"], ["boss", "Bosses"], ["maze", "Maze"]];
    $("#filters").innerHTML = groups.map(([k, n]) => `<button class="filter" type="button" data-f="${k}" aria-pressed="${k === "all"}">${n}</button>`).join("");
    $("#levels").innerHTML = L.map((l) => `<button class="lcard ${l.type === "boss" ? "isboss" : ""} rv" type="button" data-lv="${l.n}" data-t="${l.type}" style="--tc:${TYPE[l.type].color}">
      <div class="thumb"><img src="${bgOf(l)}" alt="" loading="lazy" width="480" height="270">${l.boss && D.bosses.find((b) => b.id === l.boss) ? `<img class="bossthumb" src="${src(D.bosses.find((b) => b.id === l.boss).img)}" alt="" loading="lazy">` : ""}<span class="no">${l.n}</span><span class="chip tag" style="background:rgba(2,16,31,.7)">${TYPE[l.type].label}</span></div>
      <div class="body"><h3>${esc(l.name)}</h3><p>${esc(l.blurb)}</p></div></button>`).join("");
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest(".filter"); if (!b) return; curFilter = b.dataset.f;
      $$(".filter").forEach((x) => x.setAttribute("aria-pressed", x === b));
      $$(".lcard").forEach((c) => c.classList.toggle("hide", curFilter !== "all" && c.dataset.t !== curFilter));
    });
    const open = (e) => { const t = e.target.closest("[data-lv]"); if (t) openLevel(+t.dataset.lv); };
    $("#levels").addEventListener("click", open); $("#dots").addEventListener("click", open);
    document.addEventListener("click", (e) => { const a = e.target.closest("[data-open]"); if (a) { e.preventDefault(); openLevel(+a.dataset.open); } });
  }

  let curLevel = 0;
  const modal = $("#modal"), mdl = $("#mdl");
  function openLevel(n, push = true) {
    n = clamp(n, 1, D.levels.length); curLevel = n;
    const l = D.levels[n - 1], tc = TYPE[l.type], boss = l.boss && D.bosses.find((b) => b.id === l.boss);
    mdl.innerHTML = `<button class="xbtn" type="button" aria-label="Close" id="mx">${ic("x")}</button>
      <div class="art" style="background-image:url(${bgOf(l)})"><span class="big">${n}</span>${boss ? `<img class="bossimg" src="${src(boss.img)}" alt="">` : ""}</div>
      <div class="txt"><div><span class="chip" style="background:${tc.color};color:#021;border-color:transparent">${tc.label}</span> <span class="chip">Chapter 1 · The Shallows</span></div>
        <h3 id="mtitle">${esc(l.name)}</h3><p style="margin:0">${esc(l.blurb)}</p>
        ${l.new.length ? `<div><b style="color:var(--sun)">New in this level</b><ul style="margin-top:8px">${l.new.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${l.tip ? `<div class="tip">${esc(l.tip)}</div>` : ""}
        <div class="mnav"><button class="btn ghost" type="button" id="mp" ${n === 1 ? "disabled" : ""}>${ic("left")} Level ${Math.max(1, n - 1)}</button><button class="btn" type="button" id="mn" ${n === D.levels.length ? "disabled" : ""}>Level ${Math.min(D.levels.length, n + 1)} ${ic("right")}</button></div></div>`;
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    $("#mx").focus();
    if (push) history.replaceState(null, "", "#level-" + n);
  }
  function closeLevel() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; if (location.hash.startsWith("#level-")) history.replaceState(null, "", "#chapter1"); }
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.id === "mx") closeLevel(); else if (e.target.id === "mp") openLevel(curLevel - 1); else if (e.target.id === "mn") openLevel(curLevel + 1); });
  addEventListener("keydown", (e) => {
    if (modal.classList.contains("open")) { if (e.key === "Escape") closeLevel(); if (e.key === "ArrowLeft") openLevel(curLevel - 1); if (e.key === "ArrowRight") openLevel(curLevel + 1); }
    if (lb.classList.contains("open") && e.key === "Escape") lb.classList.remove("open");
  });

  /* ---------------------------------------------------------------- gallery */
  const lb = $("#lightbox");
  function renderGallery() {
    const real = (C.screenshots || []).filter((s) => s && s.src);
    const list = real.length ? real : D.scenes || [];
    if (real.length) $("#gallerylead").textContent = "Straight from the game. Tap an image to see it full size.";
    $("#shots").innerHTML = list.map((s, i) => `<button class="shot rv" type="button" data-i="${i}"><img src="${esc(s.src)}" alt="${esc(s.caption || "Abyssal Feast")}" loading="lazy"><span>${esc(s.caption || "")}</span></button>`).join("");
    $("#shots").addEventListener("click", (e) => { const b = e.target.closest(".shot"); if (!b) return; const s = list[+b.dataset.i]; $("#lbimg").src = s.src; $("#lbimg").alt = s.caption || ""; $("#lbcap").textContent = s.caption || ""; lb.classList.add("open"); });
    lb.addEventListener("click", () => lb.classList.remove("open"));
    if (C.trailerYouTubeId) $("#video").innerHTML = `<div class="vid rv"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(C.trailerYouTubeId)}" title="Abyssal Feast trailer" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }

  /* ---------------------------------------------------------------- feast streak demo */
  function streakDemo() {
    const tiers = D.streak, tierEl = $("#tiers"), word = $("#streakword"), timer = $("#streaktimer"), hint = $("#streakhint"), screen = $("#streakscreen");
    tierEl.innerHTML = tiers.map((t) => `<span class="chip">${t}</span>`).join("");
    let tier = 0, letters = 0, deadline = 0, raf = 0, active = false, lastTier = -1;
    const count = (s) => s.replace(/ /g, "").length;
    const reveal = (full, n) => { let shown = 0; for (let i = 0; i < full.length; i++) { if (full[i] !== " ") { shown++; if (shown > n) return full.slice(0, i); } } return full; };
    function paint(pop) {
      const full = tiers[tier], txt = reveal(full, letters);
      const head = txt.slice(0, -1), lastc = txt.slice(-1);
      word.innerHTML = esc(head) + (lastc ? `<span class="${pop ? "pop" : ""}">${esc(lastc)}</span>` : "");
      $$(".chip", tierEl).forEach((c, i) => c.classList.toggle("on", i === tier && letters > 0));
    }
    function burst() { for (let i = 0; i < 16; i++) { const b = document.createElement("i"); b.className = "burst"; const a = Math.random() * 6.28, d = 60 + Math.random() * 120; b.style.cssText = `left:50%;top:50%;--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;background:${i % 2 ? "#ffd166" : "#5eead4"}`; screen.appendChild(b); setTimeout(() => b.remove(), 1000); } }
    function loop() {
      const left = deadline - performance.now();
      timer.style.width = clamp(left / 3000, 0, 1) * 100 + "%";
      if (left <= 0) { active = false; tier = 0; letters = 0; hint.textContent = "Too slow! The streak fizzled out - bite again to restart."; word.innerHTML = "&nbsp;"; $$(".chip", tierEl).forEach((c) => c.classList.remove("on")); return; }
      raf = requestAnimationFrame(loop);
    }
    $("#chomp").addEventListener("click", () => {
      letters++; const total = count(tiers[tier]);
      let done = false;
      if (letters > total) { if (tier < tiers.length - 1) { tier++; letters = 1; } else { letters = 1; } }   // ABYSSAL FEAST re-spells from A
      else if (letters === total) done = true;
      deadline = performance.now() + 3000;
      if (!active) { active = true; loop(); }
      paint(true);
      if (done) { burst(); hint.textContent = tier === tiers.length - 1 ? "ABYSSAL FEAST!  Keep biting - it spells itself again." : `${tiers[tier]}! Keep going...`; screen.animate([{ filter: "brightness(1.6)" }, { filter: "none" }], 400); }
      else hint.textContent = "Keep biting - 3 seconds on the clock!";
    });
  }

  /* ---------------------------------------------------------------- hero swimmers */
  function swimmers() {
    const host = $("#swimmers"); if (!host || reduce) return;
    const crew = [
      { f: D.player[0], w: 150, y: 0.46, v: 46 }, { f: D.enemies.find((e) => e.id === "blue-tang"), w: 190, y: 0.3, v: 30 }, { f: D.enemies.find((e) => e.id === "lionfish"), w: 210, y: 0.62, v: 22 },
      { f: D.enemies.find((e) => e.id === "butterflyfish"), w: 130, y: 0.2, v: 38 }, { f: D.enemies.find((e) => e.id === "coral-beauty"), w: 170, y: 0.72, v: 34 }, { f: D.player[4], w: 140, y: 0.54, v: 52 }, { f: D.player[2], w: 120, y: 0.12, v: 26 },
    ];
    const items = crew.map((c, i) => {
      const el = document.createElement("div"); el.className = "swimmer"; el.style.width = c.w + "px"; el.style.opacity = 0.95 - (i % 3) * 0.12;
      const inner = document.createElement("div");
      if (c.f.sheet) sprite(inner, c.f.sheet); else { inner.innerHTML = `<img src="${src(c.f.img)}" alt="">`; }
      el.appendChild(inner); host.appendChild(el);
      return { el, c, dir: i % 2 ? -1 : 1, x: Math.random(), sway: Math.random() * 6 };
    });
    let t0 = performance.now(), mx = 0, my = 0;
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    (function frame(now) {
      const dt = (now - t0) / 1000; t0 = now; const W = host.clientWidth, H = host.clientHeight;
      for (const s of items) {
        s.x += (s.dir * s.c.v * dt) / W * 1.0;
        const pad = s.c.w / W;
        if (s.dir > 0 && s.x > 1 + pad) { s.x = -pad; s.c.y = 0.1 + Math.random() * 0.7; }
        if (s.dir < 0 && s.x < -pad) { s.x = 1 + pad; s.c.y = 0.1 + Math.random() * 0.7; }
        s.sway += dt * 1.4;
        const px = s.x * W + mx * 26 * (s.c.w / 150), py = s.c.y * H + Math.sin(s.sway) * 14 + my * 18 * (s.c.w / 150);
        s.el.style.transform = `translate(${px - s.c.w / 2}px, ${py}px) scaleX(${s.dir})`;
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  /* ---------------------------------------------------------------- bubbles & plankton canvas */
  function particles() {
    const cv = $("#fx"); if (!cv || reduce) return;
    const ctx = cv.getContext("2d"); let W = 0, H = 0, ps = [], mx = -999, my = -999;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    function size() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; ps = Array.from({ length: Math.round(clamp((innerWidth * innerHeight) / 24000, 18, 62)) }, () => make(true)); }
    function make(init) { const bubble = Math.random() < 0.62; return { x: Math.random() * W, y: init ? Math.random() * H : H + 20 * dpr, r: (bubble ? 2 + Math.random() * 9 : 1 + Math.random() * 1.6) * dpr, v: (bubble ? 14 + Math.random() * 40 : 4 + Math.random() * 10) * dpr, w: Math.random() * 6, b: bubble }; }
    addEventListener("resize", size); size();
    addEventListener("pointermove", (e) => { mx = e.clientX * dpr; my = e.clientY * dpr; });
    let t0 = performance.now();
    (function frame(now) {
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now; ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y -= p.v * dt; p.w += dt * 2; p.x += Math.sin(p.w) * 12 * dpr * dt;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = 130 * dpr; if (d2 < R * R) { const d = Math.sqrt(d2) || 1; p.x += (dx / d) * 60 * dpr * dt; p.y += (dy / d) * 40 * dpr * dt; }
        if (p.y < -30) Object.assign(p, make(false), { x: Math.random() * W });
        if (p.b) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.strokeStyle = "rgba(220,250,255,.55)"; ctx.lineWidth = 1.4 * dpr; ctx.stroke();
          ctx.fillStyle = "rgba(180,240,255,.07)"; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, 6.283); ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fill();
        } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = "rgba(170,255,240,.55)"; ctx.fill(); }
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  /* ---------------------------------------------------------------- scroll: depth colours, gauge, nav, hero parallax */
  function scrollFX() {
    const stops = [["#0b86a6", "#07557a"], ["#0a6a8f", "#063c5e"], ["#07476b", "#042d4a"], ["#053a5c", "#03213a"], ["#031f36", "#02101f"]];
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, "0")).join("");
    const zones = ["Surface", "Shallows", "Twilight", "Deep", "Abyss"];
    const nav = $("#nav"), fill = $("#depthfill"), dot = $("#depthdot"), num = $("#depthnum"), zone = $("#zone"), bg = $("#herobg"), root = document.documentElement.style;
    const secs = $$("main section[id]"), links = $$("#menu a");
    let ticking = false;
    function update() {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? clamp(scrollY / max, 0, 1) : 0, f = p * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)), t = f - i;
      root.setProperty("--bg1", mix(stops[i][0], stops[i + 1][0], t)); root.setProperty("--bg2", mix(stops[i][1], stops[i + 1][1], t)); root.setProperty("--ray", String(1 - p * 0.9));
      fill.style.height = p * 100 + "%"; dot.style.top = p * 100 + "%"; num.textContent = Math.round(p * 220) + " m"; zone.textContent = zones[Math.min(zones.length - 1, Math.round(f))];
      nav.classList.toggle("scrolled", scrollY > 30);
      if (!reduce && scrollY < innerHeight * 1.2) bg.style.transform = `translateY(${scrollY * 0.28}px) scale(${1 + scrollY * 0.00018})`;
      let cur = "";
      for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.4) cur = s.id; }
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true }); addEventListener("resize", update); update();
    if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
      const g = $("#glow"); document.body.classList.add("has-pointer");
      addEventListener("pointermove", (e) => { g.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; });
    }
  }

  function nav() {
    const b = $("#burger"), m = $("#menu");
    b.addEventListener("click", () => { const o = m.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
    m.addEventListener("click", (e) => { if (e.target.closest("a")) { m.classList.remove("open"); b.setAttribute("aria-expanded", "false"); } });
  }

  /* click feedback: button ripple + a little bubble burst anywhere you tap */
  if (!reduce) {
    document.addEventListener("pointerdown", (e) => {
      const b = e.target.closest(".btn:not([aria-disabled])");
      if (b) { const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement("span"); s.className = "ripple"; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; b.appendChild(s); setTimeout(() => s.remove(), 650); }
      for (let i = 0; i < 5; i++) { const el = document.createElement("i"); el.className = "click-bubble"; const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, dist = 30 + Math.random() * 50; el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--x:${Math.cos(a) * dist}px;--y:${Math.sin(a) * dist}px;width:${6 + Math.random() * 10}px;height:${6 + Math.random() * 10}px`; document.body.appendChild(el); setTimeout(() => el.remove(), 1000); }
    });
  }
  /* ---------------------------------------------------------------- boot */
  $$("[data-ic]").forEach((el) => el.insertAdjacentHTML("afterbegin", ic(el.dataset.ic)));
  renderStats(); renderSteps(); renderFeatures(); renderModes(); renderRooms(); renderAccessories(); renderFaq(); renderChapters(); renderCTA();
  renderFish(); renderLadder(); renderWildlife(); renderBosses(); renderLevels(); renderGallery(); streakDemo(); nav(); scrollFX();
  swimmers(); particles(); hydrateSprites(); reveal(); tilt();
  requestAnimationFrame(tick);
  const h = location.hash.match(/^#level-(\d+)$/); if (h) setTimeout(() => openLevel(+h[1], false), 400);
})();
