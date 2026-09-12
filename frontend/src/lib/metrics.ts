import { WorkoutSession } from "@/src/types";

const DAY = 86400000;

function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // 0 = Monday
  return new Date(x.getTime() - dow * DAY);
}

export interface Point {
  label: string;
  value: number;
}

export function weeklyBuckets(
  history: WorkoutSession[],
  weeks: number,
  metric: (s: WorkoutSession) => number,
  reducer: "sum" | "count" = "sum",
): Point[] {
  const thisMonday = mondayOf(new Date());
  const out: Point[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMonday.getTime() - i * 7 * DAY);
    const end = new Date(start.getTime() + 7 * DAY);
    const inWeek = history.filter((s) => {
      const t = new Date(s.date).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    const value =
      reducer === "count" ? inWeek.length : inWeek.reduce((a, s) => a + metric(s), 0);
    const label = `${start.getDate()}/${start.getMonth() + 1}`;
    out.push({ label, value: Math.round(value) });
  }
  return out;
}

export function volumeByWeek(history: WorkoutSession[], weeks = 8): Point[] {
  return weeklyBuckets(history, weeks, (s) => s.totalVolume);
}

export function frequencyByWeek(history: WorkoutSession[], weeks = 8): Point[] {
  return weeklyBuckets(history, weeks, () => 1, "count");
}

export interface Series {
  date: string;
  value: number;
}

export function painTrend(history: WorkoutSession[], n = 10): Series[] {
  return [...history]
    .slice(0, n)
    .reverse()
    .map((s) => ({ date: s.date, value: s.maxPain }));
}

export function loadTrend(history: WorkoutSession[], n = 10): Series[] {
  return [...history]
    .slice(0, n)
    .reverse()
    .map((s) => ({ date: s.date, value: Math.round(s.totalVolume) }));
}

export function exerciseProgress(history: WorkoutSession[], exerciseId: string): Series[] {
  const out: Series[] = [];
  [...history].reverse().forEach((s) => {
    const log = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (!log) return;
    const best = Math.max(0, ...log.sets.filter((x) => x.done).map((x) => x.weight));
    if (best > 0) out.push({ date: s.date, value: best });
  });
  return out;
}

export interface PR {
  exerciseId: string;
  name: string;
  weight: number;
  reps: number;
}

export function personalRecords(history: WorkoutSession[]): PR[] {
  const map: Record<string, PR> = {};
  history.forEach((s) =>
    s.exercises.forEach((e) => {
      e.sets.forEach((set) => {
        if (!set.done || set.weight <= 0) return;
        const cur = map[e.exerciseId];
        if (!cur || set.weight > cur.weight) {
          map[e.exerciseId] = { exerciseId: e.exerciseId, name: e.name, weight: set.weight, reps: set.reps };
        }
      });
    }),
  );
  return Object.values(map).sort((a, b) => b.weight - a.weight);
}

export interface Totals {
  workouts: number;
  volume: number;
  sets: number;
  daysTrained: number;
  thisWeek: number;
  streak: number;
}

export function computeTotals(history: WorkoutSession[]): Totals {
  const workouts = history.length;
  const volume = Math.round(history.reduce((a, s) => a + s.totalVolume, 0));
  const sets = history.reduce((a, s) => a + s.totalSets, 0);
  const days = new Set(history.map((s) => new Date(s.date).toDateString()));
  const thisMonday = mondayOf(new Date()).getTime();
  const thisWeek = history.filter((s) => new Date(s.date).getTime() >= thisMonday).length;

  // day streak ending today or yesterday
  let streak = 0;
  const today = new Date(new Date().toDateString()).getTime();
  for (let i = 0; i < 400; i++) {
    const d = new Date(today - i * DAY).toDateString();
    if (days.has(d)) streak++;
    else if (i === 0) continue; // allow today empty, keep counting from yesterday
    else break;
  }
  return { workouts, volume, sets, daysTrained: days.size, thisWeek, streak };
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
