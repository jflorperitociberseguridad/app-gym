// Pose configuration for the vector Figure component.
// Each exercise "pattern" resolves to a start pose, end pose, and a movement arrow.

export type Orient = "stand" | "sit" | "lieBack" | "lieFront" | "sideLie";
export type Arrow = "up" | "down" | "in" | "out" | "twist" | "none";
export type Track = "hand" | "hip" | "knee" | "none";

export interface Pose {
  arm: number; // 0 arms down .. 90 horizontal .. 180 overhead (to the side)
  elbow: number; // 0 straight .. 150 bent
  fwd: number; // 0 arms to the side plane .. 1 arms forward
  squat: number; // 0 standing .. 1 deep
  lean: number; // torso forward lean deg 0..80
  orient: Orient;
  legLift: number; // 0..1 legs raised (lying)
}

export interface PoseConfig {
  start: Pose;
  end: Pose;
  arrow: Arrow;
  track: Track;
}

const p = (o: Partial<Pose>): Pose => ({
  arm: 0,
  elbow: 0,
  fwd: 0,
  squat: 0,
  lean: 0,
  orient: "stand",
  legLift: 0,
  ...o,
});

const c = (start: Partial<Pose>, end: Partial<Pose>, arrow: Arrow, track: Track): PoseConfig => ({
  start: p(start),
  end: p(end),
  arrow,
  track,
});

export const PATTERNS: Record<string, PoseConfig> = {
  press: c({ orient: "lieBack", arm: 90, elbow: 95, fwd: 0.4 }, { orient: "lieBack", arm: 90, elbow: 10, fwd: 0.4 }, "up", "hand"),
  "incline-press": c({ orient: "sit", arm: 100, elbow: 95, fwd: 0.4, lean: 20 }, { orient: "sit", arm: 120, elbow: 15, fwd: 0.4, lean: 20 }, "up", "hand"),
  fly: c({ orient: "lieBack", arm: 92, elbow: 25, fwd: 0.2 }, { orient: "lieBack", arm: 15, elbow: 25, fwd: 0.2 }, "in", "hand"),
  dip: c({ orient: "stand", arm: 12, elbow: 95, lean: 20 }, { orient: "stand", arm: 12, elbow: 10, lean: 20 }, "up", "hip"),
  pushup: c({ orient: "lieFront", arm: 80, elbow: 90 }, { orient: "lieFront", arm: 80, elbow: 10 }, "up", "hip"),
  pullup: c({ orient: "stand", arm: 165, elbow: 15 }, { orient: "stand", arm: 165, elbow: 130 }, "up", "hip"),
  pulldown: c({ orient: "sit", arm: 160, elbow: 10 }, { orient: "sit", arm: 150, elbow: 120 }, "down", "hand"),
  "row-bent": c({ orient: "stand", arm: 30, elbow: 15, fwd: 0.6, lean: 65 }, { orient: "stand", arm: 30, elbow: 110, fwd: 0.6, lean: 65 }, "up", "hand"),
  row: c({ orient: "sit", arm: 25, elbow: 15, fwd: 0.8 }, { orient: "sit", arm: 25, elbow: 110, fwd: 0.8 }, "in", "hand"),
  hyperext: c({ orient: "stand", arm: 8, elbow: 5, lean: 70 }, { orient: "stand", arm: 8, elbow: 5, lean: 5 }, "up", "hip"),
  pullover: c({ orient: "lieBack", arm: 170, elbow: 15, fwd: 0.3 }, { orient: "lieBack", arm: 95, elbow: 15, fwd: 0.3 }, "in", "hand"),
  ohp: c({ orient: "stand", arm: 100, elbow: 95, fwd: 0.3 }, { orient: "stand", arm: 165, elbow: 12, fwd: 0.2 }, "up", "hand"),
  "lateral-raise": c({ orient: "stand", arm: 8, elbow: 12 }, { orient: "stand", arm: 88, elbow: 12 }, "out", "hand"),
  "front-raise": c({ orient: "stand", arm: 8, elbow: 8, fwd: 1 }, { orient: "stand", arm: 82, elbow: 8, fwd: 1 }, "up", "hand"),
  "rear-delt": c({ orient: "stand", arm: 20, elbow: 20, lean: 55 }, { orient: "stand", arm: 90, elbow: 20, lean: 55 }, "out", "hand"),
  shrug: c({ orient: "stand", arm: 6, elbow: 5 }, { orient: "stand", arm: 6, elbow: 5, squat: -0.05 }, "up", "none"),
  curl: c({ orient: "stand", arm: 14, elbow: 10, fwd: 0.5 }, { orient: "stand", arm: 20, elbow: 140, fwd: 0.6 }, "up", "hand"),
  "hammer-curl": c({ orient: "stand", arm: 14, elbow: 10, fwd: 0.5 }, { orient: "stand", arm: 20, elbow: 138, fwd: 0.6 }, "up", "hand"),
  "triceps-pushdown": c({ orient: "stand", arm: 22, elbow: 120, fwd: 0.5 }, { orient: "stand", arm: 18, elbow: 8, fwd: 0.4 }, "down", "hand"),
  "overhead-ext": c({ orient: "stand", arm: 168, elbow: 130 }, { orient: "stand", arm: 168, elbow: 10 }, "up", "hand"),
  "bench-dip": c({ orient: "sit", arm: 12, elbow: 95, lean: 5 }, { orient: "sit", arm: 12, elbow: 8, lean: 5 }, "up", "hip"),
  crunch: c({ orient: "lieBack", arm: 40, elbow: 90, squat: 0.6 }, { orient: "lieBack", arm: 40, elbow: 90, squat: 0.6, lean: 35 }, "up", "none"),
  "leg-raise": c({ orient: "lieBack", arm: 6, elbow: 5, legLift: 0 }, { orient: "lieBack", arm: 6, elbow: 5, legLift: 1 }, "up", "knee"),
  "russian-twist": c({ orient: "sit", arm: 40, elbow: 90, fwd: 1, lean: 30 }, { orient: "sit", arm: 40, elbow: 90, fwd: 1, lean: 30 }, "twist", "hand"),
  plank: c({ orient: "lieFront", arm: 70, elbow: 90 }, { orient: "lieFront", arm: 70, elbow: 90 }, "none", "none"),
  "side-plank": c({ orient: "sideLie", arm: 70, elbow: 90 }, { orient: "sideLie", arm: 70, elbow: 90 }, "none", "none"),
  bicycle: c({ orient: "lieBack", arm: 40, elbow: 100, legLift: 0.5 }, { orient: "lieBack", arm: 40, elbow: 100, legLift: 0.7 }, "twist", "knee"),
  "dead-bug": c({ orient: "lieBack", arm: 150, elbow: 10, legLift: 0.6 }, { orient: "lieBack", arm: 120, elbow: 10, legLift: 0.3 }, "none", "none"),
  "mountain-climber": c({ orient: "lieFront", arm: 80, elbow: 10 }, { orient: "lieFront", arm: 80, elbow: 10, legLift: 0.4 }, "in", "knee"),
  "bird-dog": c({ orient: "lieFront", arm: 90, elbow: 10 }, { orient: "lieFront", arm: 150, elbow: 5, legLift: 0.5 }, "none", "none"),
  "glute-bridge": c({ orient: "lieBack", arm: 8, elbow: 5, squat: 0.6 }, { orient: "lieBack", arm: 8, elbow: 5, squat: 0.6, legLift: 0.2 }, "up", "hip"),
  "hip-thrust": c({ orient: "lieBack", arm: 8, elbow: 5, squat: 0.6 }, { orient: "lieBack", arm: 8, elbow: 5, squat: 0.6, legLift: 0.25 }, "up", "hip"),
  "glute-kickback": c({ orient: "lieFront", arm: 80, elbow: 10 }, { orient: "lieFront", arm: 80, elbow: 10, legLift: 0.6 }, "up", "knee"),
  "hip-abduction": c({ orient: "stand", arm: 10, elbow: 8, squat: 0.35 }, { orient: "stand", arm: 10, elbow: 8, squat: 0.35 }, "out", "knee"),
  lunge: c({ orient: "stand", arm: 8, elbow: 8, squat: 0.2 }, { orient: "stand", arm: 8, elbow: 8, squat: 0.75, lean: 8 }, "down", "hip"),
  "step-up": c({ orient: "stand", arm: 8, elbow: 8 }, { orient: "stand", arm: 8, elbow: 8, squat: 0.4 }, "up", "hip"),
  squat: c({ orient: "stand", arm: 30, elbow: 120 }, { orient: "stand", arm: 30, elbow: 120, squat: 0.85, lean: 15 }, "down", "hip"),
  "goblet-squat": c({ orient: "stand", arm: 30, elbow: 130, fwd: 1 }, { orient: "stand", arm: 30, elbow: 130, fwd: 1, squat: 0.8, lean: 10 }, "down", "hip"),
  "leg-press": c({ orient: "sit", arm: 8, elbow: 5, squat: 0.8, legLift: 0.5 }, { orient: "sit", arm: 8, elbow: 5, squat: 0.2, legLift: 0.5 }, "up", "knee"),
  "leg-extension": c({ orient: "sit", arm: 8, elbow: 5, legLift: 0 }, { orient: "sit", arm: 8, elbow: 5, legLift: 0.8 }, "up", "knee"),
  "leg-curl": c({ orient: "lieFront", arm: 8, elbow: 5, legLift: 0 }, { orient: "lieFront", arm: 8, elbow: 5, legLift: 0.7 }, "up", "knee"),
  "calf-raise": c({ orient: "stand", arm: 8, elbow: 5 }, { orient: "stand", arm: 8, elbow: 5, squat: -0.12 }, "up", "hip"),
  deadlift: c({ orient: "stand", arm: 10, elbow: 5, lean: 60, squat: 0.4 }, { orient: "stand", arm: 10, elbow: 5, lean: 5 }, "up", "hip"),
  "wall-sit": c({ orient: "stand", arm: 40, elbow: 90, squat: 0.7 }, { orient: "stand", arm: 40, elbow: 90, squat: 0.7 }, "none", "none"),
  "mobility-stand": c({ orient: "stand", arm: 30, elbow: 20 }, { orient: "stand", arm: 90, elbow: 20 }, "twist", "none"),
  "mobility-floor": c({ orient: "lieFront", arm: 90, elbow: 20 }, { orient: "lieFront", arm: 90, elbow: 20, lean: 20 }, "twist", "none"),
  "cardio-walk": c({ orient: "stand", arm: 25, elbow: 70, legLift: 0.15 }, { orient: "stand", arm: 25, elbow: 70, legLift: 0.15 }, "none", "none"),
  "cardio-bike": c({ orient: "sit", arm: 30, elbow: 60, legLift: 0.4 }, { orient: "sit", arm: 30, elbow: 60, legLift: 0.4 }, "none", "none"),
  "cardio-row": c({ orient: "sit", arm: 25, elbow: 20, fwd: 0.8, legLift: 0.3 }, { orient: "sit", arm: 25, elbow: 110, fwd: 0.8 }, "in", "hand"),
  "stretch-stand": c({ orient: "stand", arm: 30, elbow: 120 }, { orient: "stand", arm: 30, elbow: 120 }, "none", "none"),
  "stretch-floor": c({ orient: "sit", arm: 60, elbow: 20, lean: 40 }, { orient: "sit", arm: 60, elbow: 20, lean: 40 }, "none", "none"),
};

export function resolvePose(pattern: string): PoseConfig {
  return PATTERNS[pattern] ?? PATTERNS.squat;
}
