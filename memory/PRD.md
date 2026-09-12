# PRD — Gym Personal (Entrenador con Rodilla Protegida)

## Original Problem Statement
App móvil personal de entrenamiento de gimnasio, lista para usar, 100% local, un solo usuario, sin registro. Biblioteca visual de 80+ ejercicios con diagramas explicativos (principal/inicio/fin/movimiento), modo "Rodilla protegida" configurable, planificador de rutinas, entrenamiento activo con temporizador de descanso, seguimiento de progreso con gráficas, historial, configuración, gestión de imágenes e importación/exportación JSON/CSV. Diseño moderno, español.

## Architecture
- **Frontend only**, Expo Router (React Native). No backend / no network dependency.
- **Persistencia local** vía `@/src/utils/storage` (AsyncStorage nativo / IndexedDB web). JSON serializado.
- **Estado global**: `src/store/GymStore.tsx` (Context) con exercises, routines, history, settings, knee, images, active session, intensityReduced.
- **Datos semilla**: `src/data/exercises1.ts` + `exercises2.ts` (83 ejercicios), `src/data/routines.ts` (7 rutinas), `src/data/poses.ts` (patrones de movimiento).
- **Visuales vectoriales** (react-native-svg): `Figure.tsx` (figura articulada paramétrica por pose), `MuscleMap.tsx` (silueta con músculo trabajado resaltado), `ExerciseVisual.tsx` (pager Principal/Inicio/Fin/Movimiento + flechas).
- **Gráficas**: `Charts.tsx` (BarChart, LineChart SVG). Métricas en `src/lib/metrics.ts`.
- **Tema**: `src/theme.ts` (rojo señal #E63946 sobre negro/blanco, light + dark).

## User Persona
Persona única que entrena en gimnasio y necesita cuidar su rodilla; quiere seguir rutinas, registrar progreso y evitar ejercicios de riesgo.

## Core Requirements (static)
1. Biblioteca visual 80+ ejercicios con imágenes/diagramas (todos tienen imagen). ✔ 83 ejercicios.
2. Modo Rodilla protegida (lado, umbral dolor, intensidad/peso máximo, rango reducido, permitido/precaución/bloqueado, evita saltos/impacto/flexión profunda). ✔
3. Planificador de rutinas (crear/editar/duplicar/ordenar/plantillas/iniciar). ✔ 7 rutinas semilla.
4. Entrenamiento activo (temporizador descanso, marcar series, peso/reps/esfuerzo/dolor). ✔
5. Seguimiento de progreso (gráficas, evolución dolor/carga, frecuencia, mejores marcas). ✔
6. Persistencia local + exportar/importar JSON, importar CSV. ✔

## Implemented (2026-06)
- Dashboard con hero, banner de intensidad reducida, rutina sugerida, stats bento, historial reciente.
- Biblioteca con buscador, chips de grupo, filtro "ocultar bloqueados", 83 tarjetas con miniatura muscular.
- Detalle de ejercicio: pager de 4 diagramas, tags, badge de seguridad de rodilla, instrucciones, errores, alternativas, aviso médico.
- Rutinas: lista, crear (sheet), detalle/edición (reordenar, añadir/quitar, series/reps/descanso, duplicar, plantilla, eliminar, iniciar).
- Entrenamiento activo: prellenado desde historial (90% si intensidad reducida), series con peso/reps/OK, +serie, esfuerzo/dolor, temporizador de descanso auto, aviso peso máx rodilla, finalizar → guarda sesión → evalúa dolor vs umbral.
- Progreso: totales, volumen/frecuencia por semana, dolor y carga (línea), evolución por ejercicio, mejores marcas.
- Ajustes: perfil (nombre/unidad/meta), Rodilla protegida, Gestión de imágenes (image picker + permisos), Importar/Exportar (JSON/CSV, portapapeles, compartir, archivo).

## Backlog / Next
- P1: Reordenar ejercicios por arrastre (drag-and-drop).
- P1: Resumen post-entrenamiento con récords batidos.
- P2: Recordatorios de descanso configurables por ejercicio.
- P2: Modo oscuro toggle manual en Ajustes.
