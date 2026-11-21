# ZOLKO · Sitio web + demos en vivo

Sitio web de ZOLKO INTEGRATIONS (`index.html`) con sus servicios y **catorce demos en vivo**: ocho herramientas (tarjeta de lealtad en Wallet, menú digital, ARM con agente de IA, automatización por WhatsApp, contenido, tarjeta digital, capacitación y página por sucursal con NFC y QR) y seis páginas por giro (restaurante, car wash, joyería, academia, inmobiliaria y consultorio). La versión en diapositivas para reuniones sigue en `presentacion.html`.

Todo es HTML, CSS y JavaScript sin frameworks ni compilación. Los negocios de las demos son **de ejemplo** y todo lo que necesitaría un servidor está **simulado**: ningún formulario envía ni guarda datos. La única excepción es la tarjeta digital: es la de Ricardo, con sus datos reales.

```
zolko-demos/
├── index.html              ← sitio web de ZOLKO: inicio con celular en vivo, problema, vitrina de servicios, giros, caso real, cómo trabajamos, cierre
├── presentacion.html       ← versión en diapositivas (modo reunión, 9 diapositivas)
├── demos/
│   ├── tarjeta-lealtad.html← Casa Brasa · tarjeta de sellos en Apple/Google Wallet con avisos (DESTACADA)
│   ├── menu-digital.html   ← Casa Brasa · menú con QR y pedido por WhatsApp
│   ├── arm.html            ← Ola Azul · ARM: agente de IA que mueve al cliente de etapa
│   ├── crm.html            ← redirige a arm.html (enlaces viejos)
│   ├── automatizacion.html ← Vida Plena · asistente de WhatsApp que agenda
│   ├── contenido.html      ← Estudio Clave · plan semanal de reels y carruseles
│   ├── tarjeta-digital.html← tarjeta NFC/QR de Ricardo (datos reales)
│   ├── capacitacion.html   ← taller de IA para equipos + mini diagnóstico
│   ├── landing-sucursal.html← Casa Brasa · una página por sucursal (NFC/QR, reseña de Google, redes y WhatsApp)
│   ├── restaurante.html    ← landing · pedir por WhatsApp
│   ├── car-wash.html       ← landing · agendar lavado
│   ├── joyeria.html        ← landing · ver catálogo y escribir por WhatsApp
│   ├── academia.html       ← landing · agendar clase muestra
│   ├── inmobiliaria.html   ← landing · agendar visita
│   └── consultorio.html    ← landing · agendar cita
├── assets/
│   ├── demo-base.css / demo-base.js  ← base compartida de las demos (incluye el bloque final "¿Quieres esto para tu negocio?")
│   ├── video-modal.js      ← ventana de video "▶ Ver cómo funciona"
│   ├── img/                ← imágenes de marca de ZOLKO (de las campañas)
│   ├── img/platillos/      ← ilustraciones SVG propias de los platillos de Casa Brasa
│   ├── thumbs/             ← capturas de cada demo (las usa presentacion.html)
│   ├── vitrina/            ← capturas largas de los giros (se recorren dentro del celular) y del caso real
│   ├── og-zolko-eslogan.jpg ← imagen al compartir el enlace (1200 × 630): personaje + "Primero entendemos. Después integramos."
│   ├── zolko-logo.svg, zolko-anillo.svg, ricardo.jpg
├── videos/                 ← video de cada demo (.mp4), vista previa corta (loop-*.mp4), portada (.jpg), subtítulos (.vtt) y lista.js
├── netlify.toml            ← publicación estática + noindex
└── README.md
```

> Si cambias una demo, vuelve a grabar su video (ver abajo) y, si es un giro, su captura larga en `assets/vitrina/` (360 px de ancho, WebP).

## Videos de las demos

Los videos se graban solos: un celular simulado abre la demo, toca los botones (un círculo verde marca cada toque) y se escriben los subtítulos con los tiempos reales.

```bash
node herramientas/grabar-videos.js zolko-demos /tmp/grabaciones menu wallet      # graba (o sin claves: todas)
bash herramientas/codificar-videos.sh /tmp/grabaciones zolko-demos/videos menu wallet
```

Claves: `web, menu, whatsapp, arm, contenido, nfc, wallet, capacitacion, sucursal`. Los pasos de cada video están en `VIDEOS` dentro de `grabar-videos.js`. Requiere Node con Playwright y `ffmpeg`.

## Caso real (Plataforma Joyería)

La sección `#caso` muestra las páginas reales de las 3 sucursales de Plataforma. **Oculta por el momento** (indicación de Ricardo). Para mostrarla, quita `hidden` de `<section class="section caso" id="caso">` y de los dos `<li data-caso>` (menú y pie).

---

## 1. Abrirlo en local

**Opción rápida:** doble clic en `index.html`. Se abre el sitio y desde ahí entras a cada demo. Para presentar en reunión con diapositivas, abre `presentacion.html` (también hay un enlace "Modo presentación" al pie del sitio).

**Opción servidor local** (útil para probarlo en el celular dentro de la misma red Wi-Fi):

```bash
cd zolko-demos
python3 -m http.server 8080
# abre http://localhost:8080 en la computadora
# o http://IP-DE-TU-COMPUTADORA:8080 en el celular
```

Las fuentes vienen de Google Fonts, así que se ven mejor con internet. Sin conexión todo funciona, solo con fuentes del sistema.

### Cómo se usa la presentación (presentacion.html)
- **Computadora:** flechas ← → del teclado (también Inicio/Fin) o los botones de abajo.
- **Celular:** desliza a la izquierda o derecha. Si una diapositiva es larga, se desplaza hacia abajo.
- El indicador `01 / 08` está arriba a la derecha.
- `presentacion.html#demos` abre directo en la diapositiva de demos (las demos regresan al sitio con "← Volver a ZOLKO").
- Respeta "reducir movimiento" del sistema operativo.

---

## 2. Adaptar una demo para un cliente real

Duplica la demo del giro más parecido (por ejemplo `demos/restaurante.html` → `demos/nombre-del-cliente.html`) y cambia lo siguiente.

### Colores y tipografías
Cada demo tiene al inicio un bloque `:root` marcado como **IDENTIDAD DEL NEGOCIO**. Solo cambia esos valores:

| Variable | Para qué sirve |
|---|---|
| `--c-bg` | Fondo general |
| `--c-surface` | Fondo de bloques alternos |
| `--c-text` / `--c-muted` | Texto principal / secundario |
| `--c-primary` / `--c-primary-hover` | Botón principal y su color al pasar el mouse |
| `--c-on-primary` | Texto encima del botón principal |
| `--c-accent` | Acento decorativo (íconos, subrayados) |
| `--c-dark` / `--c-on-dark` | Secciones oscuras y pie de página |
| `--font-display` / `--font-body` | Tipografía de títulos / de texto |
| `--radius` / `--radius-btn` | Redondeo de tarjetas / botones |

Si cambias la tipografía, cambia también el enlace de Google Fonts en el `<head>`. Revisa el contraste del texto sobre `--c-primary` (mínimo 4.5:1; puedes usar webaim.org/resources/contrastchecker).

### Textos
- Los textos están directamente en el HTML, sección por sección (cada una tiene un comentario: ENCABEZADO, SECCIÓN PRINCIPAL, etc.).
- Escribe con las palabras reales de los clientes del negocio (reseñas, mensajes de WhatsApp, preguntas frecuentes). Úsalas para redactar, **nunca** como testimonios ni con nombres.
- Usa fotos reales del cliente en lugar de las ilustraciones SVG (guárdalas en `assets/` y cambia el `<svg>` por un `<img>` con su `alt`).
- El panel **"Ver qué está simulado"** se llena con `window.DEMO_CONFIG` (en el `<head>` de cada demo): `simulado` y `produccion`.

### Número de WhatsApp
- **Demos:** el número de ejemplo `5200000000000` está en una sola línea de `assets/demo-base.js` (`WHATSAPP_EJEMPLO`). Los mensajes ya escritos están en cada enlace, en el atributo `data-wa="..."`. Si un botón debe ir a otro número, agrégale `data-wa-num="52..."` (así están los botones "Pedir este" de Casa Brasa, que van al WhatsApp real de ZOLKO).
- **Sitio y presentación:** el WhatsApp real de ZOLKO está en los enlaces `wa.me/523343230958` de `index.html`, `presentacion.html` y `demos/tarjeta-digital.html` (búscalos y reemplázalos si cambia).
- **Presentación (diapositiva 09):** el número de ZOLKO (`523343230958`) está en `presentacion.html`, en `data-numero="..."` del botón y en el enlace `WhatsApp: +52 33 4323 0958` de abajo. Si cambia, actualiza los dos (solo dígitos y con lada en `data-numero`).
- **Bloque final de cada demo** ("¿Quieres esto para tu negocio?"): usa el WhatsApp real (`WHATSAPP_ZOLKO` en `assets/demo-base.js`).

### Precio
ZOLKO no publica precios: todo se cotiza directo con Ricardo. El bloque "¿Cuánto cuesta?" del sitio y la diapositiva 08 dicen: "Cada negocio es distinto, por eso cotizamos directo contigo. Empezamos con una investigación de tu negocio; su costo se te devuelve completo al contratar cualquier servicio." con el botón "Cotizar con Ricardo". No usar "gratis" ni "gratuito".

Los precios de los catálogos (menú digital y páginas por giro) son **de ejemplo**, en pesos mexicanos, y cada página lo aclara. Para un cliente real, cámbialos en las etiquetas `price-tag` de cada tarjeta y, en el menú digital, en el último número de cada platillo dentro de `MENU`.

### Para pasarlo a producción
Lo que hoy es simulado y habría que conectar:
- Formulario → ARM (y aviso al WhatsApp del negocio).
- Seguimiento automático por WhatsApp (confirmación, recordatorio, seguimiento).
- Agenda real (horarios disponibles) en car wash, academia, inmobiliaria y consultorio.
- Catálogo con inventario en la joyería.
- Mapa real (Google Maps) en el pie de página.
- Medición de visitas, clics a WhatsApp y envíos del formulario.
- Quitar la banda "Demo de ZOLKO INTEGRATIONS", el `noindex` del `<head>` y la vista previa de WhatsApp de `demo-base.js`.

---

## 3. Publicar una vista previa privada en Netlify

Las páginas tienen `noindex` para que Google no las muestre. El enlace de Netlify es público para quien lo tenga: compártelo solo con el prospecto.

### Opción A · Arrastrar y soltar (sin instalar nada)
1. Entra a **https://app.netlify.com/drop** (inicia sesión para que el sitio no se borre).
2. Arrastra la carpeta **`zolko-demos`** completa.
3. Netlify te da un enlace tipo `https://nombre-aleatorio.netlify.app`. Cámbiale el nombre en *Site configuration → Change site name* (ej. `zolko-demo-casa-brasa`).
4. Manda el enlace al prospecto por WhatsApp.

### Opción B · Línea de comandos
```bash
npm install -g netlify-cli
netlify login
cd zolko-demos
netlify deploy --dir .          # crea una vista previa (borrador) con enlace propio
# netlify deploy --dir . --prod # solo cuando quieras publicarla en el enlace principal
```
`netlify deploy` sin `--prod` genera un enlace de borrador único: ideal para mandar una vista previa sin tocar la versión principal.

Si tu plan de Netlify lo incluye, puedes protegerlo con contraseña en *Site configuration → Access & security → Visitor access*.

---

## Videos "▶ Ver cómo funciona"

Cada tarjeta de servicios del sitio abre un video corto en una ventana. Los archivos van en `videos/`:

| Archivo | Servicio | Portada | Subtítulos / guion |
|---|---|---|---|
| `web.mp4` | Páginas web | `web.jpg` | `web.vtt` |
| `menu.mp4` | Menú digital | `menu.jpg` | `menu.vtt` |
| `whatsapp.mp4` | WhatsApp que contesta | `whatsapp.jpg` | `whatsapp.vtt` |
| `arm.mp4` | ARM · agente de clientes | `arm.jpg` | `arm.vtt` |
| `contenido.mp4` | Contenido | `contenido.jpg` | `contenido.vtt` |
| `nfc.mp4` | Tarjeta digital NFC | `nfc.jpg` | `nfc.vtt` |
| `wallet.mp4` | Lealtad en Wallet | `wallet.jpg` | `wallet.vtt` |
| `capacitacion.mp4` | Capacitación | `capacitacion.jpg` | `capacitacion.vtt` |

**Para subir un video:**
1. Guárdalo en `videos/` con el nombre exacto (MP4, H.264, 16:9, de 15 a 30 segundos, de preferencia menos de 8 MB).
2. Ajusta los tiempos de su `.vtt` si cambiaste el guion.
3. Agrega su nombre en `videos/lista.js`, por ejemplo: `window.ZOLKO_VIDEOS_LISTOS = ["wallet"];`

Mientras un video no esté en la lista, su botón muestra la portada con "Video próximamente" y el enlace a la demo, sin pedir el archivo. El video arranca sin sonido y con controles; nada se descarga hasta que alguien toca el botón. Los subtítulos se ven en el sitio publicado; al abrirlo con doble clic el navegador no los carga.

## Tarjetas de lealtad en Wallet: qué se necesita en producción

La demo (`demos/tarjeta-lealtad.html`) es una simulación. Para hacerla real para un cliente:

- **Apple Wallet:** las tarjetas se firman con un certificado *Pass Type ID*, que exige una cuenta del Apple Developer Program (del cliente, de ZOLKO o de la plataforma que se use).
- **Google Wallet:** cuenta emisora en la consola de Google Pay y Wallet (la aprueba Google antes de publicar).
- **Plataforma:** se puede usar una plataforma de pases (Pushwoosh, PassKit, Passcreator, entre otras) o un desarrollo propio, conectado al CRM y a WhatsApp.
- **Avisos:** Apple muestra la notificación cuando cambia un dato de la tarjeta que tiene mensaje de cambio; Google permite hasta tres avisos con notificación por tarjeta cada 24 horas. Los avisos deben tener que ver con la tarjeta (sellos, recompensas, promociones del programa), no ser publicidad masiva.

## Reglas que respeta este proyecto
- No menciona ninguna ciudad.
- No tiene testimonios, cifras, premios, clientes ni resultados inventados.
- No ofrece nada gratis.
- Todo lo que necesitaría un servidor está simulado y se dice que es simulado.
- Los formularios no envían ni guardan datos: muestran "Solicitud recibida (simulación)" y limpian los campos.
