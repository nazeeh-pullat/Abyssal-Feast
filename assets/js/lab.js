/* Interactive demos for the Collect section: "Try the Inventory" (dress a fish, nudge the accessory like in the game) and
   "Build a tank" (My Aquarium). Uses the game's own fish, accessory, decor and room art. */
(function () {
  "use strict";
  const D = window.AF_DATA, UI = window.AF_UI, ACC = window.AF_ACC;
  if (!D || !UI || !ACC) return;
  const ic = window.AF_ICON || (() => "");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const IMG = "assets/img/";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pretty = (n) => n.replace(/^(hat|face|neck)_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* ================================================================ inventory: dress your fish */
  const closet = $("#closet");
  if (closet) {
    // where the head / eye / chest sit on each fish picture (fractions of the picture)
    const ANCH = {
      clownfish: { hat: [0.73, 0.1], face: [0.82, 0.45], neck: [0.78, 0.78] },
      dartfish: { hat: [0.84, 0.3], face: [0.89, 0.42], neck: [0.82, 0.64] },
      pufferfish: { hat: [0.72, 0.08], face: [0.78, 0.4], neck: [0.8, 0.78] },
      "royal-gramma": { hat: [0.8, 0.2], face: [0.88, 0.42], neck: [0.83, 0.68] },
      "yellow-tang": { hat: [0.74, 0.08], face: [0.83, 0.4], neck: [0.84, 0.74] },
    };
    const BOX = { hat: 0.34, face: 0.2, neck: 0.3 };            // accessory box width as a fraction of the fish width
    const PIVOT = { hat: -0.88, face: -0.5, neck: -0.12 };     // how far the box sits above (-) its anchor, in box heights
    const fishes = D.player;
    const S = { fish: fishes[0].id, cat: "hat", worn: { hat: "hat_wizard_hat", face: null, neck: null }, tw: {} };
    const stage = $("#cstage"), picks = $("#cfish"), tabs = $("#ctabs"), grid = $("#cgrid"), label = $("#cworn");
    const key = () => S.fish + "|" + S.worn[S.cat];
    const tw = () => (S.tw[key()] = S.tw[key()] || { dx: 0, dy: 0, s: 1, r: 0 });

    picks.innerHTML = fishes.map((f) => `<button type="button" class="pk" data-id="${f.id}" aria-pressed="${f.id === S.fish}" aria-label="${f.name}"><img src="${IMG}fish/${f.img}.webp" alt=""></button>`).join("");
    tabs.innerHTML = [["hat", "Hat"], ["face", "Face"], ["neck", "Neck"]].map(([k, n]) => `<button type="button" class="tab" role="tab" data-c="${k}" aria-selected="${k === S.cat}">${n}</button>`).join("");

    function drawGrid() {
      const list = ACC.filter((n) => n.startsWith(S.cat + "_"));
      grid.innerHTML = `<button type="button" class="ac none" data-n="" aria-pressed="${!S.worn[S.cat]}" title="Nothing">${ic("x")}</button>` +
        list.map((n) => `<button type="button" class="ac" data-n="${n}" aria-pressed="${S.worn[S.cat] === n}" title="${pretty(n)}"><img src="${IMG}acc/${n}.webp" alt="${pretty(n)}" loading="lazy"></button>`).join("");
    }
    function draw() {
      const f = fishes.find((x) => x.id === S.fish), A = ANCH[f.id] || ANCH.clownfish;
      stage.innerHTML = `<div class="cfish"><img class="body" src="${IMG}fish/${f.img}.webp" alt="${f.name}" draggable="false"></div>`;
      const box = $(".cfish", stage), im = $(".body", box);
      const place = () => {
        const ratio = (im.naturalWidth || 400) / (im.naturalHeight || 250);
        $$(".cacc", box).forEach((el) => el.remove());
        for (const cat of ["hat", "face", "neck"]) {
          const n = S.worn[cat]; if (!n) continue;
          const t = S.tw[f.id + "|" + n] || { dx: 0, dy: 0, s: 1, r: 0 };
          const el = document.createElement("img");
          el.className = "cacc" + (cat === S.cat ? " sel" : ""); el.src = `${IMG}acc/${n}.webp`; el.alt = ""; el.draggable = false;
          el.style.width = BOX[cat] * 100 * t.s + "%";
          el.style.left = A[cat][0] * 100 + t.dx + "%";
          el.style.top = A[cat][1] * 100 + t.dy * ratio + "%";
          el.style.transform = `translate(-50%, ${PIVOT[cat] * 100}%) rotate(${t.r}deg)`;
          box.appendChild(el);
        }
      };
      if (im.complete) place(); else im.addEventListener("load", place);
      stage._place = place;
      label.textContent = ["hat", "face", "neck"].map((c) => (S.worn[c] ? pretty(S.worn[c]) : null)).filter(Boolean).join(" + ") || "Nothing yet - pick an accessory";
      $$(".pk", picks).forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === S.fish));
    }
    picks.addEventListener("click", (e) => { const b = e.target.closest(".pk"); if (b) { S.fish = b.dataset.id; draw(); } });
    tabs.addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; S.cat = b.dataset.c; $$(".tab", tabs).forEach((x) => x.setAttribute("aria-selected", x === b)); drawGrid(); draw(); });
    grid.addEventListener("click", (e) => { const b = e.target.closest(".ac"); if (!b) return; S.worn[S.cat] = b.dataset.n || null; drawGrid(); draw(); });

    // move / size / rotate buttons, hold to repeat (like the game's tweak pad)
    const act = {
      left: (t) => (t.dx -= 1.2), right: (t) => (t.dx += 1.2), up: (t) => (t.dy -= 1.2), down: (t) => (t.dy += 1.2),
      smaller: (t) => (t.s = clamp(t.s / 1.05, 0.4, 2.4)), bigger: (t) => (t.s = clamp(t.s * 1.05, 0.4, 2.4)),
      ccw: (t) => (t.r -= 5), cw: (t) => (t.r += 5),
    };
    const pad = $("#cpad");
    pad.innerHTML = [["left", "left", "Move left"], ["up", "left", "Move up"], ["down", "left", "Move down"], ["right", "right", "Move right"], ["smaller", "minus", "Smaller"], ["bigger", "plus", "Bigger"], ["ccw", "swirl", "Rotate left"], ["cw", "swirl", "Rotate right"]]
      .map(([a, i, t]) => `<button type="button" class="pd" data-a="${a}" title="${t}" aria-label="${t}">${ic(i)}</button>`).join("") + `<button type="button" class="pd reset" data-a="reset">Reset</button>`;
    let hold = 0, rep = 0;
    const step = (a) => { if (!S.worn[S.cat]) return; if (a === "reset") { delete S.tw[key()]; } else act[a](tw()); stage._place && stage._place(); };
    pad.addEventListener("pointerdown", (e) => { const b = e.target.closest(".pd"); if (!b) return; const a = b.dataset.a; step(a); if (a === "reset") return; clearTimeout(hold); hold = setTimeout(() => { rep = setInterval(() => step(a), 60); }, 320); });
    const stop = () => { clearTimeout(hold); clearInterval(rep); };
    addEventListener("pointerup", stop); addEventListener("pointercancel", stop); pad.addEventListener("pointerleave", stop);
    drawGrid(); draw();
  }

  /* ================================================================ aquarium: build a tank */
  const room = $("#aqroom");
  if (room) {
    const tank = $("#aqtank"), layer = $("#aqitems"), sandEl = $("#aqsub");
    const ROOMS = [["coral_cottage", "Coral Cottage"], ["cozy_den", "Cozy Den"], ["golden_hall", "Golden Hall"], ["midnight_study", "Midnight Study"], ["mint_studio", "Mint Studio"], ["royal_parlor", "Royal Parlor"], ["seaside_cottage", "Seaside Cottage"], ["sunset_loft", "Sunset Loft"]];
    const SUBS = [["sand", "Sand"], ["gravel", "Gravel"], ["pebbles", "Pebbles"], ["coral", "Coral sand"], ["black", "Black sand"]];
    const ITEMS = [["decor_coral", "Coral", 15], ["decor_seaweed", "Seaweed", 11], ["decor_leaf", "Leaf plant", 8], ["decor_rock", "Rock", 14], ["equip_chest", "Treasure chest", 17], ["equip_airstone", "Air stone", 8], ["equip_pump", "Pump", 13], ["equip_light", "Light", 40]];
    const S = { room: "coral_cottage", sub: "sand", items: [], fish: [] };
    let uid = 0;

    $("#aqrooms").innerHTML = ROOMS.map(([k, n]) => `<button type="button" class="sw" data-r="${k}" aria-pressed="${k === S.room}" title="${n}"><i style="background-image:url(${IMG}aq/${k}_wall.webp)"></i><span>${n}</span></button>`).join("");
    $("#aqsubs").innerHTML = SUBS.map(([k, n]) => `<button type="button" class="chipbtn" data-s="${k}" aria-pressed="${k === S.sub}">${n}</button>`).join("");
    $("#aqadd").innerHTML = ITEMS.map(([k, n]) => `<button type="button" class="chipbtn" data-i="${k}"><img src="${IMG}aq/${k}.webp" alt="">${n}</button>`).join("");
    $("#aqfish").innerHTML = D.player.map((f) => `<button type="button" class="pk" data-f="${f.id}" title="Add ${f.name}" aria-label="Add ${f.name}"><img src="${IMG}fish/${f.img}.webp" alt=""></button>`).join("");

    function setRoom() {
      const u = (n) => `url("${new URL(IMG + "aq/" + S.room + "_" + n + ".webp", document.baseURI).href}")`;
      room.style.setProperty("--wall", u("wall")); room.style.setProperty("--wain", u("wainscot")); room.style.setProperty("--floor", u("floor"));
      $$("#aqrooms .sw").forEach((b) => b.setAttribute("aria-pressed", b.dataset.r === S.room));
    }
    function setSub() { sandEl.style.backgroundImage = `url(${IMG}aq/substrate_${S.sub}.webp)`; $$("#aqsubs .chipbtn").forEach((b) => b.setAttribute("aria-pressed", b.dataset.s === S.sub)); }

    function addItem(kind, x, y) {
      const def = ITEMS.find((i) => i[0] === kind); if (!def) return;
      const it = { id: ++uid, kind, x: x ?? 12 + Math.random() * 76, y: y ?? (kind === "equip_light" ? 4 : 90 - Math.random() * 3), w: def[2] };
      const el = document.createElement("div"); el.className = "aqi " + kind; el.dataset.id = it.id; el.title = def[1] + " - drag to move, double-click to remove";
      el.innerHTML = `<img src="${IMG}aq/${kind}.webp" alt="${def[1]}" draggable="false">` + (kind === "equip_airstone" ? '<i class="ab"></i><i class="ab"></i><i class="ab"></i><i class="ab"></i>' : "");
      el.style.width = it.w + "%"; it.el = el; place(it); layer.appendChild(el); S.items.push(it);
      if (kind === "equip_light") tank.classList.add("lit");
      el.animate([{ transform: "translate(-50%, -100%) scale(.2)", opacity: 0 }, { transform: "translate(-50%, -100%) scale(1.08)", opacity: 1 }, { transform: "translate(-50%, -100%) scale(1)", opacity: 1 }], { duration: 380, easing: "ease-out" });
    }
    function place(it) { it.el.style.left = it.x + "%"; it.el.style.top = it.y + "%"; }
    function removeItem(it) { it.el.remove(); S.items = S.items.filter((i) => i !== it); if (!S.items.some((i) => i.kind === "equip_light")) tank.classList.remove("lit"); }

    // drag items around the tank
    let drag = null;
    layer.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".aqi"); if (!el) return; e.preventDefault();
      const it = S.items.find((i) => i.id === +el.dataset.id); const r = layer.getBoundingClientRect();
      drag = { it, ox: (e.clientX - r.left) / r.width * 100 - it.x, oy: (e.clientY - r.top) / r.height * 100 - it.y }; el.classList.add("drag"); el.setPointerCapture(e.pointerId);
      layer.appendChild(el);
    });
    layer.addEventListener("pointermove", (e) => {
      if (!drag) return; const r = layer.getBoundingClientRect();
      drag.it.x = clamp((e.clientX - r.left) / r.width * 100 - drag.ox, 3, 97); drag.it.y = clamp((e.clientY - r.top) / r.height * 100 - drag.oy, 6, 98); place(drag.it);
    });
    const drop = () => { if (drag) { drag.it.el.classList.remove("drag"); drag = null; } };
    layer.addEventListener("pointerup", drop); layer.addEventListener("pointercancel", drop);
    layer.addEventListener("dblclick", (e) => { const el = e.target.closest(".aqi"); if (el) removeItem(S.items.find((i) => i.id === +el.dataset.id)); });

    // swimming fish
    const fishLayer = $("#aqswim");
    function addFish(id, x) {
      const f = D.player.find((p) => p.id === id); if (!f) return;
      const el = document.createElement("div"); el.className = "aqf"; const w = 15 + Math.random() * 4; el.style.width = w + "%";
      const inner = document.createElement("div");
      if (f.sheet) UI.sprite(inner, f.sheet); else inner.innerHTML = `<img src="${IMG}fish/${f.img}.webp" alt="">`;
      el.appendChild(inner); fishLayer.appendChild(el);
      const o = { el, x: x ?? Math.random() * 100, y: 18 + Math.random() * 46, dir: Math.random() < 0.5 ? -1 : 1, v: 5 + Math.random() * 6, ph: Math.random() * 6, w };
      S.fish.push(o);
      if (S.fish.length > 8) { const old = S.fish.shift(); old.el.remove(); }
    }
    let t0 = performance.now(), inView = true;
    new IntersectionObserver((es) => (inView = es[0].isIntersecting)).observe(room);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches && !/[?&]motion=1/.test(location.search);
    (function loop(now) {
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      if (inView) for (const f of S.fish) {
        if (!reduce) { f.x += f.dir * f.v * dt; f.ph += dt * 1.6; }
        if (f.x > 104) { f.dir = -1; f.y = 18 + Math.random() * 46; } if (f.x < -4) { f.dir = 1; f.y = 18 + Math.random() * 46; }
        f.el.style.left = f.x + "%"; f.el.style.top = f.y + Math.sin(f.ph) * 2.2 + "%"; f.el.style.transform = `translateX(-50%) scaleX(${f.dir})`;
      }
      requestAnimationFrame(loop);
    })(t0);

    $("#aqrooms").addEventListener("click", (e) => { const b = e.target.closest(".sw"); if (b) { S.room = b.dataset.r; setRoom(); } });
    $("#aqsubs").addEventListener("click", (e) => { const b = e.target.closest(".chipbtn"); if (b) { S.sub = b.dataset.s; setSub(); } });
    $("#aqadd").addEventListener("click", (e) => { const b = e.target.closest(".chipbtn"); if (b) addItem(b.dataset.i); });
    $("#aqfish").addEventListener("click", (e) => { const b = e.target.closest(".pk"); if (b) { addFish(b.dataset.f, 50); UI.hydrate(fishLayer); } });
    $("#aqclear").addEventListener("click", () => { S.items.slice().forEach(removeItem); S.fish.forEach((f) => f.el.remove()); S.fish = []; });

    setRoom(); setSub();
    [["decor_seaweed", 10, 92], ["decor_coral", 24, 93], ["decor_rock", 62, 94], ["decor_seaweed", 88, 92], ["equip_chest", 78, 93], ["equip_airstone", 44, 94], ["equip_light", 50, 3]].forEach(([k, x, y]) => addItem(k, x, y));
    ["clownfish", "yellow-tang", "royal-gramma"].forEach((id, i) => addFish(id, 15 + i * 32));
    UI.hydrate(fishLayer);
  }
})();
