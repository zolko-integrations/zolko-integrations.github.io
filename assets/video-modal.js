/* =====================================================================
   ZOLKO · Video emergente ("▶ Ver cómo funciona")
   ---------------------------------------------------------------------
   Uso en el HTML:
     <button type="button" data-video="wallet"
             data-video-title="Tarjeta de lealtad en Wallet"
             data-video-demo="demos/tarjeta-lealtad.html">▶ Ver cómo funciona</button>

   Busca los archivos en la carpeta videos/ (junto a index.html), pero solo
   pide el video si su nombre está en videos/lista.js:
     videos/wallet.mp4  → el video vertical de celular (de 12 a 20 s)
     videos/wallet.jpg  → la portada
     videos/wallet.vtt  → los subtítulos en español

   - No carga nada hasta que alguien toca el botón (no frena la página).
   - Sin sonido automático: si arranca solo, arranca en silencio y con controles.
   - Si el video todavía no existe, muestra la portada con "Video próximamente"
     y el enlace a la demo. Nunca deja un reproductor roto.
   - Se cierra con Esc, con el botón Cerrar o tocando fuera.
   ===================================================================== */
(function () {
  "use strict";
  var base = document.documentElement.getAttribute("data-video-base") || "videos/";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dlg = null, ultimoFoco = null;

  /* Estilos del componente (independientes de cada página) */
  var css = document.createElement("style");
  css.textContent =
    ".vmodal{border:0;padding:0;width:min(440px,calc(100% - 24px));max-height:calc(100dvh - 24px);border-radius:20px;background:#0d0d10;color:#f4f4f7;box-shadow:0 40px 100px rgba(0,0,0,.7);font-family:Inter,system-ui,sans-serif}" +
    ".vmodal::backdrop{background:rgba(5,5,8,.78);backdrop-filter:blur(4px)}" +
    ".vmodal[open]{animation:vmIn .25s ease-out}@keyframes vmIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}" +
    ".vmodal__head{display:flex;align-items:center;gap:12px;padding:14px 16px 12px 20px}" +
    ".vmodal__head h2{margin:0;font:800 1rem Montserrat,Inter,sans-serif;text-transform:uppercase;letter-spacing:.02em;flex:1}" +
    ".vmodal__close{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:transparent;color:#fff;font-size:1.4rem;cursor:pointer;transition:background .2s}" +
    ".vmodal__close:hover{background:rgba(255,255,255,.1)}" +
    ".vmodal__stage{position:relative;aspect-ratio:390/844;max-height:calc(100dvh - 190px);margin:0 auto;background:#000}" +
    ".vmodal__stage video,.vmodal__stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
    ".vmodal__stage video{object-fit:contain;background:#000}" +
    ".vmodal__soon{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:20px;background:linear-gradient(180deg,rgba(5,5,5,.15),rgba(5,5,5,.75))}" +
    ".vmodal__soon b{display:inline-block;font:700 12px 'JetBrains Mono',monospace;letter-spacing:.14em;background:rgba(5,5,5,.85);border:1px solid rgba(198,255,61,.5);color:#c6ff3d;padding:8px 14px;border-radius:999px}" +
    ".vmodal__soon p{margin:10px 0 0;color:#e9e9ee;font-size:.95rem}" +
    ".vmodal__foot{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;padding:14px 20px 18px}" +
    ".vmodal__foot small{color:#b7b2d9}" +
    ".vmodal__demo{display:inline-flex;align-items:center;min-height:44px;padding:10px 18px;border-radius:12px;background:#c6ff3d;color:#0b0f00;font-weight:700;text-decoration:none}" +
    ".vmodal__demo:hover{box-shadow:0 0 0 4px rgba(198,255,61,.2)}" +
    ".vmodal :focus-visible{outline:3px solid #c6ff3d;outline-offset:3px}" +
    "@media (prefers-reduced-motion:reduce){.vmodal[open]{animation:none}}";
  document.head.appendChild(css);

  function crear() {
    dlg = document.createElement("dialog");
    dlg.className = "vmodal";
    dlg.setAttribute("aria-labelledby", "vm-title");
    dlg.innerHTML =
      '<div class="vmodal__head"><h2 id="vm-title"></h2><button type="button" class="vmodal__close" aria-label="Cerrar video">×</button></div>' +
      '<div class="vmodal__stage" id="vm-stage"></div>' +
      '<div class="vmodal__foot"><small id="vm-note"></small><a class="vmodal__demo" id="vm-demo">Probar la demo →</a></div>';
    document.body.appendChild(dlg);
    dlg.querySelector(".vmodal__close").addEventListener("click", cerrar);
    // Toque fuera del recuadro
    dlg.addEventListener("click", function (e) { if (e.target === dlg) cerrar(); });
    // Esc: el navegador dispara "cancel"; limpiamos el video al cerrar
    dlg.addEventListener("close", limpiar);
    // Si la demo es una sección de esta misma página, cerramos para que se vea
    dlg.querySelector("#vm-demo").addEventListener("click", function () {
      if ((this.getAttribute("href") || "").charAt(0) === "#") { ultimoFoco = null; cerrar(); }
    });
  }

  function proximamente(stage, clave) {
    stage.innerHTML = '<img src="' + base + clave + '.jpg" alt="">' +
      '<div class="vmodal__soon"><div><b>VIDEO PRÓXIMAMENTE</b><p>Mientras tanto, pruébalo tú mismo en la demo.</p></div></div>';
    document.getElementById("vm-note").textContent = "";
  }

  function abrir(btn) {
    if (!dlg) crear();
    var clave = btn.getAttribute("data-video");
    var stage = document.getElementById("vm-stage");
    document.getElementById("vm-title").textContent = btn.getAttribute("data-video-title") || "Cómo funciona";
    var demo = document.getElementById("vm-demo");
    demo.href = btn.getAttribute("data-video-demo") || "#";
    ultimoFoco = btn;

    // 1) Primero la portada: nunca se ve un reproductor vacío o roto
    proximamente(stage, clave);

    // 2) Solo pedimos el video si está marcado como listo en videos/lista.js
    var listos = window.ZOLKO_VIDEOS_LISTOS || [];
    if (listos.indexOf(clave) === -1) {
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      dlg.querySelector(".vmodal__close").focus();
      return;
    }
    //    Si está en la lista, lo cargamos en segundo plano y solo se muestra si de verdad existe
    document.getElementById("vm-note").textContent = "Cargando video…";
    var v = document.createElement("video");
    v.controls = true; v.muted = true; v.playsInline = true; v.preload = "metadata";
    v.poster = base + clave + ".jpg";
    v.setAttribute("aria-label", "Video: " + (btn.getAttribute("data-video-title") || ""));
    var src = document.createElement("source");
    src.src = base + clave + ".mp4"; src.type = "video/mp4";
    var listo = false;
    src.addEventListener("error", function () { if (!listo) proximamente(stage, clave); });
    v.addEventListener("error", function () { if (!listo) proximamente(stage, clave); });
    v.addEventListener("loadedmetadata", function () {
      listo = true;
      // Subtítulos: solo cuando el video existe. Al abrir el sitio con doble clic (file://)
      // el navegador no permite cargarlos; publicado en Netlify sí se ven.
      if (location.protocol !== "file:") {
        var track = document.createElement("track");
        track.kind = "subtitles"; track.srclang = "es"; track.label = "Español"; track.src = base + clave + ".vtt"; track.default = true;
        v.appendChild(track);
        track.addEventListener("load", function () { if (v.textTracks[0]) v.textTracks[0].mode = "showing"; });
      }
      stage.innerHTML = ""; stage.appendChild(v);
      document.getElementById("vm-note").textContent = "Sin sonido al iniciar. Activa el audio en los controles.";
      if (!reduce) v.play().catch(function () {});
    });
    v.appendChild(src);
    v.load();
    dlg._video = v;

    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    dlg.querySelector(".vmodal__close").focus();
  }

  function limpiar() {
    if (dlg && dlg._video) { try { dlg._video.pause(); dlg._video.removeAttribute("src"); dlg._video.innerHTML = ""; dlg._video.load(); } catch (e) {} dlg._video = null; }
    if (ultimoFoco) ultimoFoco.focus();
  }
  function cerrar() { if (typeof dlg.close === "function") dlg.close(); else { dlg.removeAttribute("open"); limpiar(); } }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-video]");
    if (!b) return;
    e.preventDefault();
    abrir(b);
  });
})();
