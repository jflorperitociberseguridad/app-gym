import { Routine } from "../types";
import { getExercise } from "./exercises";

function re(id: string, sets?: number, reps?: string, restSec?: number) {
  const ex = getExercise(id);
  return {
    exerciseId: id,
    sets: sets ?? ex?.sets ?? 3,
    reps: reps ?? ex?.reps ?? "10-12",
    restSec: restSec ?? ex?.restSec ?? 60,
  };
}

export const SEED_ROUTINES: Routine[] = [
  {
    id: "rutina-tren-superior",
    name: "Tren superior",
    description: "Pecho, espalda, hombros y brazos en una sesión completa.",
    icon: "body-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("press-banca"),
      re("remo-barra"),
      re("press-militar"),
      re("jalon-pecho"),
      re("curl-barra"),
      re("extension-polea"),
    ],
  },
  {
    id: "rutina-espalda-brazos",
    name: "Espalda y brazos",
    description: "Enfoque en dorsales, bíceps y tríceps.",
    icon: "man-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("dominadas"),
      re("remo-sentado-polea"),
      re("remo-mancuerna"),
      re("curl-martillo"),
      re("curl-barra"),
      re("extension-sobre-cabeza"),
    ],
  },
  {
    id: "rutina-pecho-hombros",
    name: "Pecho y hombros",
    description: "Empuje de tren superior con volumen de deltoides.",
    icon: "barbell-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("press-banca"),
      re("press-inclinado-mancuerna"),
      re("aperturas-mancuerna"),
      re("press-militar"),
      re("elevaciones-laterales"),
      re("pajaros"),
    ],
  },
  {
    id: "rutina-core",
    name: "Core",
    description: "Abdomen, oblicuos y estabilidad del tronco.",
    icon: "grid-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("crunch"),
      re("plancha"),
      re("giro-ruso"),
      re("elevacion-piernas"),
      re("dead-bug"),
      re("bird-dog"),
    ],
  },
  {
    id: "rutina-pierna-protegida",
    name: "Pierna protegida",
    description: "Trabajo de piernas de bajo impacto y amable con la rodilla.",
    icon: "shield-checkmark-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("prensa-pierna", 3, "12-15"),
      re("sentadilla-pared"),
      re("curl-femoral"),
      re("puente-gluteo"),
      re("elevacion-gemelos"),
      re("abduccion-cadera"),
    ],
  },
  {
    id: "rutina-cuerpo-completo-bajo-impacto",
    name: "Cuerpo completo de bajo impacto",
    description: "Sesión de cuerpo entero cuidando articulaciones.",
    icon: "fitness-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("press-hombro-mancuerna"),
      re("remo-sentado-polea"),
      re("prensa-pierna", 3, "12-15"),
      re("puente-gluteo"),
      re("curl-barra"),
      re("plancha"),
    ],
  },
  {
    id: "rutina-movilidad-recuperacion",
    name: "Movilidad y recuperación",
    description: "Movilidad y estiramientos para recuperar.",
    icon: "sync-outline",
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    exercises: [
      re("circulos-cadera"),
      re("gato-camello"),
      re("rotacion-toracica"),
      re("movilidad-tobillo"),
      re("estiramiento-isquios"),
      re("postura-nino"),
    ],
  },
];
