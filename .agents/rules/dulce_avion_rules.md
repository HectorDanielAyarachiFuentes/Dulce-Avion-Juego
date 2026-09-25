# Reglas del Proyecto Dulce Avión 3D

## Normas de Código y Estética
- **JSDoc Inicial**: Todo archivo JS en `js/` debe iniciar en la línea 1 con un bloque JSDoc describiendo su función.
- **Paleta de Colores**: Emplear siempre `js/utils/colors.js`.
- **Estado Único**: Modificar o leer variables de estado a través de `js/core/GameState.js`.
- **Three.js & Rendimiento**: Evitar crear instancias de `Geometry` o `Material` dentro del ciclo `update()` o `gameLoop` para prevenir recolección de basura innecesaria.
- **Documentación Viva**: Mantener actualizados `AI_GUIDE.json` y `AGENTS.md`.

## Uso de GitNexus para Asistencia de Agentes
- Consultar símbolos con `npx gitnexus context <simbolo>`.
- Evaluar blast radius antes de refactorizar con `npx gitnexus impact <simbolo>`.
- Detectar flujos alterados al finalizar con `npx gitnexus detect-changes`.
