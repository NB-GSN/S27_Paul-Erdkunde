/* ============ HILFSFUNKTIONEN ============ */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const app = document.getElementById("app");
const MON = ["J","F","M","A","M","J","J","A","S","O","N","D"];
const MONL = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const fmt = n => String(n).replace(".", ",").replace("-", "−");
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sum = a => a.reduce((x, y) => x + y, 0);
const mean1 = a => Math.round(sum(a) / a.length * 10) / 10;

/* Task-IDs vergeben */
const ALL_TASKS = {};
for (const id of ROUTE) STATIONS[id].tasks.forEach((t, i) => { t.id = id + "-" + i; t.st = id; ALL_TASKS[t.id] = t; });
const BOSS_ZONE = [null, "savanne", "boreal", "basis", "basis", "mittelmeer", "savanne", "regenwald", "basis", null, "subpolar", "regenwald", "mittelmeer", "savanne"];
BOSS_TASKS.forEach((t, i) => { t.id = "boss-" + i; t.st = "boss"; t.z = BOSS_ZONE[i] || null; ALL_TASKS[t.id] = t; });
const zoneOf = t => t.st === "boss" ? t.z : t.st;

/* Kompetenzen für die Auswertung */
const SKILLS = {
  diagramm: { name: "Klimadiagramme lesen und zuordnen", tip: "Nimm dir ein Klimadiagramm und geh die 4 Schritte vom Arbeitsblatt durch. Frag dich immer zuerst: Wie warm ist der wärmste Monat, wie kalt der kälteste? Gibt es eine Trockenzeit (Säulen unter der Kurve)? Die Lernkarten helfen dir beim Zuordnen." },
  rechnen: { name: "Jahresmittel und Jahressumme berechnen", tip: "Jahresdurchschnitt: alle 12 Temperaturen addieren und durch 12 teilen. Jahressumme: alle 12 Niederschlagswerte addieren, nicht teilen! Rechne in Gruppen (Januar bis Juni, Juli bis Dezember) und kontrolliere einmal mit dem Taschenrechner." },
  zeichnen: { name: "Klimadiagramme zeichnen", tip: "Übe die Diagramm-Werkstatt in der Station Regenwald noch einmal. Merke: 10 °C entsprechen 20 mm, ab 100 mm ist ein Kästchen 100 mm. Erst Einheiten beschriften, dann Säulen, dann die Temperaturkurve." },
  karte: { name: "Zonen auf der Weltkarte finden", tip: "Nimm die stumme Karte aus dem Unterricht und zeichne die Zonen farbig ein. Orientiere dich an den Linien: Regenwald am Äquator, Wüsten an den Wendekreisen, Tundra am nördlichen Polarkreis." },
  erklaeren: { name: "In eigenen Worten erklären", tip: "Schreib Erklärungen als Kette: Ursache, dann Folge, verbunden mit „weil“ und „deshalb“. Beispiel: Die Sonne steht hoch, deshalb ist es warm, deshalb verdunstet viel Wasser, deshalb regnet es täglich. Vergleiche danach mit der Musterlösung." },
  wissen: { name: "Fachwissen und Fachbegriffe", tip: "Lies die Lernkarten der schwächeren Zonen laut vor und erkläre danach jemandem drei Fachbegriffe ohne hinzuschauen (zum Beispiel Permafrost, Oase, Brandrodung)." }
};
function skillOf(t) { if (t.t === "draw") return "zeichnen"; if (t.t === "free") return "erklaeren"; if (t.t === "map") return "karte"; if (t.t === "num" && t.tab) return "rechnen"; if (t.d || t.t === "arid") return "diagramm"; return "wissen"; }
const ZONE_TIP = {
  basis: "Wiederhole, warum die Zonen wie Gürtel um die Erde liegen (Einfallswinkel der Sonne), und die Regel für arid und humid.",
  polar: "Merke dir: kein Monat über 0 °C, kaum Niederschlag, Polartag und Polarnacht nördlich des Polarkreises.",
  subpolar: "Deine Vortragszone! Erkläre Permafrost, Vegetationszeit und warum keine Bäume wachsen, so als würdest du den Vortrag nochmal halten.",
  boreal: "Merke dir: eiskalte Winter, aber mehrere Monate über 10 °C. Nadelbäume sind an die kurze Vegetationszeit angepasst. Jakutsk ist so kalt, weil es weit weg vom Meer liegt.",
  mittelmeer: "Merke dir: Regen im Winter, Trockenzeit im Sommer. Hartlaubgewächse schützen sich so vor Verdunstung.",
  wueste: "Merke dir: 0 bis 2 humide Monate, große Tag-Nacht-Unterschiede, Wüsten liegen an den Wendekreisen, Oasen und der Nil als Fremdlingsfluss.",
  savanne: "Merke dir: Regenzeit und Trockenzeit. Vom Äquator weg erst Feucht-, dann Trocken-, dann Dornsavanne. Desertifikation durch Überweidung.",
  regenwald: "Das ist euer aktuelles Thema. Wiederhole Tageszeitenklima, Stockwerkbau, Nährstoffkreislauf und Brandrodung, am besten mit den Aufgaben im Buch S. 82 und 84."
};

/* ============ SPEICHER ============ */
const LS = "expedition-aequator-v1";
function blank() { return {v:1, name:"", stamps:{}, stats:{}, diary:[], mastered:{}, time:0, log:[], boss:{tries:0, wins:0, best:null}, unlockAll:false}; }
let S = (() => { try { const s = JSON.parse(localStorage.getItem(LS)); if (s && s.v === 1) return Object.assign(blank(), s); } catch (e) {} return blank(); })();
function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
function stat(id) { return S.stats[id] || (S.stats[id] = {answered:0, correct:0, first:0, hints:0}); }

let R = null; // aktuelle Runde
setInterval(() => { if (R && document.visibilityState === "visible") { S.time += 5; save(); } }, 5000);

/* ============ KLIMADIAGRAMM ============ */
function geom(T, N) {
  const uN = n => n <= 100 ? n / 20 : 5 + (n - 100) / 100;
  const topU = Math.max(3, Math.ceil(Math.max(...T) / 10 - 1e-9), Math.ceil(uN(Math.max(...N)) - 1e-9));
  const botU = Math.min(0, Math.floor(Math.min(...T) / 10));
  const U = 22, L = 44, Rm = 48, TOP = 62, B = 26, colW = 26;
  const W = L + 12 * colW + Rm, H = TOP + (topU - botU) * U + B, y0 = TOP + topU * U;
  const tLabMax = Math.min(topU, Math.max(3, Math.ceil(Math.max(...T) / 10 - 1e-9)) + 1);
  return { U, L, Rm, TOP, B, colW, W, H, y0, topU, botU, uN, tLabMax,
    yT: t => y0 - t / 10 * U, yN: n => y0 - uN(n) * U, xC: i => L + i * colW + colW / 2,
    tFromY: y => (y0 - y) / U * 10,
    nFromY: y => { const u = (y0 - y) / U; return u <= 5 ? u * 20 : 100 + (u - 5) * 100; } };
}
function axesSVG(g, header) {
  let s = "";
  for (let k = g.botU; k <= g.topU; k++) {
    const y = g.y0 - k * g.U;
    s += `<line x1="${g.L}" x2="${g.L + 12 * g.colW}" y1="${y}" y2="${y}" class="${k === 0 ? "cd-zero" : "cd-grid"}"/>`;
    if (k <= g.tLabMax) s += `<text x="${g.L - 6}" y="${y + 4}" class="cd-lab cd-t" text-anchor="end">${fmt(k * 10)}</text>`;
    if (k > 0) s += `<text x="${g.L + 12 * g.colW + 6}" y="${y + 4}" class="cd-lab cd-n">${k <= 5 ? k * 20 : 100 + (k - 5) * 100}</text>`;
  }
  s += `<line x1="${g.L}" x2="${g.L}" y1="${g.TOP - 6}" y2="${g.y0 - g.botU * g.U}" class="cd-ax cd-axt"/>`;
  s += `<line x1="${g.L + 12 * g.colW}" x2="${g.L + 12 * g.colW}" y1="${g.TOP - 6}" y2="${g.y0}" class="cd-ax cd-axn"/>`;
  if (g.topU > 5) { const y = g.y0 - 5 * g.U; s += `<path d="M${g.L + 12 * g.colW - 5} ${y - 3} l10 -4 M${g.L + 12 * g.colW - 5} ${y + 1} l10 -4" class="cd-break"/>`; }
  const yb = g.y0 - g.botU * g.U;
  MON.forEach((m, i) => s += `<text x="${g.xC(i)}" y="${yb + 17}" class="cd-lab" text-anchor="middle">${m}</text>`);
  s += header;
  return s;
}
function climateSVG(key, o = {}) {
  const c = CLIMATE[key], g = geom(c.T, c.N);
  const name = o.hide ? "Station ???" : `${c.name} (${c.land})`;
  const info = o.hide ? "Lage: geheim" : `${c.pos} · ${c.h}`;
  const header = `<text x="${g.L}" y="18" class="cd-title">${esc(name)}</text>
    <text x="${g.L}" y="34" class="cd-sub">${esc(info)}</text>
    <text x="${g.L + 12 * g.colW}" y="18" class="cd-sub" text-anchor="end">${fmt(mean1(c.T))} °C</text>
    <text x="${g.L + 12 * g.colW}" y="34" class="cd-sub" text-anchor="end">${sum(c.N)} mm</text>
    <text x="${g.L - 6}" y="${g.TOP - 12}" class="cd-unit cd-t" text-anchor="end">°C</text>
    <text x="${g.L + 12 * g.colW + 6}" y="${g.TOP - 12}" class="cd-unit cd-n">mm</text>`;
  let s = axesSVG(g, header);
  c.N.forEach((n, i) => { if (n > 0) s += `<rect x="${g.L + i * g.colW + 4}" y="${g.yN(n)}" width="${g.colW - 8}" height="${g.y0 - g.yN(n)}" class="cd-bar"/>`; });
  s += `<polyline points="${c.T.map((t, i) => g.xC(i) + "," + g.yT(t)).join(" ")}" class="cd-line"/>`;
  c.T.forEach((t, i) => s += `<circle cx="${g.xC(i)}" cy="${g.yT(t)}" r="3" class="cd-dot"/>`);
  if (o.tap) c.T.forEach((t, i) => s += `<rect x="${g.L + i * g.colW}" y="${g.TOP - 6}" width="${g.colW}" height="${g.y0 - g.botU * g.U - g.TOP + 26}" class="cd-tap" data-m="${i}"/>`);
  return `<svg class="climate" viewBox="0 0 ${g.W} ${g.H}" role="img" aria-label="Klimadiagramm ${esc(name)}">${s}</svg>`;
}
function climateTable(key) {
  const c = CLIMATE[key];
  return `<div class="tablewrap"><table class="ctab"><thead><tr><th></th>${MON.map(m => `<th>${m}</th>`).join("")}</tr></thead><tbody>
    <tr><th>°C</th>${c.T.map(v => `<td>${fmt(v)}</td>`).join("")}</tr>
    <tr><th>mm</th>${c.N.map(v => `<td>${v}</td>`).join("")}</tr></tbody></table></div>`;
}
const isArid = (key, i) => CLIMATE[key].N[i] < 2 * CLIMATE[key].T[i];

/* ============ WELTKARTE ============ */
const MK = 1000 / 360, MTOP = 84, MH = 450;
const proj = (lon, lat) => [(lon + 180) * MK, (MTOP - lat) * MK];
const unproj = (x, y) => [x / MK - 180, MTOP - y / MK];
function mapBase(extra = "") {
  const lines = [[0, "Äquator", "eq"], [23.44, "Wendekreis", "tr"], [-23.44, "Wendekreis", "tr"], [66.56, "Polarkreis", "pc"], [-66.56, "Polarkreis", "pc"]];
  let s = `<rect width="1000" height="${MH}" class="m-ocean"/><use href="#land" class="m-land"/>`;
  for (const [lat, lab, cl] of lines) { const y = proj(0, lat)[1]; s += `<line x1="0" x2="1000" y1="${y}" y2="${y}" class="m-lat m-${cl}"/><text x="994" y="${y - 4}" text-anchor="end" class="m-latlab">${lab}</text>`; }
  return `<svg class="worldmap" viewBox="0 0 1000 ${MH}" role="img" aria-label="Weltkarte">${s}${extra}</svg>`;
}
function svgPoint(svg, ev) { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }

/* ============ STEMPEL ============ */
function stampSVG(id, size = 96) {
  const st = STATIONS[id];
  return `<svg class="stamp" width="${size}" height="${size}" viewBox="0 0 100 100" style="--z:${st.color}" aria-hidden="true">
    <circle cx="50" cy="50" r="45" class="st-o"/><circle cx="50" cy="50" r="38" class="st-i"/>
    <path id="arc-${id}" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
    <text class="st-t"><textPath href="#arc-${id}" startOffset="50%" text-anchor="middle">${esc(st.name.toUpperCase())}</textPath></text>
    <text x="50" y="60" text-anchor="middle" class="st-n">${ROUTE.indexOf(id) + 1}</text>
    <text x="50" y="76" text-anchor="middle" class="st-s">${esc(st.place.split(",")[0])}</text></svg>`;
}

/* ============ STARTSEITE / KARTE ============ */
const unlocked = i => S.unlockAll || i === 0 || !!S.stamps[ROUTE[i - 1]];
const bossOpen = () => S.unlockAll || ROUTE.every(id => S.stamps[id]);
const totalStars = () => ROUTE.reduce((a, id) => a + (S.stamps[id] ? S.stamps[id].stars : 0), 0);

function routePath() {
  const pts = ROUTE.map(id => [STATIONS[id].lon, STATIONS[id].lat]);
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    let [a, b] = [pts[i], pts[i + 1]];
    const [x1, y1] = proj(...a), [x2, y2] = proj(...b);
    if (Math.abs(b[0] - a[0]) > 180) { // über die Datumsgrenze
      const yMid = (y1 + y2) / 2;
      d += `M${x1} ${y1} L0 ${yMid} M1000 ${yMid} L${x2} ${y2} `;
    } else d += `M${x1} ${y1} L${x2} ${y2} `;
  }
  return `<path d="${d}" class="m-route"/>`;
}
function home() {
  R = null;
  let marks = routePath();
  ROUTE.forEach((id, i) => {
    const st = STATIONS[id], [x, y] = proj(st.lon, st.lat), done = S.stamps[id], open = unlocked(i);
    const cur = open && !done;
    marks += `<g class="m-st ${done ? "done" : ""} ${open ? "open" : "locked"} ${cur ? "cur" : ""}" data-go="${id}" tabindex="${open ? 0 : -1}" role="button" aria-label="${esc(st.name)}">
      ${cur ? `<circle cx="${x}" cy="${y}" r="20" class="m-pulse"/>` : ""}
      <circle cx="${x}" cy="${y}" r="14" style="fill:${open ? st.color : "var(--locked)"}" class="m-dot"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" class="m-num">${done ? "✓" : i + 1}</text></g>`;
  });
  const [bx, by] = proj(-25, 0);
  marks += `<g class="m-st m-boss ${bossOpen() ? "open" : "locked"}" data-go="boss" role="button" tabindex="0" aria-label="Bossfight"><circle cx="${bx}" cy="${by}" r="18" class="m-bossdot"/>${swirl(bx, by, 11)}</g>`;
  const diaryN = S.diary.length;
  app.innerHTML = `
  <header class="top">
    <div class="brand"><h1>Expedition Äquator</h1><p class="sub">${S.name ? `Forscher*in ${esc(S.name)} · ` : ""}${totalStars()} von 24 Sternen · ${Object.keys(S.stamps).length} von 8 Stempeln</p></div>
    <nav class="topnav">
      <button class="btn ghost" data-nav="atlas">Lernkarten</button>
      <button class="btn ghost" data-nav="pass">Reisepass</button>
      <button class="btn ghost" data-nav="report">Auswertung</button>
      <button class="btn ghost" data-nav="diary">Forschertagebuch${diaryN ? ` <span class="badge">${diaryN}</span>` : ""}</button>
    </nav>
  </header>
  ${!S.name ? `<form class="card namecard" id="nameForm"><label for="nameIn">Wie heißt du, Forscher*in?</label><div class="row"><input id="nameIn" maxlength="20" autocomplete="off" placeholder="Dein Name"><button class="btn primary">Los</button></div></form>` : ""}
  <section class="card mapcard">${mapBase(marks)}
    <p class="maphint">Reise von Station zu Station. Jede Station schaltet die nächste frei. Am Ende wartet der Wetterwirbel.</p></section>
  <section class="stations">${ROUTE.map((id, i) => stationCard(id, i)).join("")}
    <button class="stcard bosscard ${bossOpen() ? "" : "locked"}" data-go="boss" ${bossOpen() ? "" : "disabled"}>
      <span class="bossicon"><svg viewBox="0 0 40 40" width="44" height="44">${swirl(20, 20, 16)}</svg></span>
      <span class="stbody"><span class="stzone">Endgegner · Probetest</span><span class="stname">Der Wetterwirbel</span>
      <span class="stplace">${bossOpen() ? (S.boss.wins ? `Besiegt (${S.boss.wins}×). Bestes Ergebnis: ${S.boss.best}` : "Bereit, wenn du es bist.") : "Sammle alle 8 Stempel, um ihn herauszufordern."}</span></span></button>
  </section>
  <footer class="foot"><button class="linkbtn" data-nav="parents">Für Eltern</button></footer>`;
  $$("[data-go]").forEach(el => { const go = () => { const id = el.dataset.go; if (id === "boss") { if (bossOpen()) bossIntro(); else toast("Der Wetterwirbel versteckt sich noch. Sammle zuerst alle 8 Stempel."); } else { const i = ROUTE.indexOf(id); if (unlocked(i)) stationIntro(id); else toast("Diese Station ist noch gesperrt. Schließ zuerst die vorherige ab."); } }; el.addEventListener("click", go); el.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); });
  $$("[data-nav]").forEach(b => b.addEventListener("click", () => ({atlas, pass: passport, diary, parents, report})[b.dataset.nav]()));
  const f = $("#nameForm"); if (f) f.addEventListener("submit", e => { e.preventDefault(); S.name = $("#nameIn").value.trim(); save(); home(); });
  window.scrollTo(0, 0);
}
function swirl(x, y, r) {
  return `<g class="swirl" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y} m0 ${-r} a${r} ${r} 0 1 1 ${-r * 0.9} ${r * 0.6} M${x} ${y} m0 ${-r * 0.55} a${r * 0.55} ${r * 0.55} 0 1 1 ${-r * 0.5} ${r * 0.35} M${x} ${y} m0 ${-r * 0.2} a${r * 0.2} ${r * 0.2} 0 1 1 ${-r * 0.18} ${r * 0.12}" class="sw"/></g>`;
}
function stationCard(id, i) {
  const st = STATIONS[id], done = S.stamps[id], open = unlocked(i);
  const stars = done ? "★".repeat(done.stars) + "☆".repeat(3 - done.stars) : "☆☆☆";
  return `<button class="stcard ${open ? "" : "locked"}" data-go="${id}" style="--z:${st.color}" ${open ? "" : "disabled"}>
    <span class="stnum">${i + 1}</span>
    <span class="stbody"><span class="stzone">${esc(st.zone)}${st.bonus ? ' · <b class="bonus">Deine Vortragszone</b>' : ""}${st.focus ? ' · <b class="bonus">aktuelles Thema</b>' : ""}</span>
    <span class="stname">${esc(st.name)}</span><span class="stplace">${esc(st.place)}</span></span>
    <span class="ststars" aria-label="${done ? done.stars : 0} von 3 Sternen">${open ? stars : "gesperrt"}</span></button>`;
}
function toast(msg) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ============ LERNKARTE / STATIONS-INTRO ============ */
function cardHTML(id) {
  const st = STATIONS[id];
  return `<div class="lernkarte" style="--z:${st.color}"><div class="lk-head"><span class="lk-zone">${esc(st.zone)}</span><h3>${esc(st.name)}</h3></div>
    <dl>${Object.entries(st.card).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>`;
}
function stationIntro(id) {
  const st = STATIONS[id], done = S.stamps[id];
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
  <section class="intro" style="--z:${st.color}">
    <div class="introtext"><p class="kicker">Station ${ROUTE.indexOf(id) + 1} · ${esc(st.place)}</p><h2>${esc(st.name)}</h2><p class="story">${esc(st.intro)}</p>
      <p class="meta">${st.round} Aufgaben · etwa ${st.round + 2} Minuten${done ? ` · bisher ${"★".repeat(done.stars)}` : ""}</p>
      <div class="row"><button class="btn primary big" id="go">Expedition starten</button></div>
      <p class="small">Lies dir vorher die Lernkarte durch. Während der Aufgaben gibt es Tipps, aber jeder Tipp kostet einen Stern-Punkt.</p></div>
    <div class="introside">${climateSVG(st.d)}</div>
  </section>${cardHTML(id)}`;
  $("#back").onclick = home; $("#go").onclick = () => startStation(id);
  window.scrollTo(0, 0);
}
function atlas() {
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
  <h2 class="pagetitle">Lernkarten</h2><p class="lead">Alle Zonen auf einen Blick, so wie in eurer Tabelle im Unterricht. Gut zum Wiederholen vor dem Test.</p>
  <div class="method card"><h3>Klimadiagramm auswerten in 4 Schritten</h3><ol>
    <li><b>Wo? Wann? Was?</b> Station, Land, Lage, Höhe.</li>
    <li><b>Inhalte beschreiben:</b> erst die Temperaturkurve (höchster und niedrigster Wert, Verlauf), dann die Niederschlagssäulen (Summe, Maximum, Minimum).</li>
    <li><b>Kernaussage:</b> Fasse das Klima in einem Satz zusammen.</li>
    <li><b>Interpretieren:</b> Warum ist das so? Was bedeutet es für Pflanzen, Tiere und Menschen?</li></ol>
    <p><b>Arid oder humid?</b> Säule über der Kurve = humid (feucht). Säule unter der Kurve = arid (trocken). Maßstab: 10 °C entsprechen 20 mm. Ab 100 mm wird die Niederschlagsachse gestaucht.</p>
    <p><b>Klimatypen:</b> arid 0 bis 2 humide Monate · semiarid 3 bis 5 · semihumid 6 bis 9 · humid 10 bis 12.</p></div>
  <div class="atlasgrid">${ROUTE.map(cardHTML).join("")}</div>`;
  $("#back").onclick = home; window.scrollTo(0, 0);
}
function passport() {
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
  <h2 class="pagetitle">Reisepass${S.name ? ` von ${esc(S.name)}` : ""}</h2><p class="lead">Für jede geschaffte Station gibt es einen Stempel. Wer alle 8 hat, darf gegen den Wetterwirbel antreten.</p>
  <div class="passgrid">${ROUTE.map(id => `<div class="passslot ${S.stamps[id] ? "has" : ""}">${S.stamps[id] ? stampSVG(id, 110) : `<span>${esc(STATIONS[id].name)}</span>`}<small>${S.stamps[id] ? "★".repeat(S.stamps[id].stars) + "☆".repeat(3 - S.stamps[id].stars) : "noch offen"}</small></div>`).join("")}
  <div class="passslot boss ${S.boss.wins ? "has" : ""}">${S.boss.wins ? `<svg viewBox="0 0 40 40" width="90" height="90">${swirl(20, 20, 16)}</svg><small>Wetterwirbel besiegt</small>` : "<span>Wetterwirbel</span><small>noch nicht besiegt</small>"}</div></div>`;
  $("#back").onclick = home; window.scrollTo(0, 0);
}

/* ============ RUNDEN ============ */
function startStation(id) {
  const st = STATIONS[id];
  R = { kind:"station", id, st, n:st.round, i:0, target:1.4, used:new Set(), pts:0, correct:0, log:[] };
  nextStation();
}
function pickStationTask() {
  const pool = R.st.tasks.filter(t => !R.used.has(t.id));
  const must = pool.find(t => t.must && !S.mastered[t.id]);
  if (must && R.i >= 1) return must;
  let best = null, bs = 1e9;
  for (const t of pool) { const sc = Math.abs(t.l - R.target) + (S.mastered[t.id] ? 0.9 : 0) + Math.random() * 0.7; if (sc < bs) { bs = sc; best = t; } }
  return best;
}
function nextStation() {
  if (R.i >= R.n) return finishStation();
  const t = pickStationTask(); R.used.add(t.id);
  const dots = Array.from({length: R.n}, (_, k) => `<span class="pdot ${k < R.i ? (R.log[k] ? "ok" : "bad") : k === R.i ? "now" : ""}"></span>`).join("");
  showTask(t, {
    head: `<div class="taskhead" style="--z:${R.st.color}"><button class="btn ghost small" id="quit">← Abbrechen</button><div class="tinfo"><b>${esc(R.st.name)}</b><span>Aufgabe ${R.i + 1} von ${R.n}</span></div><div class="pdots">${dots}</div></div>`,
    tries: 2, onDone: res => {
      record(t, res); R.log.push(res.ok); R.pts += res.pts; if (res.ok) R.correct++;
      R.target = Math.max(1, Math.min(3, R.target + (res.ok ? (res.hints === 0 && res.attempt === 1 ? 0.7 : 0.2) : -0.8)));
      R.i++; nextStation();
    }
  });
}
function finishStation() {
  const ratio = R.pts / (3 * R.n), passed = R.correct >= Math.ceil(R.n / 2);
  const stars = ratio >= 0.78 ? 3 : ratio >= 0.5 ? 2 : 1;
  const id = R.id, prev = S.stamps[id];
  if (passed) S.stamps[id] = { stars: Math.max(stars, prev ? prev.stars : 0), at: Date.now() };
  S.log.push({ at: Date.now(), what: R.st.name, correct: R.correct, n: R.n, stars: passed ? stars : 0 }); save();
  const nextIdx = ROUTE.indexOf(id) + 1, nextId = ROUTE[nextIdx];
  R = null;
  app.innerHTML = `<section class="result card">
    ${passed ? `<div class="stampin">${stampSVG(id, 150)}</div><h2>Stempel erhalten!</h2>` : `<h2>Fast geschafft</h2>`}
    <p class="bigstars" aria-label="${passed ? stars : 0} Sterne">${passed ? "★".repeat(stars) + "☆".repeat(3 - stars) : "☆☆☆"}</p>
    <p class="lead">${S.log[S.log.length - 1].correct} von ${S.log[S.log.length - 1].n} Aufgaben richtig.
    ${passed ? (stars === 3 ? "Stark, volle Punktzahl für den Forscherausweis!" : "Für 3 Sterne: Aufgaben beim ersten Versuch und ohne Tipps lösen.") : `Für den Stempel brauchst du mindestens ${Math.ceil(STATIONS[id].round / 2)} richtige Aufgaben. Lies die Lernkarte nochmal und versuch es erneut. Die Aufgaben sind jedes Mal etwas anders.`}</p>
    <div class="row center">
      <button class="btn ghost" id="again">Nochmal spielen</button>
      ${passed && nextId ? `<button class="btn primary" id="next">Weiter nach: ${esc(STATIONS[nextId].name)}</button>` : ""}
      ${passed && !nextId ? `<button class="btn primary" id="boss">Zum Wetterwirbel</button>` : ""}
      <button class="btn ghost" id="map">Zur Karte</button></div></section>`;
  $("#again").onclick = () => stationIntro(id); $("#map").onclick = home;
  if ($("#next")) $("#next").onclick = () => stationIntro(nextId);
  if ($("#boss")) $("#boss").onclick = bossIntro;
  window.scrollTo(0, 0);
}
function record(t, res) {
  const sk = skillOf(t), k = (S.skills = S.skills || {})[sk] || (S.skills[sk] = { a: 0, c: 0 }); k.a++; if (res.ok) k.c++;
  if (R) (R.res = R.res || []).push({ id: t.id, ok: res.ok });
  const s = stat(t.st); s.answered++; if (res.ok) s.correct++; if (res.ok && res.attempt === 1 && res.hints === 0) s.first++; s.hints += res.hints;
  if (res.ok) { S.mastered[t.id] = (S.mastered[t.id] || 0) + 1; }
  else if (!S.diary.includes(t.id)) S.diary.push(t.id);
  if (res.ok && R && R.kind === "review") S.diary = S.diary.filter(x => x !== t.id);
  save();
}

/* ---------- Forschertagebuch ---------- */
function diary() {
  const items = S.diary.map(id => ALL_TASKS[id]).filter(Boolean);
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
  <h2 class="pagetitle">Forschertagebuch</h2>
  <p class="lead">${items.length ? `Hier sammeln sich Aufgaben, die noch nicht geklappt haben. Wenn du sie in der Wiederholung richtig löst, verschwinden sie.` : "Dein Tagebuch ist leer. Entweder hast du alles richtig, oder die Reise hat gerade erst begonnen."}</p>
  ${items.length ? `<div class="row"><button class="btn primary big" id="rev">Wiederholen (${Math.min(8, items.length)} Aufgaben)</button></div>
  <ul class="dlist">${items.map(t => `<li><span class="dz" style="--z:${t.st === "boss" ? "var(--boss)" : STATIONS[t.st].color}">${t.st === "boss" ? "Wetterwirbel" : esc(STATIONS[t.st].name)}</span>${esc(t.q)}</li>`).join("")}</ul>` : ""}`;
  $("#back").onclick = home;
  if ($("#rev")) $("#rev").onclick = () => { R = { kind:"review", q: shuffle(items).slice(0, 8), i:0, ok:0 }; nextReview(); };
  window.scrollTo(0, 0);
}
function nextReview() {
  if (R.i >= R.q.length) { const n = R.q.length, ok = R.ok; S.log.push({ at: Date.now(), what: "Wiederholung", correct: ok, n, stars: 0 }); save(); R = null;
    app.innerHTML = `<section class="result card"><h2>Wiederholung geschafft</h2><p class="lead">${ok} von ${n} richtig. ${S.diary.length ? `Noch ${S.diary.length} Aufgaben im Tagebuch.` : "Dein Tagebuch ist jetzt leer!"}</p><div class="row center"><button class="btn primary" id="map">Zur Karte</button><button class="btn ghost" id="d">Tagebuch</button></div></section>`;
    $("#map").onclick = home; $("#d").onclick = diary; return; }
  const t = R.q[R.i];
  showTask(t, { head: `<div class="taskhead"><button class="btn ghost small" id="quit">← Abbrechen</button><div class="tinfo"><b>Wiederholung</b><span>${R.i + 1} von ${R.q.length}</span></div></div>`,
    tries: 2, onDone: res => { record(t, res); if (res.ok) R.ok++; R.i++; nextReview(); } });
}

/* ---------- Bossfight ---------- */
function bossIntro() {
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
  <section class="bossintro card"><div class="bossbig"><svg viewBox="0 0 120 120" width="160" height="160">${swirl(60, 60, 50)}</svg></div>
    <div><p class="kicker">Endgegner · Probetest</p><h2>Der Wetterwirbel</h2>
    <p class="story">Mitten über dem Atlantik, genau am Äquator, braut sich etwas zusammen. Der Wetterwirbel hat alle Klimadiagramme durcheinandergewirbelt und die Stationen vertauscht. Nur wer alle Zonen kennt, kann ihn stoppen.</p>
    <ul class="rules"><li>Jede richtige Antwort trifft den Wirbel. <b>10 Treffer</b> und er ist besiegt.</li>
    <li>Jede falsche Antwort kostet ein Herz. Du hast <b>4 Herzen</b>.</li>
    <li>Wie in einer echten Arbeit gibt es nur <b>einen Versuch</b> pro Aufgabe und nur <b>3 Joker</b> (Tipps) für den ganzen Kampf.</li>
    <li>Bei Aufgaben „mit eigenen Worten“ vergleichst du ehrlich mit der Musterlösung.</li></ul>
    <button class="btn primary big" id="fight">Kampf beginnen</button></div></section>`;
  $("#back").onclick = home; $("#fight").onclick = startBoss; window.scrollTo(0, 0);
}
function startBoss() {
  const extra = shuffle(ROUTE.flatMap(id => STATIONS[id].tasks.filter(t => t.l >= 2 && t.t !== "draw")));
  R = { kind:"boss", hp:10, max:10, hearts:4, jokers:3, q: shuffle(BOSS_TASKS).concat(extra), i:0, right:0, n:0 };
  S.boss.tries++; save(); nextBoss();
}
function bossHead() {
  return `<div class="taskhead bosshead"><button class="btn ghost small" id="quit">← Aufgeben</button>
    <div class="bossbar"><div class="bb-label"><svg viewBox="0 0 40 40" width="28" height="28">${swirl(20, 20, 16)}</svg><b>Wetterwirbel</b></div>
      <div class="hpbar" role="meter" aria-valuemin="0" aria-valuemax="${R.max}" aria-valuenow="${R.hp}" aria-label="Lebenspunkte Wetterwirbel"><span style="width:${R.hp / R.max * 100}%"></span></div></div>
    <div class="hearts" aria-label="${R.hearts} Herzen">${"<i class='h on'></i>".repeat(R.hearts)}${"<i class='h'></i>".repeat(4 - R.hearts)}<span class="jk">Joker: ${R.jokers}</span></div></div>`;
}
function nextBoss() {
  if (R.hp <= 0 || R.hearts <= 0) return finishBoss();
  const t = R.q[R.i++];
  showTask(t, { head: bossHead(), tries: 1, boss: true, onDone: res => {
    record(t, res); R.n++;
    if (res.ok) { R.hp--; R.right++; } else R.hearts--;
    nextBoss();
  }});
}
function finishBoss() {
  const won = R.hp <= 0, txt = `${R.right} von ${R.n} richtig`, res = R.res || [];
  if (won) { S.boss.wins++; if (!S.boss.best || R.right / R.n > parseBest(S.boss.best)) S.boss.best = txt; }
  S.log.push({ at: Date.now(), what: "Wetterwirbel", correct: R.right, n: R.n, stars: won ? 1 : 0, boss: true, won });
  S.lastBoss = { at: Date.now(), won, right: R.right, n: R.n, res }; save();
  R = null;
  app.innerHTML = `<section class="result card ${won ? "win" : ""}">
    ${won ? `<div class="bossbig defeated"><svg viewBox="0 0 120 120" width="140" height="140">${swirl(60, 60, 50)}</svg></div><h2>Der Wetterwirbel ist besiegt!</h2>`
    : `<h2>Der Wetterwirbel ist entkommen</h2>`}
    <p class="lead">${txt}. Unten findest du deine Auswertung: was schon sitzt, was du noch üben solltest und wie.</p></section>
    ${reportHTML(res, true)}
    <div class="row center"><button class="btn primary" id="again">${won ? "Nochmal kämpfen" : "Revanche"}</button><button class="btn ghost" id="d">Forschertagebuch</button><button class="btn ghost" id="map">Zur Karte</button></div>`;
  $("#again").onclick = bossIntro; $("#d").onclick = diary; $("#map").onclick = home; bindReport(); window.scrollTo(0, 0);
}
/* ---------- Auswertung ---------- */
const GRADES = [[87, "1", "sehr gut"], [73, "2", "gut"], [59, "3", "befriedigend"], [45, "4", "ausreichend"], [18, "5", "mangelhaft"], [0, "6", "ungenügend"]];
const gradeOf = p => GRADES.find(g => p >= g[0]);
function groupRes(res) {
  const sk = {}, zo = {};
  for (const r of res) { const t = ALL_TASKS[r.id]; if (!t) continue;
    const a = sk[skillOf(t)] = sk[skillOf(t)] || { a: 0, c: 0 }; a.a++; if (r.ok) a.c++;
    const z = zoneOf(t); if (z) { const b = zo[z] = zo[z] || { a: 0, c: 0 }; b.a++; if (r.ok) b.c++; } }
  return { sk, zo };
}
function reportHTML(res, fromBoss) {
  // Probetest-Ergebnis plus alles, was bisher gespielt wurde
  const g = groupRes(res);
  const allSk = S.skills || {}, allZo = {};
  ROUTE.forEach(id => { const s = S.stats[id]; if (s && s.answered) allZo[id] = { a: s.answered, c: s.correct }; });
  for (const [z, v] of Object.entries(g.zo)) { const o = allZo[z] || { a: 0, c: 0 }; allZo[z] = { a: o.a + v.a, c: o.c + v.c }; }
  const pct = v => Math.round(v.c / v.a * 100);
  const skRows = Object.keys(SKILLS).filter(k => (allSk[k] && allSk[k].a) || g.sk[k]).map(k => ({ k, v: g.sk[k] && g.sk[k].a >= 2 ? g.sk[k] : allSk[k] || g.sk[k] }));
  const zoRows = ROUTE.filter(z => allZo[z]).map(z => ({ z, v: allZo[z] }));
  const strong = [...skRows.filter(r => r.v.a >= 2 && pct(r.v) >= 85).map(r => SKILLS[r.k].name), ...zoRows.filter(r => r.v.a >= 3 && pct(r.v) >= 85).map(r => STATIONS[r.z].name + " (" + STATIONS[r.z].zone + ")")];
  const weakSk = skRows.filter(r => r.v.a >= 2 && pct(r.v) < 70).sort((a, b) => pct(a.v) - pct(b.v));
  const weakZo = zoRows.filter(r => r.v.a >= 2 && pct(r.v) < 70).sort((a, b) => pct(a.v) - pct(b.v));
  let head = "";
  if (fromBoss && res.length) {
    const p = Math.round(res.filter(r => r.ok).length / res.length * 100), gr = gradeOf(p);
    head = `<div class="grade"><div class="gbig"><span>Note</span><b>${gr[1]}</b><em>${gr[2]}</em></div>
      <div><h3>Dein Probetest</h3><p>${res.filter(r => r.ok).length} von ${res.length} Aufgaben richtig, das sind <b>${p} %</b>.</p>
      <p class="small">Die Note ist eine Schätzung nach dem üblichen Notenschlüssel (ab 87 % eine 1, ab 73 % eine 2 und so weiter). Im echten Test kann es anders aussehen, zum Beispiel wenn deine Lehrkraft mehr Wert auf Erklärungen legt.</p></div></div>`;
  }
  const bar = v => { const p = pct(v); return `<span class="pbar"><i style="width:${p}%;background:${p >= 85 ? "var(--ok)" : p >= 70 ? "var(--gold)" : "var(--bad)"}"></i></span><span class="pv">${p} % · ${v.c}/${v.a}</span>`; };
  const plan = [];
  if (weakZo[0]) plan.push(unlocked(ROUTE.indexOf(weakZo[0].z)) ? `Spiele die Station <b>${esc(STATIONS[weakZo[0].z].name)}</b> noch einmal. Lies vorher die Lernkarte.` : `Lies die Lernkarte <b>${esc(STATIONS[weakZo[0].z].name)}</b> (oben auf der Startseite unter „Lernkarten“) und spiele die Station, sobald du dort ankommst.`);
  if (weakSk[0]) plan.push(`Übe gezielt: <b>${esc(SKILLS[weakSk[0].k].name)}</b>. ${esc(SKILLS[weakSk[0].k].tip.split(". ")[0].replace(/\.$/, ""))}.`);
  if (S.diary.length) plan.push(`Wiederhole die <b>${S.diary.length} Aufgaben</b> in deinem Forschertagebuch, bis es leer ist.`);
  if (!plan.length) plan.push("Alles läuft richtig gut. Kämpf noch einmal gegen den Wetterwirbel, diesmal ganz ohne Joker.");
  plan.push("Am Tag vor dem Test: Lernkarten durchlesen und ein Klimadiagramm in 4 Schritten auswerten, schriftlich wie in der Arbeit.");
  return `<section class="card report">${head}
    <div class="rgrid">
      <div><h3>Das kannst du schon</h3>${strong.length ? `<ul class="good">${strong.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="small">Noch zu wenig gespielt, um sicher zu sagen, was schon richtig gut sitzt. Weiter so!</p>`}</div>
      <div><h3>Hier lohnt sich Üben</h3>${weakSk.length || weakZo.length ? `<ul class="weak">${weakSk.map(r => `<li><b>${esc(SKILLS[r.k].name)}</b> (${pct(r.v)} %)<p>${esc(SKILLS[r.k].tip)}</p></li>`).join("")}${weakZo.map(r => `<li><b>${esc(STATIONS[r.z].name)}</b> (${pct(r.v)} %)<p>${esc(ZONE_TIP[r.z])}</p></li>`).join("")}</ul>` : `<p>Keine echten Schwachstellen. Alles liegt bei 70 % oder mehr.</p>`}</div>
    </div>
    <h3>Dein Trainingsplan</h3><ol class="plan">${plan.map(x => `<li>${x}</li>`).join("")}</ol>
    <details class="detail"><summary>Alle Themen im Detail</summary>
      <h4>Fähigkeiten</h4><div class="ptable">${skRows.map(r => `<div class="prow"><span class="pz" style="--z:var(--pri)">${esc(SKILLS[r.k].name)}</span>${bar(r.v)}</div>`).join("")}</div>
      <h4>Zonen</h4><div class="ptable">${zoRows.map(r => `<div class="prow"><span class="pz" style="--z:${STATIONS[r.z].color}">${esc(STATIONS[r.z].name)}</span>${bar(r.v)}</div>`).join("")}</div>
    </details></section>`;
}
function bindReport() {}
function report() {
  const lb = S.lastBoss;
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
    <h2 class="pagetitle">Meine Auswertung</h2>
    <p class="lead">${lb ? `Letzter Probetest gegen den Wetterwirbel: ${new Date(lb.at).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}, ${lb.right} von ${lb.n} richtig.` : "Noch kein Probetest gespielt. Die Auswertung zeigt bisher nur die Stationen. Die Notenschätzung gibt es nach dem Kampf gegen den Wetterwirbel."}</p>
    ${Object.keys(S.stats).length ? reportHTML(lb ? lb.res : [], !!lb) : `<p class="card">Spiel zuerst ein paar Stationen, dann steht hier, was du schon kannst und was du noch üben solltest.</p>`}`;
  $("#back").onclick = home; window.scrollTo(0, 0);
}
const parseBest = s => { const m = /(\d+) von (\d+)/.exec(s || ""); return m ? m[1] / m[2] : 0; };

/* ============ AUFGABEN-ANSICHT ============ */
const KIND = { mc:"Quiz", multi:"Mehrere sind richtig", order:"Reihenfolge", match:"Zuordnen", num:"Rechnen und Ablesen", arid:"Klimadiagramm-Detektiv", map:"Kartenmaler", draw:"Diagramm-Werkstatt", free:"Mit eigenen Worten" };
function showTask(t, opt) {
  const kind = t.t === "mc" && t.d ? "Klimadiagramm-Detektiv" : KIND[t.t];
  app.innerHTML = `${opt.head}<section class="card task t-${t.t}">
    <p class="kicker">${kind}</p><h2 class="q">${esc(t.q)}</h2>
    <div class="tbody"></div><div class="hints" aria-live="polite"></div><div class="fb" hidden aria-live="polite"></div>
    <div class="actions"><button class="btn ghost" id="hintBtn"></button><button class="btn primary" id="checkBtn" disabled>Prüfen</button></div></section>`;
  const body = $(".tbody"), hintsEl = $(".hints"), fb = $(".fb"), hintBtn = $("#hintBtn"), checkBtn = $("#checkBtn");
  const q = $("#quit"); if (q) q.onclick = () => { R = null; home(); };
  let hints = 0, attempt = 1, busy = false;
  const r = RENDER[t.t](t, body, { ready: b => { checkBtn.disabled = !b; } });
  const hl = t.h || [];
  function updHint() {
    if (opt.boss) { hintBtn.textContent = `Joker (${R.jokers})`; hintBtn.disabled = R.jokers <= 0 || hints >= hl.length; }
    else { hintBtn.textContent = hints >= hl.length ? "Keine Tipps mehr" : `Tipp ${hints + 1} von ${hl.length}`; hintBtn.disabled = hints >= hl.length; }
  }
  function giveHint(free) {
    if (hints >= hl.length) return;
    hintsEl.insertAdjacentHTML("beforeend", `<p class="hint"><b>Tipp ${hints + 1}:</b> ${esc(hl[hints])}</p>`);
    hints++; if (opt.boss && !free) R.jokers--; updHint();
  }
  updHint();
  hintBtn.onclick = () => giveHint(false);
  checkBtn.onclick = async () => {
    if (busy) return; busy = true;
    const res = await r.check();
    busy = false;
    if (res.ok) return done(true);
    const maxTries = t.t === "draw" && !opt.boss ? 3 : opt.tries;
    if (attempt < maxTries && t.t !== "free") {
      attempt++;
      fb.hidden = false; fb.className = "fb retry";
      fb.innerHTML = `<b>Noch nicht ganz.</b> ${res.msg ? esc(res.msg) + " " : ""}${maxTries - attempt + 1 > 1 ? `Du hast noch ${maxTries - attempt + 1} Versuche.` : "Du hast noch einen Versuch."}${hints < hl.length ? " Oben ist ein neuer Tipp dazugekommen." : ""}`;
      if (hints < hl.length) giveHint(true);
      r.retry && r.retry();
      return;
    }
    r.reveal && r.reveal(); done(false);
  };
  function done(ok) {
    const pts = ok ? (attempt > 1 ? 1 : Math.max(1, 3 - (opt.boss ? 0 : hints))) : 0;
    r.lock && r.lock();
    fb.hidden = false; fb.className = "fb " + (ok ? "good" : "bad");
    const praise = ["Richtig!", "Genau!", "Stark!", "Volltreffer!", "Super!"][Math.floor(Math.random() * 5)];
    fb.innerHTML = `<b>${ok ? (attempt > 1 ? "Im zweiten Versuch geschafft." : praise) : "Leider falsch."}</b> ${esc(t.e || "")}${!ok ? `<span class="note">Die Aufgabe kommt in dein Forschertagebuch.</span>` : ""}`;
    if (opt.boss) fb.insertAdjacentHTML("afterbegin", `<span class="hit ${ok ? "" : "ouch"}">${ok ? "Treffer!" : "Autsch, ein Herz weniger."}</span>`);
    const a = $(".actions"); a.innerHTML = `<button class="btn primary big" id="nextBtn">Weiter</button>`;
    const nb = $("#nextBtn"); nb.focus({ preventScroll: true });
    nb.onclick = () => opt.onDone({ ok, pts, hints, attempt });
    fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  window.scrollTo(0, 0);
}

/* ============ RENDERER ============ */
function diagBlock(t) { return t.d ? `<div class="diag">${climateSVG(t.d, { hide: t.dh })}${t.tab ? climateTable(t.d) : ""}</div>` : ""; }
const RENDER = {
  mc(t, el, api) {
    const opts = shuffle(t.o.map((txt, i) => ({ txt, ok: i === (t.a || 0) })));
    let sel = null;
    el.innerHTML = `<div class="${t.d ? "split" : ""}">${diagBlock(t)}<div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.txt)}</button>`).join("")}</div></div>`;
    const btns = $$(".opt", el);
    btns.forEach(b => b.onclick = () => { if (b.disabled) return; sel = +b.dataset.i; btns.forEach(x => x.classList.toggle("sel", x === b)); api.ready(true); });
    return {
      check: () => ({ ok: opts[sel].ok }),
      retry() { btns[sel].classList.remove("sel"); btns[sel].classList.add("wrong"); btns[sel].disabled = true; sel = null; api.ready(false); },
      reveal() { btns.forEach((b, i) => { if (opts[i].ok) b.classList.add("right"); else if (i === sel) b.classList.add("wrong"); }); },
      lock() { btns.forEach((b, i) => { b.disabled = true; if (i === sel && opts[i].ok) b.classList.add("right"); }); }
    };
  },
  multi(t, el, api) {
    const opts = shuffle(t.o.map((txt, i) => ({ txt, ok: t.a.includes(i) })));
    const sel = new Set();
    el.innerHTML = `<div class="${t.d ? "split" : ""}">${diagBlock(t)}<div class="opts multi">${opts.map((o, i) => `<button class="opt" data-i="${i}" aria-pressed="false"><span class="box"></span>${esc(o.txt)}</button>`).join("")}</div></div>`;
    const btns = $$(".opt", el);
    btns.forEach(b => b.onclick = () => { const i = +b.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle("sel", sel.has(i)); b.setAttribute("aria-pressed", sel.has(i)); api.ready(sel.size > 0); });
    const nRight = () => opts.filter((o, i) => o.ok === sel.has(i)).length;
    return {
      check() { const k = nRight(); return { ok: k === opts.length, msg: `${k} von ${opts.length} Antworten sind richtig eingestuft.` }; },
      reveal() { btns.forEach((b, i) => { if (opts[i].ok) b.classList.add(sel.has(i) ? "right" : "missed"); else if (sel.has(i)) b.classList.add("wrong"); }); },
      lock() { btns.forEach((b, i) => { b.disabled = true; if (opts[i].ok && sel.has(i)) b.classList.add("right"); }); }
    };
  },
  order(t, el, api) {
    const pool = shuffle(t.o.map((txt, i) => ({ txt, i }))); let ans = [];
    el.innerHTML = `<p class="small">Tippe die Begriffe in der richtigen Reihenfolge an. Tippe in deiner Liste auf einen Begriff, um ihn zurückzulegen.</p>
      <div class="ordergrid"><div><h4>Auswahl</h4><div class="pool"></div></div><div><h4>Deine Reihenfolge</h4><ol class="answer"></ol></div></div>`;
    const poolEl = $(".pool", el), ansEl = $(".answer", el); let locked = false;
    function draw() {
      poolEl.innerHTML = pool.filter(p => !ans.includes(p)).map(p => `<button class="chip" data-i="${p.i}">${esc(p.txt)}</button>`).join("") || `<p class="small muted">Alles eingeordnet.</p>`;
      ansEl.innerHTML = ans.map((p, k) => `<li><button class="chip placed" data-i="${p.i}" data-k="${k}">${esc(p.txt)}</button></li>`).join("") + Array.from({ length: t.o.length - ans.length }, () => `<li class="empty"></li>`).join("");
      $$(".pool .chip", el).forEach(b => b.onclick = () => { if (locked) return; ans.push(pool.find(p => p.i === +b.dataset.i)); draw(); });
      $$(".answer .chip", el).forEach(b => b.onclick = () => { if (locked) return; ans = ans.filter(p => p.i !== +b.dataset.i); draw(); });
      api.ready(ans.length === t.o.length);
    }
    draw();
    return {
      check() { const k = ans.filter((p, i) => p.i === i).length; return { ok: k === t.o.length, msg: `${k} von ${t.o.length} Positionen stimmen.` }; },
      retry() { $$(".answer .chip", el).forEach((b, k) => b.classList.toggle("wrong", +b.dataset.i !== k)); },
      reveal() { $$(".answer .chip", el).forEach((b, k) => b.classList.add(+b.dataset.i === k ? "right" : "wrong")); el.insertAdjacentHTML("beforeend", `<div class="solution"><h4>Richtige Reihenfolge</h4><ol>${t.o.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>`); },
      lock() { locked = true; if (ans.every((p, i) => p.i === i)) $$(".answer .chip", el).forEach(b => b.classList.add("right")); }
    };
  },
  match(t, el, api) {
    const left = t.p.map((p, i) => ({ txt: p[0], i })), right = shuffle(t.p.map((p, i) => ({ txt: p[1], i })));
    const pair = {}; let selL = null, locked = false;
    el.innerHTML = `<p class="small">Tippe links einen Begriff an und dann rechts die passende Erklärung. Tippe einen verbundenen Begriff erneut an, um die Verbindung zu lösen.</p><div class="matchgrid"><div class="mcol l"></div><div class="mcol r"></div></div>`;
    const colors = ["#2a74c9", "#d1342b", "#2f8a4a", "#b36b00", "#7b4bc4", "#0d8a8f"];
    function draw() {
      const usedR = Object.values(pair);
      $(".l", el).innerHTML = left.map(p => `<button class="chip m ${selL === p.i ? "sel" : ""} ${pair[p.i] != null ? "paired" : ""}" data-i="${p.i}" style="${pair[p.i] != null ? `--pc:${colors[p.i % 6]}` : ""}">${pair[p.i] != null ? `<span class="pn">${p.i + 1}</span>` : ""}${esc(p.txt)}</button>`).join("");
      $(".r", el).innerHTML = right.map(p => { const L = Object.keys(pair).find(k => pair[k] === p.i); return `<button class="chip m ${L != null ? "paired" : ""}" data-i="${p.i}" style="${L != null ? `--pc:${colors[L % 6]}` : ""}">${L != null ? `<span class="pn">${+L + 1}</span>` : ""}${esc(p.txt)}</button>`; }).join("");
      $$(".l .chip", el).forEach(b => b.onclick = () => { if (locked) return; const i = +b.dataset.i; if (pair[i] != null) { delete pair[i]; selL = null; } else selL = selL === i ? null : i; draw(); });
      $$(".r .chip", el).forEach(b => b.onclick = () => { if (locked || selL == null) return; const i = +b.dataset.i; for (const k in pair) if (pair[k] === i) delete pair[k]; pair[selL] = i; selL = null; draw(); });
      api.ready(Object.keys(pair).length === left.length);
    }
    draw();
    const nOk = () => left.filter(p => pair[p.i] === p.i).length;
    return {
      check() { const k = nOk(); return { ok: k === left.length, msg: `${k} von ${left.length} Paaren stimmen. Die falschen habe ich wieder gelöst.` }; },
      retry() { for (const k in pair) if (pair[k] !== +k) delete pair[k]; draw(); },
      reveal() { el.insertAdjacentHTML("beforeend", `<div class="solution"><h4>Richtige Paare</h4><ul>${t.p.map(p => `<li><b>${esc(p[0])}</b>: ${esc(p[1])}</li>`).join("")}</ul></div>`); },
      lock() { locked = true; $$(".l .chip", el).forEach(b => b.classList.add(pair[+b.dataset.i] === +b.dataset.i ? "right" : "wrong")); }
    };
  },
  num(t, el, api) {
    el.innerHTML = `<div class="${t.d ? "split" : ""}">${diagBlock(t)}<div class="numwrap"><label for="numIn">Deine Antwort</label><div class="row"><input id="numIn" inputmode="decimal" autocomplete="off" placeholder="z. B. ${t.tol && t.tol < 1 ? "12,5" : "42"}"><span class="unit">${esc(t.u || "")}</span></div>
      <p class="small">Komma oder Punkt sind beide okay. Minus mit „-“.</p></div></div>`;
    const inp = $("#numIn", el);
    const val = () => { const v = parseFloat(inp.value.replace(",", ".").replace("−", "-").replace(/\s/g, "")); return isNaN(v) ? null : v; };
    inp.oninput = () => api.ready(val() !== null);
    inp.onkeydown = e => { if (e.key === "Enter" && val() !== null) $("#checkBtn").click(); };
    return {
      check: () => ({ ok: Math.abs(val() - t.a) <= (t.tol || 0) + 1e-9 }),
      retry() { inp.select(); },
      reveal() { el.querySelector(".numwrap").insertAdjacentHTML("beforeend", `<p class="solution">Richtig ist: <b>${fmt(t.a)} ${esc(t.u || "")}</b></p>`); },
      lock() { inp.disabled = true; }
    };
  },
  arid(t, el, api) {
    const sel = new Set(); let locked = false;
    el.innerHTML = `<div class="diag tapdiag">${climateSVG(t.d, { hide: t.dh, tap: true })}</div><p class="small">Tippe auf einen Monat, um ihn als arid zu markieren. Nochmal tippen hebt die Markierung auf. Markiert: <b class="cnt">0</b></p>`;
    const cols = $$(".cd-tap", el);
    cols.forEach(c => c.addEventListener("click", () => { if (locked) return; const m = +c.dataset.m; sel.has(m) ? sel.delete(m) : sel.add(m); c.classList.toggle("on", sel.has(m)); $(".cnt", el).textContent = sel.size; }));
    api.ready(true);
    const right = () => MON.map((_, i) => isArid(t.d, i) === sel.has(i)).filter(Boolean).length;
    return {
      check() { const k = right(); return { ok: k === 12, msg: `${k} von 12 Monaten sind richtig eingestuft.` }; },
      reveal() { cols.forEach((c, i) => { c.classList.remove("on"); if (isArid(t.d, i)) c.classList.add(sel.has(i) ? "ok" : "miss"); else if (sel.has(i)) c.classList.add("bad"); }); },
      lock() { locked = true; }
    };
  },
  map(t, el, api) {
    const n = t.g.length; let marks = [], locked = false;
    el.innerHTML = `<div class="mapwrap">${mapBase(`<g class="tg"></g><g class="mk"></g>`)}</div>
      <p class="small">${n > 1 ? `Setze ${n} Markierungen. Tippe auf eine Markierung, um sie zu entfernen.` : "Tippe auf die richtige Stelle. Du kannst die Markierung durch erneutes Tippen verschieben."} Gesetzt: <b class="cnt">0</b> von ${n}</p>`;
    const svg = $("svg", el), mk = $(".mk", el);
    function draw() {
      mk.innerHTML = marks.map((m, k) => `<g class="pin" data-k="${k}"><circle cx="${m[0]}" cy="${m[1]}" r="16" class="pin-hit"/><circle cx="${m[0]}" cy="${m[1]}" r="8" class="pin-dot"/></g>`).join("");
      $(".cnt", el).textContent = marks.length; api.ready(marks.length === n);
    }
    svg.addEventListener("click", ev => {
      if (locked) return;
      const pin = ev.target.closest(".pin");
      if (pin && n > 1) { marks.splice(+pin.dataset.k, 1); return draw(); }
      const p = svgPoint(svg, ev);
      if (n === 1) marks = [[p.x, p.y]]; else if (marks.length < n) marks.push([p.x, p.y]); else return toast("Alle Markierungen gesetzt. Tippe eine an, um sie zu entfernen.");
      draw();
    });
    const inBox = (m, b) => { const [lon, lat] = unproj(m[0], m[1]), pad = 3; return lon >= b[0] - pad && lon <= b[2] + pad && lat >= b[1] - pad && lat <= b[3] + pad; };
    const hits = () => t.g.filter(g => marks.some(m => inBox(m, g.b)));
    return {
      check() { const h = hits().length; return { ok: h === n, msg: n > 1 ? `${h} von ${n} Gebieten gefunden.` : "" }; },
      retry() { const good = marks.filter(m => t.g.some(g => inBox(m, g.b))); marks = good; draw(); },
      reveal() {
        $(".tg", el).innerHTML = t.g.map(g => { const [x1, y1] = proj(g.b[0], g.b[3]), [x2, y2] = proj(g.b[2], g.b[1]); return `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="12" class="tgt"/><text x="${(x1 + x2) / 2}" y="${Math.max(y1 - 6, 14)}" text-anchor="middle" class="tgl">${esc(g.n)}</text>`; }).join("");
      },
      lock() { locked = true; this.reveal(); }
    };
  },
  draw(t, el, api) {
    const c = CLIMATE[t.d], g = geom(c.T, c.N);
    const T = Array(12).fill(null), N = Array(12).fill(0); let mode = "N", locked = false;
    el.innerHTML = `${climateTable(t.d)}
      <div class="units"><label>Einheit links (rote Achse): <select id="uL"><option value="">wählen …</option><option>mm</option><option>°C</option><option>km</option></select></label>
      <label>Einheit rechts (blaue Achse): <select id="uR"><option value="">wählen …</option><option>°C</option><option>mm</option><option>cm</option></select></label></div>
      <div class="modes" role="group" aria-label="Zeichenmodus"><button class="btn mode on" data-m="N">Niederschlag-Säulen</button><button class="btn mode" data-m="T">Temperatur-Punkte</button></div>
      <div class="diag drawdiag"><svg class="climate draw" viewBox="0 0 ${g.W} ${g.H}"></svg></div>
      <p class="small">Tippe in die Spalte eines Monats und ziehe nach oben oder unten. Der Wert wird angezeigt. <span class="live"></span><br>„Prüfen“ geht, sobald beide Einheiten gewählt und alle 12 Temperaturpunkte gesetzt sind.</p>`;
    const svg = $("svg", el), live = $(".live", el);
    const header = `<text x="${g.L}" y="18" class="cd-title">${esc(c.name)} (${esc(c.land)})</text><text x="${g.L}" y="34" class="cd-sub">${esc(c.pos)}</text>
      <text x="${g.L - 6}" y="${g.TOP - 12}" class="cd-unit cd-t ul" text-anchor="end">?</text><text x="${g.L + 12 * g.colW + 6}" y="${g.TOP - 12}" class="cd-unit cd-n ur">?</text>`;
    let wrongSet = new Set();
    function draw() {
      let s = axesSVG(g, header);
      N.forEach((n, i) => { if (n > 0) s += `<rect x="${g.L + i * g.colW + 4}" y="${g.yN(n)}" width="${g.colW - 8}" height="${g.y0 - g.yN(n)}" class="cd-bar ${wrongSet.has("N" + i) ? "err" : ""}"/>`; });
      const pts = T.map((v, i) => v == null ? null : [g.xC(i), g.yT(v)]);
      const seg = pts.filter(Boolean); if (seg.length > 1) s += `<polyline points="${seg.map(p => p.join(",")).join(" ")}" class="cd-line"/>`;
      pts.forEach((p, i) => { if (p) s += `<circle cx="${p[0]}" cy="${p[1]}" r="${wrongSet.has("T" + i) ? 6 : 4}" class="cd-dot ${wrongSet.has("T" + i) ? "err" : ""}"/>`; });
      MON.forEach((_, i) => s += `<rect x="${g.L + i * g.colW}" y="${g.TOP - 10}" width="${g.colW}" height="${g.y0 - g.botU * g.U - g.TOP + 10}" class="cd-drag" data-m="${i}"/>`);
      svg.innerHTML = s;
      $(".ul", svg).textContent = $("#uL", el).value || "?"; $(".ur", svg).textContent = $("#uR", el).value || "?";
      api.ready(T.every(v => v != null) && $("#uL", el).value && $("#uR", el).value);
    }
    let dragM = null;
    function setFrom(ev) {
      const p = svgPoint(svg, ev); const i = dragM;
      if (mode === "N") { let v = g.nFromY(p.y); v = Math.max(0, v <= 100 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10); v = Math.min(v, 100 + (g.topU - 5) * 100); N[i] = v; live.textContent = `${MONL[i]}: ${v} mm`; }
      else { let v = Math.round(g.tFromY(p.y)); v = Math.max(g.botU * 10, Math.min(g.topU * 10, v)); T[i] = v; live.textContent = `${MONL[i]}: ${fmt(v)} °C`; }
      wrongSet.delete(mode + i); draw();
    }
    svg.addEventListener("pointerdown", ev => { if (locked) return; const r = ev.target.closest(".cd-drag"); const p = svgPoint(svg, ev); let m = r ? +r.dataset.m : Math.floor((p.x - g.L) / g.colW); if (m < 0 || m > 11) return; dragM = m; svg.setPointerCapture(ev.pointerId); setFrom(ev); ev.preventDefault(); });
    svg.addEventListener("pointermove", ev => { if (dragM != null) setFrom(ev); });
    const end = () => { dragM = null; }; svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    $$(".mode", el).forEach(b => b.onclick = () => { mode = b.dataset.m; $$(".mode", el).forEach(x => x.classList.toggle("on", x === b)); });
    $("#uL", el).onchange = draw; $("#uR", el).onchange = draw;
    draw();
    function errors() {
      const w = new Set();
      c.N.forEach((n, i) => { const tol = n > 100 ? 20 : 10; if (Math.abs(N[i] - n) > tol) w.add("N" + i); });
      c.T.forEach((v, i) => { if (T[i] == null || Math.abs(T[i] - v) > 1) w.add("T" + i); });
      return w;
    }
    return {
      check() {
        const w = errors(), uOk = $("#uL", el).value === "°C" && $("#uR", el).value === "mm";
        const nN = [...w].filter(x => x[0] === "N").length, nT = [...w].filter(x => x[0] === "T").length;
        if (!(w.size === 0 && uOk)) { wrongSet = w; draw(); }
        const parts = []; if (!uOk) parts.push("Die Einheiten stimmen noch nicht."); if (nN) parts.push(`${nN} Säulen sind zu weit daneben (rot markiert).`); if (nT) parts.push(`${nT} Temperaturpunkte sind daneben (rot markiert).`);
        return { ok: w.size === 0 && uOk, msg: parts.join(" ") };
      },
      reveal() { c.N.forEach((n, i) => N[i] = n); c.T.forEach((v, i) => T[i] = v); $("#uL", el).value = "°C"; $("#uR", el).value = "mm"; wrongSet = new Set(); draw(); },
      lock() { locked = true; $("#uL", el).disabled = true; $("#uR", el).disabled = true; }
    };
  },
  free(t, el, api) {
    el.innerHTML = `<div class="${t.d ? "split" : ""}">${diagBlock(t)}<div class="freewrap"><label for="freeIn">Deine Antwort</label><textarea id="freeIn" rows="7" placeholder="Schreib in ganzen Sätzen, wie in der Klassenarbeit."></textarea><p class="small"><span class="wc">0</span> Wörter</p></div></div>`;
    const ta = $("#freeIn", el);
    ta.oninput = () => { const w = ta.value.trim().split(/\s+/).filter(Boolean).length; $(".wc", el).textContent = w; api.ready(w >= 8); };
    return {
      check() {
        return new Promise(res => {
          ta.readOnly = true; $("#checkBtn").hidden = true; $("#hintBtn").hidden = true;
          el.insertAdjacentHTML("beforeend", `<div class="selfcheck"><h4>Vergleiche mit der Musterlösung</h4><p class="model">${esc(t.m)}</p>
            <p><b>Was steht auch in deiner Antwort?</b> Hake ehrlich ab:</p>${t.c.map((x, i) => `<label class="ck"><input type="checkbox" id="ck${i}"> ${esc(x)}</label>`).join("")}
            <button class="btn primary" id="selfDone">Auswerten</button></div>`);
          $(".selfcheck", el).scrollIntoView({ behavior: "smooth", block: "start" });
          $("#selfDone", el).onclick = () => { const k = $$(".ck input:checked", el).length; $$(".ck input", el).forEach(x => x.disabled = true); $("#selfDone", el).remove(); S.lastFree = { k, n: t.c.length };
            res({ ok: k >= Math.ceil(t.c.length * 0.6), msg: "" }); };
        });
      },
      lock() {}
    };
  }
};

/* ============ ELTERNANSICHT ============ */
function parents() {
  const mins = Math.round(S.time / 60);
  const rows = ROUTE.map(id => { const s = S.stats[id] || { answered: 0, correct: 0, first: 0, hints: 0 }; const p = s.answered ? Math.round(s.correct / s.answered * 100) : null; return { id, s, p }; });
  const bs = S.stats.boss;
  const weak = rows.filter(r => r.p != null && r.p < 70).map(r => STATIONS[r.id].name);
  const dg = {}; S.diary.forEach(id => { const t = ALL_TASKS[id]; if (t) (dg[t.st] = dg[t.st] || []).push(t); });
  app.innerHTML = `<div class="crumbs"><button class="btn ghost" id="back">← Karte</button></div>
  <h2 class="pagetitle">Für Eltern</h2>
  <p class="lead">Der Spielstand wird nur auf diesem Gerät in diesem Browser gespeichert.</p>
  <div class="kpis"><div class="kpi"><b>${mins}</b><span>Minuten gespielt</span></div><div class="kpi"><b>${Object.keys(S.stamps).length}/8</b><span>Stempel</span></div>
    <div class="kpi"><b>${totalStars()}/24</b><span>Sterne</span></div><div class="kpi"><b>${S.boss.wins}/${S.boss.tries}</b><span>Bossfight gewonnen/versucht</span></div></div>
  <section class="card"><h3>So läuft es pro Zone</h3>
    <p class="small">Anteil richtig gelöster Aufgaben. „Sofort“ heißt: beim ersten Versuch ohne Tipp.</p>
    <div class="ptable">${rows.map(r => `<div class="prow"><span class="pz" style="--z:${STATIONS[r.id].color}">${esc(STATIONS[r.id].name)}</span>
      <span class="pbar"><i style="width:${r.p ?? 0}%;background:${r.p == null ? "transparent" : r.p >= 80 ? "var(--ok)" : r.p >= 60 ? "var(--gold)" : "var(--bad)"}"></i></span>
      <span class="pv">${r.p == null ? "noch nicht gespielt" : `${r.p} % · ${r.s.correct}/${r.s.answered} · sofort ${r.s.first} · Tipps ${r.s.hints}`}</span></div>`).join("")}
      ${bs ? `<div class="prow"><span class="pz" style="--z:var(--boss)">Bossfight</span><span class="pbar"><i style="width:${Math.round(bs.correct / bs.answered * 100)}%;background:var(--pri)"></i></span><span class="pv">${Math.round(bs.correct / bs.answered * 100)} % · ${bs.correct}/${bs.answered}</span></div>` : ""}</div>
    ${weak.length ? `<p class="advice"><b>Hier lohnt sich Üben:</b> ${weak.map(esc).join(", ")}. Gut ist es, gemeinsam die Lernkarte anzusehen und dann die Station noch einmal zu spielen.</p>` : ""}</section>
  <section class="card"><h3>Offene Aufgaben im Forschertagebuch (${S.diary.length})</h3>
    ${S.diary.length ? Object.entries(dg).map(([st, ts]) => `<h4>${st === "boss" ? "Bossfight" : esc(STATIONS[st].name)}</h4><ul class="plist">${ts.map(t => `<li>${esc(t.q)}</li>`).join("")}</ul>`).join("") : `<p>Keine. Alles, was falsch war, wurde inzwischen richtig gelöst.</p>`}</section>
  <section class="card"><h3>Letzte Runden</h3>${S.log.length ? `<ul class="plist">${S.log.slice(-12).reverse().map(l => `<li>${new Date(l.at).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}: <b>${esc(l.what)}</b>, ${l.correct} von ${l.n} richtig${l.boss ? (l.won ? " · gewonnen" : " · verloren") : l.stars ? " · " + "★".repeat(l.stars) : ""}</li>`).join("")}</ul>` : "<p>Noch keine Runde gespielt.</p>"}</section>
  <section class="card"><h3>Einstellungen</h3>
    <label class="ck"><input type="checkbox" id="unl" ${S.unlockAll ? "checked" : ""}> Alle Stationen und den Bossfight sofort freischalten (z. B. um gezielt den Regenwald zu üben)</label>
    <div class="row"><button class="btn ghost danger" id="reset">Spielstand löschen</button></div>
    <div class="confirm" hidden><p>Wirklich alles löschen? Stempel, Sterne und Tagebuch sind dann weg.</p><div class="row"><button class="btn danger" id="yes">Ja, löschen</button><button class="btn ghost" id="no">Abbrechen</button></div></div></section>`;
  $("#back").onclick = home;
  $("#unl").onchange = e => { S.unlockAll = e.target.checked; save(); toast(S.unlockAll ? "Alle Stationen sind freigeschaltet." : "Freischaltung wieder an den Reiseverlauf gebunden."); };
  $("#reset").onclick = () => { $(".confirm").hidden = false; };
  $("#no").onclick = () => { $(".confirm").hidden = true; };
  $("#yes").onclick = () => { S = blank(); save(); home(); toast("Spielstand gelöscht."); };
  window.scrollTo(0, 0);
}

home();
