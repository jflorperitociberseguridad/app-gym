import { Exercise, MuscleGroup } from "../types";
import { upperBody } from "./exercises1";
import { lowerAndOther } from "./exercises2";

export const ALL_EXERCISES: Exercise[] = [...upperBody, ...lowerAndOther];

export interface GroupMeta {
  key: MuscleGroup;
  label: string;
  icon: string; // ionicon
}

export const GROUPS: GroupMeta[] = [
  { key: "pecho", label: "Pecho", icon: "body-outline" },
  { key: "espalda", label: "Espalda", icon: "man-outline" },
  { key: "hombros", label: "Hombros", icon: "barbell-outline" },
  { key: "biceps", label: "Bíceps", icon: "fitness-outline" },
  { key: "triceps", label: "Tríceps", icon: "fitness-outline" },
  { key: "core", label: "Core", icon: "grid-outline" },
  { key: "gluteos", label: "Glúteos", icon: "walk-outline" },
  { key: "piernas", label: "Piernas", icon: "walk-outline" },
  { key: "movilidad", label: "Movilidad", icon: "sync-outline" },
  { key: "cardio", label: "Cardio", icon: "heart-outline" },
  { key: "estiramientos", label: "Estiramientos", icon: "accessibility-outline" },
];

export const GROUP_LABEL: Record<MuscleGroup, string> = GROUPS.reduce(
  (acc, g) => ({ ...acc, [g.key]: g.label }),
  {} as Record<MuscleGroup, string>,
);

export function getExercise(id: string): Exercise | undefined {
  return ALL_EXERCISES.find((e) => e.id === id);
}
