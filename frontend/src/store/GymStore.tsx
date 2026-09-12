import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { storage } from "@/src/utils/storage";
import { ALL_EXERCISES } from "@/src/data/exercises";
import { SEED_ROUTINES } from "@/src/data/routines";
import {
  ActiveSession,
  Exercise,
  ImageOverride,
  KneeSafety,
  KneeSettings,
  Routine,
  UserSettings,
  WorkoutSession,
} from "@/src/types";

const KEYS = {
  routines: "gym.routines.v1",
  history: "gym.history.v1",
  settings: "gym.settings.v1",
  knee: "gym.knee.v1",
  images: "gym.images.v1",
  custom: "gym.customExercises.v1",
  active: "gym.active.v1",
  reduced: "gym.intensityReduced.v1",
  seeded: "gym.seeded.v1",
};

async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await storage.getItem(key, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
async function saveJSON<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

export const DEFAULT_SETTINGS: UserSettings = { name: "Atleta", units: "kg", weeklyGoal: 4 };
export const DEFAULT_KNEE: KneeSettings = {
  enabled: true,
  side: "ambas",
  painThreshold: 5,
  maxIntensity: 7,
  maxWeightKg: 60,
  reducedRom: true,
};

export function effectiveSafety(ex: Exercise, knee: KneeSettings): KneeSafety {
  if (!knee.enabled) return ex.kneeSafety;
  if (ex.jumping || ex.highImpact) return "bloqueado";
  if (ex.deepKnee) return knee.reducedRom ? "bloqueado" : "precaucion";
  return ex.kneeSafety;
}

export function uid(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

interface GymState {
  ready: boolean;
  exercises: Exercise[];
  routines: Routine[];
  history: WorkoutSession[];
  settings: UserSettings;
  knee: KneeSettings;
  images: Record<string, ImageOverride>;
  active: ActiveSession | null;
  intensityReduced: boolean;

  getExercise: (id: string) => Exercise | undefined;
  safetyOf: (ex: Exercise) => KneeSafety;

  addRoutine: (r: Routine) => Promise<void>;
  updateRoutine: (r: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<Routine | undefined>;

  startWorkout: (routine?: Routine) => void;
  setActive: (a: ActiveSession | null) => void;
  finishWorkout: (session: WorkoutSession) => Promise<{ painExceeded: boolean }>;
  cancelWorkout: () => void;
  clearIntensityReduced: () => Promise<void>;

  updateSettings: (s: Partial<UserSettings>) => Promise<void>;
  updateKnee: (k: Partial<KneeSettings>) => Promise<void>;

  setImageOverride: (id: string, o: ImageOverride) => Promise<void>;
  resetImages: () => Promise<void>;

  addCustomExercises: (list: Exercise[]) => Promise<number>;
  exportData: () => object;
  importData: (data: any) => Promise<void>;
}

const Ctx = createContext<GymState | null>(null);

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [custom, setCustom] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [knee, setKnee] = useState<KneeSettings>(DEFAULT_KNEE);
  const [images, setImages] = useState<Record<string, ImageOverride>>({});
  const [active, setActiveState] = useState<ActiveSession | null>(null);
  const [intensityReduced, setIntensityReduced] = useState(false);

  useEffect(() => {
    (async () => {
      const seeded = await storage.getItem(KEYS.seeded, false);
      if (!seeded) {
        await saveJSON(KEYS.routines, SEED_ROUTINES);
        await storage.setItem(KEYS.seeded, true);
      }
      const [rt, hs, st, kn, im, cu, ac, rd] = await Promise.all([
        loadJSON<Routine[]>(KEYS.routines, SEED_ROUTINES),
        loadJSON<WorkoutSession[]>(KEYS.history, []),
        loadJSON<UserSettings>(KEYS.settings, DEFAULT_SETTINGS),
        loadJSON<KneeSettings>(KEYS.knee, DEFAULT_KNEE),
        loadJSON<Record<string, ImageOverride>>(KEYS.images, {}),
        loadJSON<Exercise[]>(KEYS.custom, []),
        loadJSON<ActiveSession | null>(KEYS.active, null),
        storage.getItem(KEYS.reduced, false),
      ]);
      setRoutines(rt);
      setHistory(hs);
      setSettings({ ...DEFAULT_SETTINGS, ...st });
      setKnee({ ...DEFAULT_KNEE, ...kn });
      setImages(im);
      setCustom(cu);
      setActiveState(ac);
      setIntensityReduced(!!rd);
      setReady(true);
    })();
  }, []);

  const exercises = useMemo(() => {
    const merged = [...ALL_EXERCISES, ...custom].map((e) => {
      const ov = images[e.id];
      return ov ? { ...e } : e;
    });
    return merged;
  }, [custom, images]);

  const getExercise = useCallback(
    (id: string) => exercises.find((e) => e.id === id),
    [exercises],
  );
  const safetyOf = useCallback((ex: Exercise) => effectiveSafety(ex, knee), [knee]);

  const persistRoutines = useCallback(async (next: Routine[]) => {
    setRoutines(next);
    await saveJSON(KEYS.routines, next);
  }, []);

  const addRoutine = useCallback(
    async (r: Routine) => persistRoutines([r, ...routines]),
    [routines, persistRoutines],
  );
  const updateRoutine = useCallback(
    async (r: Routine) => persistRoutines(routines.map((x) => (x.id === r.id ? r : x))),
    [routines, persistRoutines],
  );
  const deleteRoutine = useCallback(
    async (id: string) => persistRoutines(routines.filter((x) => x.id !== id)),
    [routines, persistRoutines],
  );
  const duplicateRoutine = useCallback(
    async (id: string) => {
      const src = routines.find((x) => x.id === id);
      if (!src) return undefined;
      const copy: Routine = {
        ...src,
        id: uid("rt_"),
        name: `${src.name} (copia)`,
        isTemplate: false,
        createdAt: new Date().toISOString(),
        exercises: src.exercises.map((e) => ({ ...e })),
      };
      await persistRoutines([copy, ...routines]);
      return copy;
    },
    [routines, persistRoutines],
  );

  const setActive = useCallback(async (a: ActiveSession | null) => {
    setActiveState(a);
    await saveJSON(KEYS.active, a);
  }, []);

  const startWorkout = useCallback(
    (routine?: Routine) => {
      const list = routine ? routine.exercises : [];
      const session: ActiveSession = {
        routineId: routine?.id,
        routineName: routine?.name ?? "Entrenamiento libre",
        startedAt: new Date().toISOString(),
        intensityReduced,
        exercises: list.map((re) => {
          const ex = getExercise(re.exerciseId);
          const numSets = re.sets || 3;
          return {
            exerciseId: re.exerciseId,
            name: ex?.name ?? re.exerciseId,
            sets: Array.from({ length: numSets }, () => ({ weight: 0, reps: 0, done: false })),
            effort: 0,
            pain: 0,
            notes: "",
          };
        }),
      };
      setActive(session);
    },
    [getExercise, intensityReduced, setActive],
  );

  const finishWorkout = useCallback(
    async (session: WorkoutSession) => {
      const next = [session, ...history];
      setHistory(next);
      await saveJSON(KEYS.history, next);
      const painExceeded = session.maxPain > knee.painThreshold;
      if (painExceeded && knee.enabled) {
        setIntensityReduced(true);
        await storage.setItem(KEYS.reduced, true);
      }
      await setActive(null);
      return { painExceeded };
    },
    [history, knee, setActive],
  );

  const cancelWorkout = useCallback(() => {
    setActive(null);
  }, [setActive]);

  const clearIntensityReduced = useCallback(async () => {
    setIntensityReduced(false);
    await storage.setItem(KEYS.reduced, false);
  }, []);

  const updateSettings = useCallback(
    async (s: Partial<UserSettings>) => {
      const next = { ...settings, ...s };
      setSettings(next);
      await saveJSON(KEYS.settings, next);
    },
    [settings],
  );
  const updateKnee = useCallback(
    async (k: Partial<KneeSettings>) => {
      const next = { ...knee, ...k };
      setKnee(next);
      await saveJSON(KEYS.knee, next);
    },
    [knee],
  );

  const setImageOverride = useCallback(
    async (id: string, o: ImageOverride) => {
      const next = { ...images, [id]: { ...images[id], ...o } };
      setImages(next);
      await saveJSON(KEYS.images, next);
    },
    [images],
  );
  const resetImages = useCallback(async () => {
    setImages({});
    await saveJSON(KEYS.images, {});
  }, []);

  const addCustomExercises = useCallback(
    async (list: Exercise[]) => {
      const existing = new Set([...ALL_EXERCISES, ...custom].map((e) => e.id));
      const toAdd = list.filter((e) => e && e.id && !existing.has(e.id));
      const next = [...custom, ...toAdd];
      setCustom(next);
      await saveJSON(KEYS.custom, next);
      return toAdd.length;
    },
    [custom],
  );

  const exportData = useCallback(
    () => ({
      version: 1,
      exportedAt: new Date().toISOString(),
      routines,
      history,
      settings,
      knee,
      images,
      customExercises: custom,
    }),
    [routines, history, settings, knee, images, custom],
  );

  const importData = useCallback(async (data: any) => {
    if (!data || typeof data !== "object") return;
    if (Array.isArray(data.routines)) {
      setRoutines(data.routines);
      await saveJSON(KEYS.routines, data.routines);
    }
    if (Array.isArray(data.history)) {
      setHistory(data.history);
      await saveJSON(KEYS.history, data.history);
    }
    if (data.settings) {
      const s = { ...DEFAULT_SETTINGS, ...data.settings };
      setSettings(s);
      await saveJSON(KEYS.settings, s);
    }
    if (data.knee) {
      const k = { ...DEFAULT_KNEE, ...data.knee };
      setKnee(k);
      await saveJSON(KEYS.knee, k);
    }
    if (data.images) {
      setImages(data.images);
      await saveJSON(KEYS.images, data.images);
    }
    if (Array.isArray(data.customExercises)) {
      setCustom(data.customExercises);
      await saveJSON(KEYS.custom, data.customExercises);
    }
  }, []);

  const value: GymState = {
    ready,
    exercises,
    routines,
    history,
    settings,
    knee,
    images,
    active,
    intensityReduced,
    getExercise,
    safetyOf,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    startWorkout,
    setActive,
    finishWorkout,
    cancelWorkout,
    clearIntensityReduced,
    updateSettings,
    updateKnee,
    setImageOverride,
    resetImages,
    addCustomExercises,
    exportData,
    importData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGym(): GymState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
}
