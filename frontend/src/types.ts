export type MuscleGroup =
  | "pecho"
  | "espalda"
  | "hombros"
  | "biceps"
  | "triceps"
  | "core"
  | "gluteos"
  | "piernas"
  | "movilidad"
  | "cardio"
  | "estiramientos";

export type Level = "principiante" | "intermedio" | "avanzado";
export type KneeSafety = "permitido" | "precaucion" | "bloqueado";
export type Implement = "barra" | "mancuerna" | "none";
export type BodyView = "front" | "back";

export interface Exercise {
  id: string;
  name: string;
  group: MuscleGroup;
  equipment: string;
  level: Level;
  pattern: string; // pose pattern key
  view: BodyView; // muscle map front/back
  muscles: string[]; // highlighted region keys
  instructions: string[];
  mistakes: string[];
  easier: string; // alternativa más fácil
  noEquip: string; // alternativa sin equipamiento
  sets: number;
  reps: string;
  restSec: number;
  duration?: string;
  kneeSafety: KneeSafety;
  implement: Implement;
  jumping: boolean;
  highImpact: boolean;
  deepKnee: boolean; // flexión profunda de rodilla
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSec: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  icon: string; // ionicon name
  exercises: RoutineExercise[];
  isTemplate: boolean;
  createdAt: string;
}

export interface SetLog {
  weight: number;
  reps: number;
  done: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
  effort: number; // 0-10 RPE
  pain: number; // 0-10
  notes: string;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  date: string; // ISO
  durationSec: number;
  exercises: ExerciseLog[];
  totalVolume: number;
  totalSets: number;
  avgEffort: number;
  maxPain: number;
}

export interface ActiveSession {
  routineId?: string;
  routineName: string;
  startedAt: string;
  exercises: ExerciseLog[];
  intensityReduced: boolean;
}

export type KneeSide = "izquierda" | "derecha" | "ambas";

export interface KneeSettings {
  enabled: boolean;
  side: KneeSide;
  painThreshold: number; // 0-10
  maxIntensity: number; // 0-10
  maxWeightKg: number;
  reducedRom: boolean;
}

export interface UserSettings {
  name: string;
  units: "kg" | "lb";
  weeklyGoal: number;
}

export interface ImageOverride {
  main?: string;
  start?: string;
  end?: string;
}
