# Agent Guidelines & Repository Rules (Dulce Avión 3D)

Este documento define las directrices arquitectónicas, reglas de desarrollo y flujos de trabajo asistidos por **GitNexus** para agentes y desarrolladores que trabajen en este repositorio.

---

## 🎮 1. Arquitectura del Proyecto

**Dulce Avión 3D** es un juego arcade 3D para navegador construido sobre **Three.js** con JavaScript modular moderno (ES6 Modules) y diseño estilizado vibrante.

### Estructura Principal
* `index.html`: Punto de entrada DOM, contenedor WebGL y capas de UI/HUD.
* `style.css`: Estilos de UI, superposiciones retro/arcade, menús y fuentes.
* `js/main.js`: Bucle de juego (`gameLoop`), orquestación de managers e inicialización.
* `js/scene.js`: Configuración de Escena, Cámara y Renderizador (`THREE.LinearSRGBColorSpace`).
* `js/lights.js`: Sistema de iluminación físicamente correcta calibrada para colores vibrantes.
* `js/core/GameState.js`: Estado global reactivo y centralizado (puntuación, nivel, energía, salud).
* `js/managers/`:
  * `InputManager.js`: Gestión de entradas (teclado, ratón, toques móviles).
  * `LevelManager.js`: Progresión de niveles, ciclo día/noche, clima y reseteos.
  * `UIManager.js`: Interacciones del DOM, menús, pantalla de victoria y créditos.
* `js/objects/`: Modelos y lógica 3D procedural/cargada (Avión, Enemigos, Águilas, Nodriza, Mar, Cielo, Bosque, etc.).
* `js/ui/hud.js`: Renderizado del HUD en pantalla.
* `js/utils/`: Audio (`audio.js`), paleta de colores centralizada (`colors.js`) y matemáticas (`math.js`).

---

## 📐 2. Reglas Obligatorias de Desarrollo

1. **JSDoc en la primera línea:**
   Todo archivo JavaScript nuevo o modificado **debe** incluir un bloque JSDoc en la línea 1 resumiendo su responsabilidad y exportaciones.
2. **Uso de la Paleta Central:**
   Los materiales y colores 3D deben utilizarse desde `js/utils/colors.js` para mantener la estética uniforme.
3. **Mantenimiento del Espacio de Color:**
   No alterar la configuración `THREE.LinearSRGBColorSpace` en `js/scene.js` a menos que se adapten los tonos de los materiales de forma sincronizada.
4. **Estado Centralizado:**
   Nunca almacenar estados globales dispersos en objetos 3D. Utilizar y sincronizar con `js/core/GameState.js`.
5. **Sincronización de AI_GUIDE:**
   Siempre que se agregue o modifique la responsabilidad de un módulo, actualizar `AI_GUIDE.json` y este archivo `AGENTS.md`.

---

## 🧠 3. Integración y Flujo de Trabajo con GitNexus

GitNexus genera y mantiene un grafo de conocimiento de código e impacto dentro del repositorio (`.gitnexus/`). Todos los agentes deben utilizar los siguientes comandos para investigar y validar cambios antes de aplicar modificaciones complejas:

### A. Búsqueda y Exploración Conceptual
Antes de implementar una nueva mecánica o modificar una existente, consulta el grafo de conocimiento:
```bash
npx gitnexus query "<concepto o flujo a buscar>"
```
*Ejemplo:* `npx gitnexus query "spawning enemies and collision detection"`

### B. Análisis 360° de Símbolos (`context`)
Para inspeccionar quién llama a una función/clase y qué dependencias utiliza:
```bash
npx gitnexus context "<NombreDelSimbolo>"
```
*Ejemplo:* `npx gitnexus context "Airplane"` o `npx gitnexus context "GameState"`

### C. Análisis de Radio de Impacto (`impact` / Blast Radius)
**CRÍTICO:** Antes de modificar o eliminar métodos en managers u objetos que corren dentro del `gameLoop` (60fps), ejecuta el análisis de impacto para no romper llamadas indirectas:
```bash
npx gitnexus impact "<NombreDelSimbolo>"
```
*Ejemplo:* `npx gitnexus impact "LevelManager"`

### D. Trazabilidad de Flujo (`trace`)
Para entender el camino de ejecución entre dos partes del juego:
```bash
npx gitnexus trace "<SimboloOrigen>" "<SimboloDestino>"
```

### E. Detección de Cambios e Impacto en Git (`detect-changes`)
Tras realizar modificaciones en código, verifica qué flujos y símbolos se ven afectados antes de dar por completada la tarea:
```bash
npx gitnexus detect-changes
```

### F. Re-indexación tras cambios estructurales
Si se añaden nuevos archivos o se realizan refactorizaciones mayores:
```bash
npx gitnexus analyze
```

---

## 🚀 4. Protocolo de Ejecución para Agentes
1. **Entender:** Usa `npx gitnexus query` y `npx gitnexus context` para mapear dependencias.
2. **Planificar:** Evalúa el radio de impacto con `npx gitnexus impact`.
3. **Implementar:** Aplica código siguiendo las reglas arquitectónicas y estéticas.
4. **Validar:** Comprueba consistencia con `npx gitnexus detect-changes` y verifica en el navegador.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Dulce-Avion-Juego** (371 symbols, 1141 relationships, 20 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/Dulce-Avion-Juego/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Dulce-Avion-Juego/clusters` | All functional areas |
| `gitnexus://repo/Dulce-Avion-Juego/processes` | All execution flows |
| `gitnexus://repo/Dulce-Avion-Juego/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
