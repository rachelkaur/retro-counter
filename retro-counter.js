/*!
 * retro-counter.js v1.0.0 — a 90s-style hit counter for static sites.
 * https://github.com/rachelkaur/retro-counter
 *
 * The count lives in each visitor's own browser (localStorage). There is
 * no server and no third-party service: nothing is sent anywhere, nothing
 * is tracked, and nothing can break from the outside.
 *
 * This is NOT a site-wide total. Every visitor counts only their own
 * visits, so a first-time visitor always sees 000001. It's a personal
 * hello, not a stat — which is why the default label says "Your visit"
 * and not "You are visitor number". Please keep it honest.
 *
 * MIT License — Copyright (c) 2026 Rachel Kaur
 */
(function (global) {
  "use strict";

  var VERSION = "1.0.0";
  var STYLE_ID = "retro-counter-style";
  var THEMES = ["lcd", "amber", "cyan", "paper"];

  // key -> count for this page load, so several counters sharing a key
  // agree with each other and only bump the number once.
  var counted = {};

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Storage throws rather than returning null in some private modes and
  // whenever cookies are blocked, so probe it instead of trusting it.
  function storage(type) {
    try {
      var s = global[type];
      s.setItem("__rc_probe__", "1");
      s.removeItem("__rc_probe__");
      return s;
    } catch (e) {
      return null;
    }
  }

  function bump(key, per) {
    if (counted[key] !== undefined) return counted[key];

    var local = storage("localStorage");
    if (!local) return (counted[key] = null);

    var n = parseInt(local.getItem(key), 10);
    if (!(n >= 0)) n = 0; // also catches NaN from a missing/garbled value

    var fresh = true;
    if (per === "session") {
      var sess = storage("sessionStorage");
      // No sessionStorage but localStorage works: fall back to counting
      // every page view rather than losing the counter entirely.
      if (sess) {
        fresh = !sess.getItem(key + ":seen");
        if (fresh) sess.setItem(key + ":seen", "1");
      }
    } else if (per === "day") {
      var today = new Date().toISOString().slice(0, 10);
      fresh = local.getItem(key + ":day") !== today;
      if (fresh) local.setItem(key + ":day", today);
    }

    if (fresh) {
      n += 1;
      try {
        local.setItem(key, String(n));
      } catch (e) {
        // Quota full — show the number, just don't persist it.
      }
    }
    return (counted[key] = n);
  }

  function pad(n, digits) {
    var s = String(Math.min(n, Math.pow(10, digits) - 1));
    while (s.length < digits) s = "0" + s;
    return s;
  }

  function styles() {
    return [
      '.rc{display:inline-flex;align-items:center;gap:10px;vertical-align:middle;',
      '--rc-box:#1c1c1c;--rc-digit:#8bf24a;--rc-glow:rgba(139,242,74,.75);--rc-label:#6a6a6a}',
      '.rc[data-rc-theme="amber"]{--rc-digit:#ffb000;--rc-glow:rgba(255,176,0,.75)}',
      '.rc[data-rc-theme="cyan"]{--rc-digit:#3ad6ff;--rc-glow:rgba(58,214,255,.75)}',
      '.rc[data-rc-theme="paper"]{--rc-box:#f4f1ea;--rc-digit:#2c2420;--rc-glow:transparent;--rc-label:#6a5f57}',
      '.rc-label{font:800 .72rem/1 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;',
      'text-transform:uppercase;letter-spacing:.14em;color:var(--rc-label)}',
      '.rc-odo{display:inline-flex;gap:2px;padding:4px;border-radius:5px;background:var(--rc-box);',
      'box-shadow:inset 0 1px 4px rgba(0,0,0,.7)}',
      '.rc[data-rc-theme="paper"] .rc-odo{box-shadow:inset 0 1px 3px rgba(0,0,0,.18);border:1px solid rgba(0,0,0,.12)}',
      '.rc-digit{font:700 .9rem/1 "Courier New",Courier,monospace;padding:3px 4px;border-radius:2px;',
      'background:rgba(255,255,255,.05);color:var(--rc-digit);text-shadow:0 0 6px var(--rc-glow)}',
      '.rc[data-rc-theme="paper"] .rc-digit{background:rgba(0,0,0,.04)}',
      '.rc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;',
      'clip:rect(0 0 0 0);white-space:nowrap;border:0}'
    ].join("");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = styles();
    (document.head || document.documentElement).appendChild(el);
  }

  function mount(el, opts) {
    if (!el) return null;
    opts = opts || {};
    var data = el.dataset || {};

    var label = opts.label !== undefined ? opts.label
      : data.label !== undefined ? data.label : "Your visit";
    var digits = parseInt(opts.digits !== undefined ? opts.digits : data.digits, 10);
    if (!(digits >= 1 && digits <= 12)) digits = 6;
    var theme = opts.theme || data.theme || "lcd";
    if (THEMES.indexOf(theme) === -1) theme = "lcd";
    var key = opts.key || data.key || "retro-counter";
    var per = opts.per || data.countPer || "session";

    var n = bump(key, per);
    if (n === null) {
      // Storage is blocked. Show nothing rather than a fake or stuck zero.
      el.hidden = true;
      return null;
    }

    injectStyles();

    var shown = pad(n, digits);
    var html = '<span class="rc" data-rc-theme="' + theme + '">';
    if (label) html += '<span class="rc-label" aria-hidden="true">' + esc(label) + "</span>";
    html += '<span class="rc-odo" aria-hidden="true">';
    for (var i = 0; i < shown.length; i++) {
      html += '<span class="rc-digit">' + shown.charAt(i) + "</span>";
    }
    html += "</span>";
    // Digits are one-span-each for the odometer look, which screen readers
    // would otherwise read as "zero zero zero zero zero two".
    html += '<span class="rc-sr">' + esc(label || "Visit number") + " " + n + "</span>";
    html += "</span>";

    el.innerHTML = html;
    el.hidden = false;
    return n;
  }

  // Clears a counter. Handy for testing, and for a demo page's "reset" link.
  function reset(key) {
    key = key || "retro-counter";
    var local = storage("localStorage");
    var sess = storage("sessionStorage");
    if (local) {
      local.removeItem(key);
      local.removeItem(key + ":day");
    }
    if (sess) sess.removeItem(key + ":seen");
    delete counted[key];
  }

  function init() {
    var nodes = document.querySelectorAll("[data-retro-counter]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.RetroCounter = { mount: mount, reset: reset, init: init, version: VERSION };
})(window);
