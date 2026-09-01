(function () {
  "use strict";

  /* ---------- language toggle (RU / EN), persisted across pages ---------- */
  function applyLang(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "ru";
    document.querySelectorAll("[data-ru]").forEach(function (el) {
      var val = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ru");
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll("button.lang-toggle-btn").forEach(function (btn) {
      btn.classList.toggle("on", btn.dataset.lang === lang);
    });
    try { localStorage.setItem("sssr-lang", lang); } catch (e) {}
  }

  function currentLang() {
    try { return localStorage.getItem("sssr-lang") || "ru"; } catch (e) { return "ru"; }
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(currentLang());

    document.querySelectorAll(".lang-toggle-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { applyLang(btn.dataset.lang); });
    });

    /* ---------- mobile nav panel ---------- */
    var burger = document.querySelector(".burger");
    var panel = document.querySelector(".mobile-panel");
    if (burger && panel) {
      burger.addEventListener("click", function () { panel.classList.add("open"); });
      panel.querySelectorAll("[data-close]").forEach(function (el) {
        el.addEventListener("click", function () { panel.classList.remove("open"); });
      });
    }

    /* ---------- menu category filter ---------- */
    var chips = document.querySelectorAll(".chip[data-target]");
    var cats = document.querySelectorAll(".cat[id]");
    if (chips.length && cats.length) {
      var showCat = function (id) {
        cats.forEach(function (c) { c.hidden = c.id !== id; });
        chips.forEach(function (ch) { ch.classList.toggle("on", ch.dataset.target === id); });
        try { localStorage.setItem("sssr-menu-cat", id); } catch (e) {}
      };
      chips.forEach(function (ch) {
        ch.addEventListener("click", function () {
          showCat(ch.dataset.target);
          ch.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
      });
      var saved = null;
      try { saved = localStorage.getItem("sssr-menu-cat"); } catch (e) {}
      var initial = (saved && document.getElementById(saved)) ? saved : cats[0].id;
      showCat(initial);
    }
  });
})();
