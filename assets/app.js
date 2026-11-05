/* NJCCIC Group 9 CTF: static, localStorage-backed CTFd look-alike. */
(function () {
  "use strict";

  var DATA = window.CTF_DATA;
  var CTF = DATA.ctf;
  var STORE_KEY = "njccic9.state";
  var THEME_KEY = "njccic9.theme";
  var ME_ID = "me";

  // ---------------------------------------------------------------- state --
  var memoryState = null;
  function defaultState() {
    return { name: "", created: new Date().toISOString(), solves: {}, unlocks: {}, attempts: {} };
  }
  function loadState() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    if (!s && memoryState) s = memoryState;
    s = Object.assign(defaultState(), s || {});
    return s;
  }
  function saveState(s) {
    memoryState = s;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
    updateNav();
  }
  var state = loadState();

  // -------------------------------------------------------------- helpers --
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function md(text) {
    var html = window.marked ? marked.parse(text || "", { breaks: true }) : "<p>" + esc(text) + "</p>";
    return window.DOMPurify ? DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }) : html;
  }
  function fixLinks(root, baseDir) {
    var isAbs = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i;
    root.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (baseDir && !isAbs.test(href)) {
        // Link to another writeup → open it inside the board.
        var resolved = resolvePath(baseDir, href);
        var wu = writeupByPath(resolved);
        a.setAttribute("href", wu ? "#/writeups/" + wu.id : resolved);
        href = a.getAttribute("href");
      }
      if (/^(?:https?:)?\/\//i.test(href) || /\.(png|jpe?g|pdf|txt|html)$/i.test(href)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      }
    });
    if (baseDir) {
      root.querySelectorAll("img[src]").forEach(function (img) {
        var src = img.getAttribute("src");
        if (!isAbs.test(src)) img.setAttribute("src", resolvePath(baseDir, src));
      });
    }
  }
  function resolvePath(baseDir, rel) {
    var parts = (baseDir + "/" + rel).split("/"), out = [];
    parts.forEach(function (p) {
      if (p === "..") out.pop();
      else if (p !== "." && p !== "") out.push(p);
    });
    var path = out.join("/");
    return /\/$/.test(rel) ? path + "/" : path;
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
  function ago(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    var units = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]];
    for (var i = 0; i < units.length; i++) {
      var n = Math.floor(s / units[i][0]);
      if (n >= 1) return n + " " + units[i][1] + (n > 1 ? "s" : "") + " ago";
    }
    return "just now";
  }
  function byId(id) {
    for (var i = 0; i < DATA.challenges.length; i++) if (DATA.challenges[i].id === id) return DATA.challenges[i];
    return null;
  }
  function writeupByPath(path) {
    var all = DATA.writeups || DATA.challenges;
    for (var i = 0; i < all.length; i++) if (all[i].writeup === path) return all[i];
    return null;
  }
  function myName() { return state.name || "anonymous"; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-"); }

  // --------------------------------------------------------------- scores --
  function myScore() {
    var score = 0;
    Object.keys(state.solves).forEach(function (id) { var c = byId(+id); if (c) score += c.value; });
    Object.keys(state.unlocks).forEach(function (k) { score -= state.unlocks[k].cost || 0; });
    return score;
  }
  // Every account on the board: archived players from the live CTF + this browser's player.
  function accounts() {
    var list = DATA.archive.map(function (u) {
      var solves = u.solves.filter(function (s) { return byId(s.challenge_id); });
      var score = solves.reduce(function (t, s) { return t + byId(s.challenge_id).value; }, 0);
      var last = solves.length ? solves[solves.length - 1].date : null;
      return { id: u.id, name: u.name, solves: solves, score: score, last: last, archived: true };
    });
    var mine = Object.keys(state.solves).map(function (id) {
      return { challenge_id: +id, date: state.solves[id].date };
    }).filter(function (s) { return byId(s.challenge_id); })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    list.push({
      id: ME_ID, name: myName(), solves: mine, score: myScore(),
      last: mine.length ? mine[mine.length - 1].date : null, archived: false, me: true
    });
    return list;
  }
  function standings() {
    return accounts().filter(function (a) { return a.score > 0 || a.me; }).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (!a.last) return 1;
      if (!b.last) return -1;
      return a.last < b.last ? -1 : 1;
    });
  }
  function solversOf(cid) {
    var out = [];
    accounts().forEach(function (a) {
      a.solves.forEach(function (s) { if (s.challenge_id === cid) out.push({ account: a, date: s.date }); });
    });
    return out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }

  // ------------------------------------------------------------------ nav --
  function updateNav() {
    var n = document.getElementById("nav-username");
    if (n) n.textContent = state.name ? state.name : "Set name";
    var sc = document.getElementById("nav-score");
    if (sc) sc.textContent = myScore() + " pts";
  }
  function setActiveNav(route) {
    document.querySelectorAll("[data-route]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-route") === route);
    });
  }
  function themeIcon() {
    var dark = document.documentElement.getAttribute("data-bs-theme") === "dark";
    var b = document.querySelector("#theme-toggle i");
    if (b) b.className = dark ? "fas fa-sun" : "fas fa-moon";
  }

  function jumbo(title, sub) {
    return '<div class="jumbotron"><div class="container"><h1>' + esc(title) + "</h1>" +
      (sub ? '<p class="lead mb-0">' + sub + "</p>" : "") + "</div></div>";
  }

  // ---------------------------------------------------------------- pages --
  var app = document.getElementById("app");

  function pageIndex() {
    app.innerHTML =
      '<div class="container"><div class="row"><div class="col-md-6 offset-md-3">' +
      '<img class="w-100 mx-auto d-block" style="max-width:500px;padding:50px;padding-top:14vh" src="img/njccic-banner.png" alt="NJCCIC">' +
      '<h3 class="text-center"><p>Welcome to NJCCIC Advanced Internship Group 9\'s CTF! If you need any help with challenges, please see <a href="#/help">this page.</a></p></h3>' +
      '<p class="text-center text-muted mt-4">This is a static archive of the original CTFd event. Your progress is stored only in this browser.</p>' +
      '<div class="text-center mt-4"><a class="btn btn-primary btn-lg px-4" href="#/challenges"><i class="fas fa-flag pe-2"></i>Start hacking</a></div>' +
      "</div></div></div>";
  }

  function pageHelp() {
    app.innerHTML = '<div class="container pt-5 mt-4 help-page">' +
      "<h1>Help Page</h1><p>Whenever you are struggling with answering CTF questions, please see this page.</p><br>" +
      "<h2>Formatting</h2><ul><li>All flags will start with <code>njccic</code> and be contained in curly brackets (<code>{ }</code>) if not already</li></ul>" +
      "<h2>Cryptography</h2><p>Some tools may be necessary to decode certain strings to find the flag. Below is a list of online tools that may help.</p><ul>" +
      '<li><a href="https://cryptii.com" target="_blank" rel="noopener">Cryptii</a>: modular conversion, encoding and encryption online</li>' +
      '<li><a href="https://gchq.github.io/CyberChef/" target="_blank" rel="noopener">CyberChef</a>: encryption, encoding, compression and data analysis</li>' +
      '<li><a href="https://www.dcode.fr/" target="_blank" rel="noopener">dCode</a> (may need to translate from French): online ciphers, solvers, decoders, calculators</li>' +
      '<li><a href="https://quipqiup.com" target="_blank" rel="noopener">quipqiup</a>: cryptoquip and cryptogram solver</li></ul>' +
      "<h2>About this archive</h2><p>The live CTF ran on CTFd. This copy runs entirely in your browser: flags are checked against hashes, and solves, hint unlocks and your name are saved in <code>localStorage</code>. " +
      'After you solve a challenge, a <strong>Writeup</strong> button shows the author\'s solution. Manage or reset your progress on the <a href="#/settings">settings</a> page.</p>' +
      '<p>The "Website Under Construction" challenges use the <a href="' + esc(CTF.webuc) + '" target="_blank" rel="noopener">WebUC</a> site, which is still live on GitHub Pages.</p>' +
      "</div>";
  }

  function pageChallenges(openId) {
    var cats = [], byCat = {};
    DATA.challenges.forEach(function (c) {
      if (!byCat[c.category]) { byCat[c.category] = []; cats.push(c.category); }
      byCat[c.category].push(c);
    });
    var html = jumbo("Challenges") + '<div class="container"><div id="challenge-board">';
    cats.forEach(function (cat) {
      html += '<div class="pt-5 mt-1 category-header"><h3>' + esc(cat) + "</h3></div>" +
        '<div class="category-challenges d-flex flex-column"><div class="challenges-row row">';
      byCat[cat].forEach(function (c) {
        var solved = !!state.solves[c.id];
        html += '<div class="col-sm-6 col-md-4 col-lg-3">' +
          '<button class="btn btn-dark challenge-button w-100 text-truncate my-3' + (solved ? " challenge-solved" : "") + '" data-challenge-id="' + c.id + '">' +
          '<div class="challenge-inner my-3"><p class="d-block">' + esc(c.name) + '</p><span class="d-block">' + c.value + "</span></div>" +
          "</button></div>";
      });
      html += "</div></div>";
    });
    html += "</div></div>";
    app.innerHTML = html;
    app.querySelectorAll("[data-challenge-id]").forEach(function (b) {
      b.addEventListener("click", function () {
        location.hash = "#/challenges/" + b.getAttribute("data-challenge-id");
      });
    });
    if (openId) openChallenge(openId);
  }

  // ---------------------------------------------------------------- modal --
  var modalEl = document.getElementById("challenge-window");
  var modal = null;
  modalEl.addEventListener("hidden.bs.modal", function () {
    if (/^#\/challenges\/\d+/.test(location.hash)) history.replaceState(null, "", "#/challenges");
  });

  function openChallenge(id) {
    var c = byId(id);
    if (!c) return;
    var solved = state.solves[c.id];
    var solvers = solversOf(c.id);
    var hints = c.hints.map(function (h) {
      var key = c.id + ":" + h.id, open = !!state.unlocks[key] || !h.cost;
      return '<div class="col-md-12 mb-3"><details' + (open ? " open" : "") + ' data-hint="' + h.id + '">' +
        "<summary>" + (h.title ? esc(h.title) : "View Hint") + (h.cost ? ' <small class="text-muted">(' + h.cost + " points)</small>" : "") + "</summary>" +
        (open ? '<div class="card card-body mt-2 hint-content">' + md(h.content) + "</div>"
              : '<div class="mt-2"><button class="btn btn-sm btn-outline-secondary hint-unlock" data-hint-id="' + h.id + '">Unlock hint for ' + h.cost + " points</button></div>") +
        "</details></div>";
    }).join("");
    var files = c.files.map(function (f) {
      var name = f.split("/").pop();
      return '<div class="col-md-4 col-sm-4 col-xs-12 file-button-wrapper d-block">' +
        '<a class="btn btn-info btn-file mb-1 d-inline-block px-2 w-100 text-truncate" href="' + esc(f) + '" target="_blank" rel="noopener" download>' +
        '<i class="fas fa-download"></i> <small>' + esc(name) + "</small></a></div>";
    }).join("");

    modalEl.innerHTML =
      '<div class="modal-dialog modal-dialog-centered modal-lg" role="document"><div class="modal-content">' +
      '<div class="modal-body py-4 px-5">' +
      '<div><button type="button" class="btn-close float-end" data-bs-dismiss="modal" aria-label="Close"></button></div>' +
      '<ul class="nav nav-tabs" role="tablist">' +
      '<li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#ch-tab-challenge" type="button">Challenge</button></li>' +
      '<li class="nav-item"><button class="nav-link challenge-solves" data-bs-toggle="tab" data-bs-target="#ch-tab-solves" type="button">' +
      solvers.length + " Solve" + (solvers.length === 1 ? "" : "s") + "</button></li></ul>" +
      '<div class="tab-content">' +
      '<div class="tab-pane fade show active" id="ch-tab-challenge" role="tabpanel">' +
      '<h2 class="challenge-name text-center pt-3">' + esc(c.name) + "</h2>" +
      '<h3 class="challenge-value text-center">' + c.value + "</h3>" +
      '<div class="challenge-tags text-center pt-2 pb-3"><span class="badge bg-info">' + esc(c.category) + "</span></div>" +
      '<span class="challenge-desc">' + md(c.description) + "</span>" +
      (c.connection_info ? '<div class="mb-2 text-center"><span class="challenge-connection-info"><a href="' + esc(c.connection_info) + '" target="_blank" rel="noopener">' + esc(c.connection_info) + "</a></span></div>" : "") +
      (hints ? '<div class="challenge-hints hint-row row pt-2">' + hints + "</div>" : "") +
      (files ? '<div class="row challenge-files text-center pb-3 pt-2">' + files + "</div>" : "") +
      '<div class="row submit-row">' +
      '<div class="col-12 col-sm-8 mt-3"><input id="challenge-input" class="challenge-input form-control" type="text" name="submission" placeholder="Flag" autocomplete="off"' + (solved ? " disabled" : "") + "></div>" +
      '<div class="col-12 col-sm-4 mt-3"><button id="challenge-submit" class="challenge-submit btn btn-outline-secondary w-100 h-100" type="button"' + (solved ? " disabled" : "") + ">" + (solved ? "Solved" : "Submit") + "</button></div>" +
      "</div>" +
      '<div class="row notification-row"><div class="col-12"><div id="result-notification" class="alert text-center w-100 mt-3 d-none" role="alert"></div></div></div>' +
      '<div class="text-center mt-3 writeup-row">' + writeupButton(c) + "</div>" +
      "</div>" +
      '<div class="tab-pane fade" id="ch-tab-solves" role="tabpanel">' + solvesTable(solvers) + "</div>" +
      "</div></div></div></div>";

    fixLinks(modalEl.querySelector(".challenge-desc"));
    modalEl.querySelectorAll(".hint-content").forEach(function (h) { fixLinks(h); });
    if (solved) showResult("info", "You already solved this");

    var input = modalEl.querySelector("#challenge-input");
    var btn = modalEl.querySelector("#challenge-submit");
    btn.addEventListener("click", function () { submitFlag(c, input.value); });
    input.addEventListener("keyup", function (e) { if (e.key === "Enter") submitFlag(c, input.value); });
    modalEl.querySelectorAll(".hint-unlock").forEach(function (b) {
      b.addEventListener("click", function () { unlockHint(c, +b.getAttribute("data-hint-id")); });
    });
    modalEl.querySelectorAll("[data-writeup]").forEach(bindWriteupLink);

    modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    if (!solved) modalEl.addEventListener("shown.bs.modal", function f() {
      modalEl.removeEventListener("shown.bs.modal", f); input.focus();
    });
  }

  function writeupButton(c) {
    if (state.solves[c.id]) {
      return '<a class="btn btn-success" href="#/writeups/' + c.id + '" data-writeup="' + c.id + '"><i class="fas fa-book-open pe-1"></i> Writeup</a>';
    }
    return '<a class="small text-muted" href="#/writeups/' + c.id + '" data-writeup="' + c.id + '" data-spoiler="1">Stuck? View the writeup (spoilers)</a>';
  }
  function bindWriteupLink(a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (a.getAttribute("data-spoiler") && !confirm("The writeup contains the flag. Show it anyway?")) return;
      spoilerOk[a.getAttribute("data-writeup")] = true;
      if (modal) modal.hide();
      location.hash = "#/writeups/" + a.getAttribute("data-writeup");
    });
  }
  var spoilerOk = {};

  function solvesTable(solvers) {
    if (!solvers.length) return '<p class="text-center text-muted pt-4">No solves yet. Be the first!</p>';
    return '<table class="table table-striped text-center mt-3"><thead><tr><td><b>Name</b></td><td><b>Date</b></td></tr></thead><tbody>' +
      solvers.map(function (s) {
        return '<tr><td><a href="#/users/' + s.account.id + '">' + esc(s.account.name) + (s.account.me ? " (you)" : "") + "</a></td>" +
          '<td title="' + esc(fmtDate(s.date)) + '">' + esc(ago(s.date)) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function showResult(kind, msg) {
    var n = modalEl.querySelector("#result-notification");
    if (!n) return;
    n.className = "alert text-center w-100 mt-3 alert-" + kind;
    n.innerHTML = "<strong>" + esc(msg) + "</strong>";
  }

  function submitFlag(c, raw) {
    var flag = (raw || "").trim();
    if (!flag || state.solves[c.id]) return;
    var candidate = c.case_insensitive ? flag.toLowerCase() : flag;
    sha256Hex(DATA.salt + candidate).then(function (h) {
      state.attempts[c.id] = (state.attempts[c.id] || 0) + 1;
      if (h === c.flag_sha256) {
        state.solves[c.id] = { date: new Date().toISOString() };
        saveState(state);
        showResult("success", "Correct");
        var input = modalEl.querySelector("#challenge-input"), btn = modalEl.querySelector("#challenge-submit");
        input.disabled = true; btn.disabled = true; btn.textContent = "Solved";
        var w = modalEl.querySelector(".writeup-row");
        w.innerHTML = writeupButton(c);
        w.querySelectorAll("[data-writeup]").forEach(bindWriteupLink);
        var tab = modalEl.querySelector(".challenge-solves"), solvers = solversOf(c.id);
        tab.textContent = solvers.length + " Solve" + (solvers.length === 1 ? "" : "s");
        modalEl.querySelector("#ch-tab-solves").innerHTML = solvesTable(solvers);
        var boardBtn = document.querySelector('[data-challenge-id="' + c.id + '"]');
        if (boardBtn) boardBtn.classList.add("challenge-solved");
        if (Object.keys(state.solves).length === DATA.challenges.length) toast("You solved every challenge. Nice work!");
      } else {
        saveState(state);
        showResult("danger", "Incorrect");
        var inp = modalEl.querySelector("#challenge-input");
        inp.classList.add("wrong"); setTimeout(function () { inp.classList.remove("wrong"); }, 450);
      }
    });
  }

  function unlockHint(c, hid) {
    var h = c.hints.filter(function (x) { return x.id === hid; })[0];
    if (!h) return;
    if (myScore() < h.cost) {
      alert("You do not have enough points to unlock this hint (" + h.cost + " needed, you have " + myScore() + ").");
      return;
    }
    if (!confirm("Unlock this hint for " + h.cost + " points?")) return;
    state.unlocks[c.id + ":" + hid] = { date: new Date().toISOString(), cost: h.cost };
    saveState(state);
    openChallenge(c.id);
  }

  // ----------------------------------------------------------- scoreboard --
  var PALETTE = ["#2f7ed8", "#e6550d", "#31a354", "#c51b8a", "#756bb1", "#ff9f00", "#17becf", "#8c564b", "#d62728", "#7f7f7f"];

  function scoreGraph(rows) {
    var top = rows.filter(function (r) { return r.solves.length; }).slice(0, 10);
    if (!top.length) return "";
    var W = 1000, H = 360, P = { l: 48, r: 16, t: 16, b: 36 };
    // Archived players and the local player are a year or more apart, so the x-axis is
    // time since each player's first solve rather than wall-clock time.
    var series = top.map(function (r) {
      var pts = [], total = 0, t0 = new Date(r.solves[0].date).getTime();
      r.solves.forEach(function (s) {
        total += byId(s.challenge_id).value;
        pts.push([new Date(s.date).getTime() - t0, total, s.date]);
      });
      // Hint costs only apply to the local player; subtract at the end of their line.
      if (r.me && total !== r.score) pts.push([pts[pts.length - 1][0], r.score, pts[pts.length - 1][2]]);
      return { r: r, pts: pts };
    });
    var times = [];
    series.forEach(function (s) { s.pts.forEach(function (p) { times.push(p[0]); }); });
    var tMin = Math.min.apply(null, times), tMax = Math.max.apply(null, times);
    if (tMax === tMin) tMax = tMin + 1;
    var yMax = Math.max.apply(null, series.map(function (s) { return Math.max.apply(null, s.pts.map(function (p) { return p[1]; })); }));
    yMax = Math.max(10, Math.ceil(yMax / 50) * 50);
    var x = function (t) { return P.l + (t - tMin) / (tMax - tMin) * (W - P.l - P.r); };
    var y = function (v) { return H - P.b - v / yMax * (H - P.t - P.b); };
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" class="score-graph-svg" role="img" aria-label="Score over time for the top players">';
    for (var i = 0; i <= 5; i++) {
      var v = yMax / 5 * i, yy = y(v).toFixed(1);
      svg += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '" class="grid"/>' +
        '<text x="' + (P.l - 8) + '" y="' + yy + '" class="axis" text-anchor="end" dominant-baseline="middle">' + Math.round(v) + "</text>";
    }
    for (i = 0; i <= 4; i++) {
      var t = tMin + (tMax - tMin) * i / 4;
      svg += '<text x="' + x(t).toFixed(1) + '" y="' + (H - 12) + '" class="axis" text-anchor="' + (i === 0 ? "start" : i === 4 ? "end" : "middle") + '">' +
        esc(dur(t)) + "</text>";
    }
    series.forEach(function (s, idx) {
      var col = PALETTE[idx % PALETTE.length];
      var d = "M" + x(s.pts[0][0]).toFixed(1) + "," + y(0).toFixed(1);
      s.pts.forEach(function (p, k) {
        var prev = k ? s.pts[k - 1][1] : 0;
        d += " L" + x(p[0]).toFixed(1) + "," + y(prev).toFixed(1) + " L" + x(p[0]).toFixed(1) + "," + y(p[1]).toFixed(1);
      });
      svg += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round"/>';
      s.pts.forEach(function (p) {
        svg += '<circle cx="' + x(p[0]).toFixed(1) + '" cy="' + y(p[1]).toFixed(1) + '" r="3.5" fill="' + col + '"><title>' +
          esc(s.r.name + ": " + p[1] + " pts, " + fmtDate(p[2])) + "</title></circle>";
      });
    });
    svg += "</svg>";
    var legend = '<div class="score-legend">' + series.map(function (s, idx) {
      return '<span><i style="background:' + PALETTE[idx % PALETTE.length] + '"></i>' + esc(s.r.name) + "</span>";
    }).join("") + "</div>";
    return '<div id="score-graph" class="mb-4">' + legend + svg +
      '<p class="text-center text-muted small mb-0">Score vs. time since each player\'s first solve</p></div>';
  }

  function dur(ms) {
    var m = ms / 60000;
    if (m < 1) return "0";
    if (m < 60) return Math.round(m) + "m";
    if (m < 48 * 60) return Math.round(m / 60) + "h";
    return Math.round(m / 1440) + "d";
  }

  function pageScoreboard() {
    var rows = standings();
    var html = jumbo("Scoreboard") + '<div class="container">' + scoreGraph(rows) +
      '<div class="row"><div class="col-md-12"><table class="table table-striped"><thead><tr>' +
      '<td scope="col" width="10px"><b>Place</b></td><td scope="col"><b>User</b></td><td scope="col"><b>Score</b></td></tr></thead><tbody>';
    rows.forEach(function (r, i) {
      html += "<tr" + (r.me ? ' class="table-active me-row"' : "") + '><th scope="row" class="text-center">' + (i + 1) + "</th>" +
        '<td><a href="#/users/' + r.id + '">' + esc(r.name) + "</a>" + (r.me ? ' <span class="badge bg-primary ms-1">you</span>' : "") + "</td>" +
        "<td>" + r.score + "</td></tr>";
    });
    html += "</tbody></table>" +
      '<p class="text-muted small">Other players are a snapshot of the original event. Your entry is stored in this browser only.</p>' +
      "</div></div></div>";
    app.innerHTML = html;
  }

  function pageUsers() {
    var list = accounts();
    var html = jumbo("Users") + '<div class="container"><div class="row"><div class="col-md-12">' +
      '<table class="table table-striped"><thead><tr><td><b>User</b></td><td class="text-center"><b>Solves</b></td><td class="text-center"><b>Score</b></td></tr></thead><tbody>';
    list.forEach(function (u) {
      html += '<tr><td><a href="#/users/' + u.id + '">' + esc(u.name) + "</a>" + (u.me ? ' <span class="badge bg-primary ms-1">you</span>' : "") + "</td>" +
        '<td class="text-center">' + u.solves.length + '</td><td class="text-center">' + u.score + "</td></tr>";
    });
    app.innerHTML = html + "</tbody></table></div></div></div>";
  }

  function pageUser(id) {
    var list = accounts(), u = null;
    list.forEach(function (a) { if (String(a.id) === String(id)) u = a; });
    if (!u) return pageNotFound();
    var rows = standings(), place = 0;
    rows.forEach(function (r, i) { if (String(r.id) === String(u.id)) place = i + 1; });
    var html = jumbo(u.name, (place ? "<b>" + ordinal(place) + "</b> place &middot; " : "") + "<b>" + u.score + "</b> points" +
      (u.me ? ' &middot; <a class="link-light" href="#/settings">edit profile</a>' : "")) +
      '<div class="container"><div class="row"><div class="col-md-12">';
    if (!u.solves.length) {
      html += '<h3 class="text-center opacity-50 pt-4">No solves yet</h3>';
    } else {
      html += '<h3 class="pt-2">Solves</h3><table class="table table-striped"><thead><tr><td><b>Challenge</b></td><td class="d-none d-md-table-cell"><b>Category</b></td><td><b>Value</b></td><td><b>Time</b></td></tr></thead><tbody>';
      u.solves.slice().reverse().forEach(function (s) {
        var c = byId(s.challenge_id);
        html += '<tr><td><a href="#/challenges/' + c.id + '">' + esc(c.name) + '</a></td><td class="d-none d-md-table-cell">' + esc(c.category) + "</td><td>" + c.value +
          '</td><td title="' + esc(fmtDate(s.date)) + '">' + esc(ago(s.date)) + "</td></tr>";
      });
      html += "</tbody></table>";
    }
    if (u.me && Object.keys(state.unlocks).length) {
      html += '<h3 class="pt-4">Hints unlocked</h3><ul>' + Object.keys(state.unlocks).map(function (k) {
        var c = byId(+k.split(":")[0]);
        return "<li>" + esc(c ? c.name : k) + " (&minus;" + state.unlocks[k].cost + " pts)</li>";
      }).join("") + "</ul>";
    }
    app.innerHTML = html + "</div></div></div>";
  }
  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // ------------------------------------------------------------- writeups --
  function pageWriteups() {
    var all = DATA.writeups || DATA.challenges;
    var html = jumbo("Writeups", "Solutions from the challenge authors. Solve a challenge to unlock its writeup without spoiler warnings.") +
      '<div class="container"><table class="table table-striped align-middle"><thead><tr><td><b>Challenge</b></td><td class="d-none d-md-table-cell"><b>Category</b></td><td><b>Points</b></td><td class="text-center"><b>Status</b></td></tr></thead><tbody>';
    all.forEach(function (c) {
      var solved = !!state.solves[c.id];
      html += '<tr><td><a href="#/writeups/' + c.id + '">' + esc(c.name) + "</a>" + (c.hidden ? ' <span class="badge bg-secondary ms-1">unreleased</span>' : "") + "</td>" +
        '<td class="d-none d-md-table-cell">' + esc(c.category) + "</td><td>" + c.value + "</td>" +
        '<td class="text-center">' + (solved ? '<span class="text-success"><i class="fas fa-check"></i> solved</span>' : c.hidden ? "" : '<span class="text-muted">unsolved</span>') + "</td></tr>";
    });
    app.innerHTML = html + "</tbody></table></div>";
  }

  function pageWriteup(id) {
    var all = DATA.writeups || DATA.challenges, c = null;
    all.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return pageNotFound();
    var gh = CTF.repo + "/blob/main/" + c.writeup;
    var head = jumbo(c.name, esc(c.category) + " &middot; " + c.value + " points");
    var needsWarning = !c.hidden && !state.solves[c.id] && !spoilerOk[c.id];
    if (needsWarning) {
      app.innerHTML = head + '<div class="container text-center pt-3"><div class="alert alert-warning d-inline-block px-5">' +
        '<p class="mb-3"><i class="fas fa-exclamation-triangle pe-1"></i> You haven\'t solved this challenge yet. The writeup contains the flag.</p>' +
        '<button class="btn btn-warning me-2" id="show-anyway">Show it anyway</button><a class="btn btn-outline-secondary" href="#/challenges/' + c.id + '">Try the challenge</a></div></div>';
      document.getElementById("show-anyway").addEventListener("click", function () { spoilerOk[c.id] = true; pageWriteup(id); });
      return;
    }
    app.innerHTML = head + '<div class="container"><article class="writeup"><div class="text-center py-5"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div></article>' +
      '<p class="small text-muted mt-4"><a href="' + esc(gh) + '" target="_blank" rel="noopener">View on GitHub</a> &middot; <a href="#/writeups">All writeups</a>' +
      (c.hidden ? "" : ' &middot; <a href="#/challenges/' + c.id + '">Open challenge</a>') + "</p></div>";
    var art = app.querySelector(".writeup");
    fetch(c.writeup).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (text) {
      // Drop the H1 (the jumbotron already shows the title).
      art.innerHTML = md(text.replace(/^# .*\n/, ""));
      fixLinks(art, c.writeup.replace(/\/[^/]*$/, ""));
    }).catch(function () {
      art.innerHTML = '<div class="alert alert-secondary">Couldn\'t load the writeup here. This happens when the page is opened straight from disk (<code>file://</code>). ' +
        'Serve the folder over HTTP (for example <code>python -m http.server</code>) or <a href="' + esc(gh) + '" target="_blank" rel="noopener">read it on GitHub</a>.</div>';
    });
  }

  // ------------------------------------------------------------- settings --
  function pageSettings() {
    var html = jumbo("Settings") + '<div class="container"><div class="row"><div class="col-md-8 offset-md-2">' +
      '<form id="profile-form" class="mb-5"><h3>Profile</h3>' +
      '<label class="form-label" for="name-input">Display name</label>' +
      '<div class="input-group"><input class="form-control" id="name-input" maxlength="32" placeholder="anonymous" value="' + esc(state.name) + '">' +
      '<button class="btn btn-primary" type="submit">Save</button></div>' +
      '<div class="form-text">Shown on the scoreboard in this browser only.</div></form>' +
      '<h3>Progress</h3><p class="text-muted">' + Object.keys(state.solves).length + " of " + DATA.challenges.length + " challenges solved, " + myScore() + " points.</p>" +
      '<div class="d-flex flex-wrap gap-2 mb-5">' +
      '<button class="btn btn-outline-secondary" id="export-btn"><i class="fas fa-download pe-1"></i> Export progress</button>' +
      '<label class="btn btn-outline-secondary mb-0"><i class="fas fa-upload pe-1"></i> Import progress<input type="file" id="import-input" accept="application/json" hidden></label>' +
      '<button class="btn btn-outline-danger" id="reset-btn"><i class="fas fa-trash pe-1"></i> Reset progress</button></div>' +
      "</div></div></div>";
    app.innerHTML = html;
    document.getElementById("profile-form").addEventListener("submit", function (e) {
      e.preventDefault();
      state.name = document.getElementById("name-input").value.trim().slice(0, 32);
      saveState(state);
      toast("Profile saved");
    });
    document.getElementById("export-btn").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "njccic9-ctf-progress.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    document.getElementById("import-input").addEventListener("change", function (e) {
      var f = e.target.files[0];
      if (!f) return;
      f.text().then(function (t) {
        var s = JSON.parse(t);
        if (!s || typeof s.solves !== "object") throw new Error("bad file");
        state = Object.assign(defaultState(), s);
        saveState(state);
        toast("Progress imported");
        pageSettings();
      }).catch(function () { alert("That file doesn't look like an exported progress file."); });
    });
    document.getElementById("reset-btn").addEventListener("click", function () {
      if (!confirm("Delete all solves, hint unlocks and your name from this browser?")) return;
      state = defaultState();
      saveState(state);
      toast("Progress reset");
      pageSettings();
    });
  }

  function pageNotFound() {
    app.innerHTML = '<div class="container text-center pt-5 mt-5"><h1 class="display-1 pt-5">404</h1>' +
      '<p class="lead">Whoops, looks like we can\'t find that page.</p><p>Sorry about that</p>' +
      '<a class="btn btn-primary mt-3" href="#/challenges">Back to challenges</a></div>';
  }

  function toast(msg) {
    var area = document.getElementById("toast-area");
    var el = document.createElement("div");
    el.className = "toast align-items-center text-bg-dark border-0";
    el.setAttribute("role", "status");
    el.innerHTML = '<div class="d-flex"><div class="toast-body">' + esc(msg) + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
    area.appendChild(el);
    var t = bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 });
    el.addEventListener("hidden.bs.toast", function () { el.remove(); });
    t.show();
  }

  // --------------------------------------------------------------- router --
  var lastRoute = null;
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/");
    var name = parts[0] || "index";
    var arg = parts[1];

    // Opening/closing a challenge on top of the board shouldn't re-render it.
    if (name === "challenges" && lastRoute === "challenges" && document.getElementById("challenge-board")) {
      if (arg) openChallenge(+arg);
      return;
    }
    if (modal && name !== "challenges") modal.hide();
    lastRoute = name;
    setActiveNav(name);
    window.scrollTo(0, 0);
    var title = { index: "", challenges: "Challenges", scoreboard: "Scoreboard", users: "Users", help: "Help", writeups: "Writeups", settings: "Settings" }[name];
    document.title = (title ? title + " | " : "") + CTF.name;

    switch (name) {
      case "index": return pageIndex();
      case "challenges": return pageChallenges(arg ? +arg : null);
      case "scoreboard": return pageScoreboard();
      case "users": return arg ? pageUser(arg) : pageUsers();
      case "help": return pageHelp();
      case "writeups": return arg ? pageWriteup(+arg) : pageWriteups();
      case "settings": return pageSettings();
      default: return pageNotFound();
    }
  }

  // ----------------------------------------------------------------- boot --
  document.getElementById("nav-webuc").href = CTF.webuc;
  document.getElementById("theme-toggle").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    themeIcon();
  });
  // Collapse the mobile navbar after picking a link.
  document.querySelectorAll("#base-navbars .nav-link").forEach(function (a) {
    a.addEventListener("click", function () {
      var nav = document.getElementById("base-navbars");
      if (nav.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(nav).hide();
    });
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("storage", function (e) { if (e.key === STORE_KEY) { state = loadState(); updateNav(); lastRoute = null; route(); } });
  themeIcon();
  updateNav();
  route();
})();
