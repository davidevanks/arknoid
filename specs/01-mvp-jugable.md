# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Aprovado
> **Depends on:** —
> **Date:** 2026-09-03
> **Objective:** Tener un Arkanoid de un nivel jugable en el navegador con paddle, bola, bloques rompibles de un golpe, vidas, puntuación y pantallas de inicio, pausa, game over y victoria.

---

## Section 1 — Por qué esta spec existe

El repo solo tiene assets y `assets/spritesheet.js`. No hay juego. Esta spec define el primer entregable jugable de punta a punta, sin dependencias, sirviéndose por HTTP y dibujando todo a través de los helpers de `spritesheet.js`.

---

## Scope

**In:**

- Canvas fijo de 800x600 px dentro de `index.html`.
- Bucle de juego con `requestAnimationFrame` y delta-time.
- Paddle controlado por ratón (posición horizontal) y teclado (flechas ← → y A / D).
- Una bola con rebote en paredes, techo y paddle; el ángulo de salida del paddle depende del punto de impacto.
- Una rejilla fija de bloques (definida en `js/levels.js`) centrada en la parte superior, con color por fila usando los sprites `block_<color>`.
- Bloques de un solo golpe; cada bloque rota otorga 10 puntos.
- 3 vidas. Perder la bola por el borde inferior resta una vida y relanza la bola pegada al paddle.
- Marcador visible con puntuación y vidas restantes (HUD dibujado en el canvas).
- Pantalla de **Inicio**: "Pulsa para jugar" antes de lanzar la bola.
- Estado de **Pausa** con tecla `Esc`, con overlay; se reanuda con `Esc` de nuevo.
- Pantalla de **Game Over** al llegar a 0 vidas, con opción de reiniciar (tecla o clic).
- Pantalla de **Victoria** al destruir todos los bloques, con opción de reiniciar.
- Servir el proyecto por HTTP (documentado en README ya existente).

**Out of scope (para futuras specs):**

- Varios niveles y progresión entre ellos.
- Power-ups / cápsulas que caen.
- Bloques con resistencia (2+ golpes) y bloques indestructibles.
- Audio (`ball-bounce.mp3`, `break-sound.mp3`).
- Animación de explosión con `drawFrame` / `EXPLOSION_FRAMES`.
- Highscore persistente en `localStorage`.
- Diseño responsivo / escalado del canvas al viewport.
- Soporte táctil / móvil.

---

## Data model

```js
// js/game.js — estado global del juego
const state = {
  screen: 'start',        // 'start' | 'playing' | 'paused' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  ballStuck: true,        // la bola está pegada al paddle esperando lanzamiento
};

// Paddle
const paddle = { x: 320, y: 560, w: 96, h: 16, speed: 480 }; // px/seg para teclado

// Ball
const ball = { x: 400, y: 544, r: 8, vx: 220, vy: -220 };    // velocidad px/seg

// Bloque (elemento del array de bloques activos)
// { x, y, w, h, color, alive }
```

```js
// js/levels.js — layout único del MVP
// Filas de color de arriba a abajo; cada string es una fila, cada char una celda.
// 'r' red, 'y' yellow, 'c' cyan, 'm' magenta, 'p' hotpink, 'g' green, '.' vacío
const LEVEL_1 = [
  'rrrrrrrrrrrrr',
  'yyyyyyyyyyyyy',
  'ccccccccccccc',
  'mmmmmmmmmmmmm',
  'ppppppppppppp',
  'ggggggggggggg',
];
// Bloque: 56x20 px, gap 4 px, rejilla centrada horizontalmente, margen superior 60 px.
```

Convenciones:

- Origen de coordenadas: esquina superior izquierda del canvas.
- Velocidades en píxeles por segundo; el bucle multiplica por delta-time en segundos.
- Colores válidos de bloque: `red, yellow, cyan, magenta, hotpink, green` (claves de `SPRITES.blocks`).

---

## Implementation plan

1. Crear `index.html` con un `<canvas id="game" width="800" height="600">`, enlazar `assets/spritesheet.js`, `css/style.css` y los módulos `js/*.js` en orden. Fondo negro centrado. Test manual: la página carga sin errores por HTTP.
2. Crear `css/style.css`: centrar el canvas, fondo de página oscuro, cursor oculto sobre el canvas.
3. Crear `js/levels.js` con `LEVEL_1` y una función `buildBlocks(level)` que devuelve el array de bloques con coords calculadas. Test: `buildBlocks(LEVEL_1).length === 78`.
4. Crear `js/entities.js` con los factories/estado de `paddle` y `ball` y funciones puras de dibujo (`drawPaddle`, `drawBall`, `drawBlocks`) que llaman a `drawSprite`. Test: al arrancar se ven paddle, bola y bloques quietos.
5. Crear `js/input.js`: listeners de `mousemove` (mapea a x del paddle con clamp), `keydown`/`keyup` para ← → A D y `Esc`, y clic/tecla para lanzar la bola y reiniciar. Expone un objeto `input` con el estado.
6. Crear `js/game.js` con `state`, `resetGame()`, `update(dt)` y `render()` para el estado `playing`: mover paddle (teclado), mover bola, rebotes con paredes y techo.
7. Añadir en `update(dt)` la colisión bola-paddle con ángulo según offset de impacto, y la colisión bola-bloque (AABB): marcar `alive = false`, sumar 10 puntos, invertir componente de velocidad correspondiente.
8. Añadir gestión de vidas: si la bola cruza el borde inferior, `lives--`, `ballStuck = true`; si `lives === 0`, `state.screen = 'gameover'`.
9. Añadir condición de victoria: si no quedan bloques `alive`, `state.screen = 'win'`.
10. Crear `js/main.js`: `loadSpritesheet` y, en su callback, arrancar el bucle `requestAnimationFrame` con delta-time; despachar `update`/`render` según `state.screen`.
11. Implementar el render de las pantallas `start`, `paused`, `gameover`, `win` (overlay semitransparente + texto con `ctx.fillText`) y el HUD de puntuación/vidas en `playing`.
12. Implementar transiciones: `start → playing` (clic/tecla), `playing ↔ paused` (`Esc`), `gameover/win → start` (clic/tecla) llamando a `resetGame()`.

---

## Acceptance criteria

- [ ] La página se sirve por HTTP y carga sin errores en la consola.
- [ ] Al cargar se muestra la pantalla de inicio con el texto "Pulsa para jugar".
- [ ] Un clic o una tecla pasa de inicio a juego y lanza la bola.
- [ ] El paddle sigue el movimiento horizontal del ratón sin salirse del canvas.
- [ ] Las flechas ← → y las teclas A / D mueven el paddle.
- [ ] La bola rebota en las dos paredes laterales y en el techo.
- [ ] La bola rebota en el paddle y su ángulo cambia según dónde golpea.
- [ ] Al golpear un bloque, el bloque desaparece y la puntuación aumenta exactamente en 10.
- [ ] Perder la bola por abajo resta una vida y la bola vuelve pegada al paddle.
- [ ] Con 0 vidas aparece la pantalla de Game Over.
- [ ] Al destruir todos los bloques aparece la pantalla de Victoria.
- [ ] `Esc` pausa el juego mostrando un overlay y `Esc` de nuevo lo reanuda.
- [ ] Desde Game Over o Victoria, un clic o tecla reinicia el juego a la pantalla de inicio con score 0 y 3 vidas.
- [ ] El HUD muestra la puntuación y las vidas durante el juego.
- [ ] Todo el dibujo pasa por `drawSprite` / helpers de `spritesheet.js`; no hay `new Image()` nuevos.

---

## Decisions

- **Sí:** canvas fijo 800x600. Suficiente para el MVP y evita el trabajo de escalado responsivo.
- **Sí:** control ratón + teclado a la vez. Máxima comodidad de prueba sin coste real.
- **Sí:** estructura modular (`js/main.js`, `game.js`, `entities.js`, `input.js`, `levels.js`). Escala mejor cuando lleguen niveles y power-ups.
- **Sí:** layout de nivel como array de strings en `js/levels.js`. Fácil de leer y editar, y prepara el terreno para varios niveles.
- **Sí:** bloques de un golpe, 10 puntos fijos. Reduce la lógica de estado por bloque al mínimo.
- **No:** audio en el MVP. Los mp3 existen pero se integran en otra spec para no mezclar responsabilidades.
- **No:** animación de explosión. `drawFrame` y `EXPLOSION_FRAMES` quedan para la spec de FX.
- **No:** persistencia de highscore. Sin `localStorage` hasta que haya una spec de puntuaciones.
- **No:** varios niveles y power-ups. Cada uno tendrá su propia spec.
- **Nota:** las pantallas se dibujan sobre el canvas con `ctx.fillText`, sin HTML/CSS de overlay, para mantener un único punto de render.

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Abrir el juego como `file://` hace fallar la carga del spritesheet | README ya documenta servir por HTTP; `rawImg.onerror` deja un log claro en consola. |
| La bola se queda "atrapada" rebotando en horizontal entre paddle y bloque | Forzar una componente vertical mínima tras rebotar en el paddle. |
| Túnel de la bola a alta velocidad atravesando bloques | Velocidad de bola moderada (~310 px/s de módulo) y colisión AABB comprobada cada frame. |

---

## Qué **no** entra en esta spec

- Varios niveles y progresión.
- Power-ups y cápsulas.
- Bloques con resistencia o indestructibles.
- Audio y animación de explosión.
- Highscore persistente en `localStorage`.
- Canvas responsivo y soporte móvil / táctil.

Cada uno, si llega, irá en su propia spec.
