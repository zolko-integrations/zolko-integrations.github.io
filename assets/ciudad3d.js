/* =====================================================================
   ZOLKO · Ciudad 3D de noche (Three.js)
   Fondo de toda la página. La cámara la mueve el scroll desde index.html
   a través de window.ZC (posición, a dónde mira, cuántas ventanas
   encendidas y hasta qué piso de tu torre está iluminado).
   Si el navegador no tiene WebGL, la página usa el fondo de respaldo.
   ===================================================================== */
import * as THREE from "./vendor/three/three.module.min.js";

if (document.documentElement.classList.contains("estatico")) throw new Error("ZOLKO: modo quieto, sin ciudad 3D");
const ZC = window.ZC || (window.ZC = { cam: { px: 0, py: 70, pz: 330, tx: 0, ty: 60, tz: 0 }, lit: .45, piso: 0 });
const canvas = document.getElementById("escena3d");
const movil = matchMedia("(max-width: 999px)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !movil, powerPreference: "high-performance" });
} catch (e) {
  document.documentElement.classList.add("sin3d");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.25 : 1.6));
renderer.setClearColor(0x050507, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(movil ? 64 : 50, 1, 1, 4000);
const FOG = new THREE.Color(0x0d0a22);

/* ---------- Cielo: degradado con brillo violeta en el horizonte ---------- */
const cielo = new THREE.Mesh(
  new THREE.SphereGeometry(3000, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uLit: { value: .45 } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform float uLit; varying vec3 vP;
      void main(){
        float y = vP.y;
        vec3 top = vec3(.012,.010,.02), mid = vec3(.05,.035,.13), hor = vec3(.17,.11,.42);
        vec3 c = mix(hor, mid, smoothstep(0.,.18,y));
        c = mix(c, top, smoothstep(.18,.6,y));
        c += vec3(.12,.07,.3) * exp(-abs(y)*22.) * (.6 + uLit*.6);
        if (y < 0.) c = vec3(.03,.025,.07);
        gl_FragColor = vec4(c,1.);
      }`
  })
);
scene.add(cielo);

/* ---------- Estrellas ---------- */
{
  const n = movil ? 700 : 1600, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2, y = .08 + Math.random() * .9, r = 2600;
    const k = Math.sqrt(1 - y * y);
    pos[i * 3] = Math.cos(t) * k * r; pos[i * 3 + 1] = y * r; pos[i * 3 + 2] = Math.sin(t) * k * r;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xf4f4f7, size: movil ? 1.6 : 1.4, sizeAttenuation: false, transparent: true, opacity: .75, depthWrite: false })));
}

/* ---------- Ventanas por shader: sirve para todos los edificios ---------- */
const comunes = { uTime: { value: 0 }, uLit: { value: .45 }, uFog: { value: FOG }, uFogNear: { value: 260 }, uFogFar: { value: 1500 } };
const vertexEdificio = `
  attribute float aSeed;
  varying vec3 vW; varying vec3 vN; varying float vSeed;
  void main(){
    mat4 m = modelMatrix;
    #ifdef USE_INSTANCING
      m = m * instanceMatrix;
    #endif
    vec4 w = m * vec4(position,1.);
    vW = w.xyz; vN = normalize(mat3(m) * normal);
    #ifdef USE_INSTANCING
      vSeed = aSeed;
    #else
      vSeed = 7.0;
    #endif
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const ventanasGLSL = `
  uniform float uTime, uLit, uFogNear, uFogFar; uniform vec3 uFog;
  varying vec3 vW; varying vec3 vN; varying float vSeed;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  vec3 ventanas(float anchoV, float altoV, float lit, float brillo){
    float u = abs(vN.x) > .5 ? vW.z : vW.x;
    vec2 g = vec2(u / anchoV, vW.y / altoV);
    vec2 c = floor(g), f = fract(g);
    float win = step(.16,f.x) * step(f.x,.84) * step(.2,f.y) * step(f.y,.8);
    float r = h(c + vSeed * 13.7);
    float on = step(1. - lit, r);
    float parpadeo = step(.996, h(c + floor(uTime * .7 + vSeed)));
    on = abs(on - parpadeo);
    vec3 wc = mix(vec3(.72,.70,.88), vec3(.52,.40,1.), h(c * 1.7 + vSeed));
    wc = mix(wc, vec3(1.,.9,.72), step(.94, h(c * 3.1 + vSeed)) * .55);
    float k = .5 + .5 * h(c * 5.3 + vSeed);
    vec3 detalle = win * (on * wc * k * brillo + (1. - on) * vec3(.045,.04,.08));
    // De lejos las ventanas se funden en un brillo parejo (sin "ruido")
    float lejos = smoothstep(180., 620., length(vW - cameraPosition));
    vec3 promedio = vec3(.62,.56,.95) * lit * .32 * brillo + vec3(.03,.027,.055);
    return mix(detalle, promedio, lejos);
  }
  vec3 niebla(vec3 col){
    float d = length(vW - cameraPosition);
    return mix(col, uFog, smoothstep(uFogNear, uFogFar, d));
  }`;
const matEdificios = new THREE.ShaderMaterial({
  uniforms: comunes,
  vertexShader: vertexEdificio,
  fragmentShader: ventanasGLSL + `
    void main(){
      vec3 col = vec3(.03,.027,.05);
      if (abs(vN.y) < .5) col += ventanas(2.6, 3.4, uLit * .85, 1.);
      else col = vec3(.018,.016,.03);
      col *= .55 + .45 * smoothstep(0., 80., vW.y);
      gl_FragColor = vec4(niebla(col), 1.);
    }`
});

/* ---------- La ciudad: muchos edificios con instancias ---------- */
{
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, .5, 0);
  const lista = [];
  const paso = 30, rango = movil ? 520 : 760;
  for (let x = -rango; x <= rango; x += paso) {
    for (let z = -rango; z <= rango; z += paso) {
      if (Math.abs(x) % 150 < 10 || Math.abs(z) % 150 < 10) continue; // calles
      const d = Math.hypot(x, z);
      if (d < 70) continue;                                            // plaza de tu torre
      if (Math.abs(x) < 52 && z > 0) continue;                         // avenida por donde llega la cámara
      if (Math.random() < .12) continue;
      const cerca = Math.max(0, 1 - d / rango);
      let alto = 12 + Math.pow(Math.random(), 2.2) * (30 + 150 * cerca) + Math.random() * 14;
      if (d < 260) alto = Math.min(alto, 70 + d * .25);                // tu torre siempre es la más alta
      const ancho = 14 + Math.random() * 12, fondo = 14 + Math.random() * 12;
      lista.push([x + (Math.random() - .5) * 6, z + (Math.random() - .5) * 6, ancho, alto, fondo]);
    }
  }
  const inst = new THREE.InstancedMesh(geo, matEdificios, lista.length);
  const seeds = new Float32Array(lista.length);
  const m = new THREE.Matrix4();
  lista.forEach(([x, z, w, h, d], i) => { m.makeScale(w, h, d); m.setPosition(x, 0, z); inst.setMatrixAt(i, m); seeds[i] = Math.random() * 100; });
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  scene.add(inst);
}

/* ---------- Tu torre: 9 pisos que se encienden uno por uno ---------- */
const ALTO_TORRE = 162, BASE_TORRE = 12;
const matTorre = new THREE.ShaderMaterial({
  uniforms: Object.assign({ uPiso: { value: 0 } }, comunes),
  vertexShader: vertexEdificio,
  fragmentShader: ventanasGLSL + `
    uniform float uPiso;
    void main(){
      vec3 col = vec3(.04,.035,.07);
      if (abs(vN.y) < .5) {
        float nivel = (vW.y - ${BASE_TORRE.toFixed(1)}) / ${((ALTO_TORRE - BASE_TORRE) / 9).toFixed(2)};
        float piso = floor(nivel);
        float encendido = step(piso, uPiso - 1.) ;
        float actual = step(abs(piso - (uPiso - 1.)), .5);
        float lit = mix(uLit * .5, .92, encendido);
        vec3 v = ventanas(2.2, 3.2, lit, 1.15 + actual * (.6 + .4 * sin(uTime * 4.)));
        v = mix(v, v * vec3(.75,.7,1.25), encendido);
        col += v;
        // franja entre pisos
        float franja = smoothstep(.04, 0., abs(fract(nivel) - .0)) * step(0., nivel) * step(nivel, 9.);
        col += franja * vec3(.45,.36,1.) * (.25 + .75 * encendido);
      } else col = vec3(.03,.025,.05);
      gl_FragColor = vec4(niebla(col), 1.);
    }`
});
const torre = new THREE.Mesh(new THREE.BoxGeometry(36, ALTO_TORRE, 36).translate(0, ALTO_TORRE / 2, 0), matTorre);
scene.add(torre);
const corona = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24).translate(0, ALTO_TORRE + 7, 0), new THREE.MeshBasicMaterial({ color: 0x120e24 }));
scene.add(corona);
const bordes = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(36.4, ALTO_TORRE, 36.4).translate(0, ALTO_TORRE / 2, 0)), new THREE.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: .9 }));
scene.add(bordes);
const antena = new THREE.Mesh(new THREE.CylinderGeometry(.5, .8, 30).translate(0, ALTO_TORRE + 29, 0), new THREE.MeshBasicMaterial({ color: 0x1c1830 }));
scene.add(antena);
const faro = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0xa993ff }));
faro.position.set(0, ALTO_TORRE + 45, 0); scene.add(faro);

/* La ventana violeta del frente (a ella entra la cámara al inicio) */
const ventanaMeta = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.2), new THREE.MeshBasicMaterial({ color: 0xa993ff }));
ventanaMeta.position.set(0, 72, 18.05); scene.add(ventanaMeta);

/* Brillos suaves (sprites aditivos) */
function brillo(color, size) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.set(size, size, 1); return s;
}
const halo = brillo("rgba(169,147,255,.9)", 26); halo.position.copy(faro.position); scene.add(halo);
const haloVentana = brillo("rgba(169,147,255,.85)", 16); haloVentana.position.set(0, 72, 18.6); scene.add(haloVentana);
const resplandor = brillo("rgba(124,92,255,.35)", 1400); resplandor.position.set(0, 40, -900); scene.add(resplandor);

/* ---------- Suelo, calles y autos ---------- */
{
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: comunes, vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `uniform vec3 uFog; uniform float uFogNear, uFogFar; varying vec3 vW;
      void main(){
        vec2 g = abs(mod(vW.xz + 5., 150.) - 5.);
        float calle = 1. - smoothstep(4., 6., min(g.x, g.y));
        vec3 col = vec3(.015,.013,.03) + calle * vec3(.07,.05,.16);
        float d = length(vW - cameraPosition);
        gl_FragColor = vec4(mix(col, uFog, smoothstep(uFogNear, uFogFar, d)), 1.);
      }`
  }));
  scene.add(suelo);
}
const nAutos = movil ? 160 : 380;
const autos = [];
const posA = new Float32Array(nAutos * 3), colA = new Float32Array(nAutos * 3);
for (let i = 0; i < nAutos; i++) {
  const ejeX = Math.random() < .5, linea = (Math.round((Math.random() - .5) * 10) * 150) + (Math.random() < .5 ? -2 : 2);
  const vel = (18 + Math.random() * 26) * (Math.random() < .5 ? -1 : 1);
  autos.push({ ejeX, linea, vel, t: (Math.random() - .5) * 1600 });
  const rojo = vel < 0;
  colA[i * 3] = rojo ? 1 : .85; colA[i * 3 + 1] = rojo ? .3 : .82; colA[i * 3 + 2] = rojo ? .38 : 1;
}
const geoA = new THREE.BufferGeometry();
geoA.setAttribute("position", new THREE.BufferAttribute(posA, 3));
geoA.setAttribute("color", new THREE.BufferAttribute(colA, 3));
scene.add(new THREE.Points(geoA, new THREE.PointsMaterial({ size: movil ? 2.2 : 2, vertexColors: true, sizeAttenuation: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

/* ---------- Animación ---------- */
const cam = { px: ZC.cam.px, py: ZC.cam.py, pz: ZC.cam.pz, tx: ZC.cam.tx, ty: ZC.cam.ty, tz: ZC.cam.tz };
let ancho = 0, alto = 0, ultimo = 0, visible = true, t0 = performance.now();
function medir() {
  const w = innerWidth, h = innerHeight;
  if (w === ancho && h === alto) return;
  ancho = w; alto = h;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
function cuadro(ahora) {
  requestAnimationFrame(cuadro);
  if (!visible) return;
  if (movil && ahora - ultimo < 30) return; // ~30 cuadros por segundo en celular
  const dt = Math.min(.05, (ahora - (ultimo || ahora)) / 1000); ultimo = ahora;
  medir();
  const t = (ahora - t0) / 1000;
  comunes.uTime.value = t;
  comunes.uLit.value += (ZC.lit - comunes.uLit.value) * .06;
  matTorre.uniforms.uPiso.value += (ZC.piso - matTorre.uniforms.uPiso.value) * .12;
  cielo.material.uniforms.uLit.value = comunes.uLit.value;
  // Cámara: sigue a ZC con suavidad y un vaivén leve, como de grúa
  const s = 1 - Math.pow(.0015, dt);
  for (const k in cam) cam[k] += (ZC.cam[k] - cam[k]) * s;
  camera.position.set(cam.px + Math.sin(t * .23) * 1.6, cam.py + Math.sin(t * .31) * 1.1, cam.pz);
  camera.lookAt(cam.tx, cam.ty, cam.tz);
  // Autos
  for (let i = 0; i < nAutos; i++) {
    const a = autos[i]; a.t += a.vel * dt; if (a.t > 900) a.t = -900; if (a.t < -900) a.t = 900;
    posA[i * 3] = a.ejeX ? a.t : a.linea; posA[i * 3 + 1] = 1.2; posA[i * 3 + 2] = a.ejeX ? a.linea : a.t;
  }
  geoA.attributes.position.needsUpdate = true;
  // Faro y ventana violeta laten
  const p = .7 + .3 * Math.sin(t * 2.4);
  halo.material.opacity = p; haloVentana.material.opacity = .6 + .4 * Math.sin(t * 3);
  renderer.render(scene, camera);
}
medir();
requestAnimationFrame(cuadro);
document.documentElement.classList.add("con3d");
window.dispatchEvent(new Event("ciudad-lista"));
