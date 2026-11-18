/* =====================================================================
   ZOLKO DEMOS · Comportamiento compartido por todas las demos
   ---------------------------------------------------------------------
   Cada demo define antes de cargar este archivo:

     window.DEMO_CONFIG = {
       negocio: "Nombre del negocio de ejemplo",
       simulado:   ["...", "..."],   // lo que en la demo es de mentira
       produccion: ["...", "..."]    // lo que ZOLKO conectaría de verdad
     };

   Este archivo:
   1. Inserta la banda "Demo de ZOLKO INTEGRATIONS" y su panel.
   2. Arma los enlaces de WhatsApp con el número de ejemplo y muestra
      una vista previa del mensaje antes de abrirlo.
   3. Abre y cierra el menú en celular.
   4. Valida el formulario y muestra la confirmación SIMULADA
      (no envía ni guarda ningún dato).
   5. Anima las secciones al aparecer (respeta prefers-reduced-motion).
   ===================================================================== */
(function () {
  "use strict";

  /* Número de ejemplo: en producción va el WhatsApp real del negocio */
  var WHATSAPP_EJEMPLO = "5200000000000";
  var CFG = window.DEMO_CONFIG || { negocio: "Negocio de ejemplo", simulado: [], produccion: [] };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.remove("no-js");

  /* Atajo para crear elementos */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function lista(items) {
    return items.map(function (t) { return "<li>" + t + "</li>"; }).join("");
  }

  /* ------------------------------------------------------------------
     1. Banda superior fija + panel "Ver qué está simulado"
     ------------------------------------------------------------------ */
  var bar = el("div", { class: "demo-bar", role: "region", "aria-label": "Aviso de demostración" },
    '<div class="demo-bar__inner">' +
      '<a class="demo-bar__back" href="../index.html#demos">← Volver a ZOLKO</a>' +
      '<p class="demo-bar__text"><strong>Demo de ZOLKO INTEGRATIONS</strong> · No es una página publicada</p>' +
      '<button type="button" class="demo-bar__sim" aria-haspopup="dialog">Ver qué está simulado</button>' +
    "</div>");
  document.body.prepend(bar);

  var panel = el("dialog", { class: "demo-dialog", "aria-labelledby": "sim-title" },
    '<div class="demo-dialog__body">' +
      '<p class="demo-dialog__tag">DEMO · ' + CFG.negocio.toUpperCase() + "</p>" +
      '<h2 id="sim-title">Qué está simulado en esta página</h2>' +
      "<p>Es un negocio de ejemplo para mostrar cómo trabajaría tu página. No se publica, no se envía ni se guarda ningún dato.</p>" +
      "<h3>Demostrativo en esta demo</h3>" +
      "<ul>" + lista(CFG.simulado) + "</ul>" +
      "<h3>Lo que ZOLKO conectaría en producción</h3>" +
      '<ul class="is-prod">' + lista(CFG.produccion) + "</ul>" +
    "</div>" +
    '<div class="demo-dialog__foot"><button type="button" data-close>Entendido</button></div>');
  document.body.appendChild(panel);

  bar.querySelector(".demo-bar__sim").addEventListener("click", function () { abrir(panel); });

  /* Abrir/cerrar diálogos (con respaldo si el navegador no soporta <dialog>) */
  var ultimoFoco = null;
  function abrir(d) {
    ultimoFoco = document.activeElement;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    var f = d.querySelector("[data-close]"); if (f) f.focus();
  }
  function cerrar(d) {
    if (typeof d.close === "function") d.close(); else d.removeAttribute("open");
    if (ultimoFoco) ultimoFoco.focus();
  }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-close]");
    if (c) cerrar(c.closest("dialog"));
    // Clic en el fondo oscuro cierra el diálogo
    if (e.target.tagName === "DIALOG") cerrar(e.target);
  });

  /* Altura real de la banda y del encabezado → variables CSS */
  var header = document.querySelector(".site-header");
  function medir() {
    document.documentElement.style.setProperty("--demo-bar-h", bar.offsetHeight + "px");
    if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  medir();
  window.addEventListener("resize", medir);
  if ("ResizeObserver" in window) new ResizeObserver(medir).observe(bar);

  /* ------------------------------------------------------------------
     2. WhatsApp: enlace con número de ejemplo + vista previa del mensaje
     ------------------------------------------------------------------ */
  // Un enlace puede llevar su propio número con data-wa-num="52..." (por ejemplo, el WhatsApp real de ZOLKO)
  function urlWhatsApp(msg, num) {
    return "https://wa.me/" + (num || WHATSAPP_EJEMPLO) + "?text=" + encodeURIComponent(msg);
  }
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = urlWhatsApp(a.getAttribute("data-wa") || "Hola, quiero información.", a.getAttribute("data-wa-num"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  var waDialog = el("dialog", { class: "demo-dialog", "aria-labelledby": "wa-title" },
    '<div class="demo-dialog__body">' +
      '<p class="demo-dialog__tag">WHATSAPP · SIMULADO</p>' +
      '<h2 id="wa-title">Así le llegaría el mensaje al negocio</h2>' +
      '<div class="wa-preview"><div class="wa-preview__bubble" data-wa-text></div>' +
      '<p class="wa-preview__meta" data-wa-para></p></div>' +
      '<p style="margin:14px 0 0;font-size:.92rem;color:#b9b9c6">En la página real se abre el WhatsApp del negocio con este texto ya escrito. ZOLKO lo conecta con respuestas y seguimiento.</p>' +
    "</div>" +
    '<div class="demo-dialog__foot">' +
      '<button type="button" data-close>Cerrar</button>' +
      '<a class="is-main" data-wa-go target="_blank" rel="noopener">Abrir WhatsApp de ejemplo</a>' +
    "</div>");
  document.body.appendChild(waDialog);

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-wa]");
    if (!a) return;
    e.preventDefault();
    var msg = a.getAttribute("data-wa"), num = a.getAttribute("data-wa-num");
    waDialog.querySelector("[data-wa-text]").textContent = msg;
    waDialog.querySelector("[data-wa-para]").textContent = num ? "Para: +" + num + " (WhatsApp real de ZOLKO)" : "Para: +" + WHATSAPP_EJEMPLO + " (número de ejemplo)";
    var go = waDialog.querySelector("[data-wa-go]");
    go.href = urlWhatsApp(msg, num);
    go.textContent = num ? "Abrir WhatsApp" : "Abrir WhatsApp de ejemplo";
    abrir(waDialog);
  });

  /* ------------------------------------------------------------------
     3. Menú en celular
     ------------------------------------------------------------------ */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
    }
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ------------------------------------------------------------------
     4. Formulario: validación + confirmación simulada (no envía nada)
     ------------------------------------------------------------------ */
  var hoy = new Date();
  var hoyISO = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach(function (i) { i.min = hoyISO; });

  function validar(campo) {
    var v = (campo.value || "").trim();
    var msg = "";
    if (campo.required && !v) {
      msg = campo.getAttribute("data-msg") || "Este dato es necesario.";
    } else if (campo.type === "tel" && !/^\d{10,13}$/.test(v.replace(/[\s\-().+]/g, ""))) {
      msg = "Revisa tu número: escríbelo completo, con lada.";
    } else if (campo.type === "date" && v && v < hoyISO) {
      msg = "Elige hoy o un día posterior.";
    }
    var err = document.getElementById(campo.id + "-error");
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  }

  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var campos = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));

    campos.forEach(function (c) {
      // Valida al salir del campo y corrige en vivo si ya tenía error
      c.addEventListener("blur", function () { if (c.value) validar(c); });
      c.addEventListener("input", function () { if (c.getAttribute("aria-invalid") === "true") validar(c); });
      c.addEventListener("change", function () { if (c.getAttribute("aria-invalid") === "true") validar(c); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // ← la demo NUNCA envía datos
      var primeroMalo = null;
      campos.forEach(function (c) { if (!validar(c) && !primeroMalo) primeroMalo = c; });
      if (primeroMalo) { primeroMalo.focus(); status.classList.remove("is-visible"); return; }

      form.reset();
      campos.forEach(function (c) { c.removeAttribute("aria-invalid"); });
      status.classList.remove("is-visible");
      void status.offsetWidth; // reinicia la animación
      status.classList.add("is-visible");
      status.focus();
    });
  });

  /* ------------------------------------------------------------------
     5. Aparición suave de secciones
     ------------------------------------------------------------------ */
  var revelar = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revelar.forEach(function (n) { n.classList.add("is-in"); });
  } else {
    // Lo que ya está en pantalla se queda visible desde el primer momento
    revelar.forEach(function (n) { if (n.getBoundingClientRect().top < innerHeight) n.classList.add("is-in"); });
    document.documentElement.classList.add("js-anim");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revelar.forEach(function (n) { io.observe(n); });
  }
})();
