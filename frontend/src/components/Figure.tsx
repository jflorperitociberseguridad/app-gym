import React from "react";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Implement } from "@/src/types";
import { Pose } from "@/src/data/poses";

const CX = 70;
const GROUND = 178;
const HIP_HALF = 11;
const UPPER = 25;
const FORE = 23;

const d2r = (d: number) => (d * Math.PI) / 180;

export interface Joints {
  head: [number, number];
  headR: number;
  neck: [number, number];
  shoulderL: [number, number];
  shoulderR: [number, number];
  elbowL: [number, number];
  elbowR: [number, number];
  handL: [number, number];
  handR: [number, number];
  hipL: [number, number];
  hipR: [number, number];
  kneeL: [number, number];
  kneeR: [number, number];
  footL: [number, number];
  footR: [number, number];
  pelvis: [number, number];
  waistL: [number, number];
  waistR: [number, number];
}

export function computeJoints(pose: Pose): Joints {
  const pelvisY = 116 + pose.squat * 26;
  const torsoLen = 46 - pose.squat * 8;
  const shoulderY = pelvisY - torsoLen;
  const shoulderHalf = 22;
  const leanX = pose.lean * 0.22;
  const shoulderL: [number, number] = [CX - shoulderHalf + leanX, shoulderY + pose.lean * 0.1];
  const shoulderR: [number, number] = [CX + shoulderHalf + leanX, shoulderY + pose.lean * 0.1];
  const neck: [number, number] = [CX + leanX, shoulderY - 4];
  const headR = 12;
  const head: [number, number] = [CX + leanX * 1.4, shoulderY - 6 - headR];

  const spread = 1 - pose.fwd * 0.55;
  const armFor = (shoulder: [number, number], sign: number) => {
    const a = d2r(pose.arm);
    const ex = shoulder[0] + sign * UPPER * Math.sin(a) * spread + sign * pose.fwd * 3;
    const ey = shoulder[1] + UPPER * Math.cos(a);
    const af = a - d2r(pose.elbow);
    const hx = ex + sign * FORE * Math.sin(af) * spread + sign * pose.fwd * 9;
    const hy = ey + FORE * Math.cos(af);
    return { elbow: [ex, ey] as [number, number], hand: [hx, hy] as [number, number] };
  };
  const L = armFor(shoulderL, -1);
  const R = armFor(shoulderR, 1);

  const pelvis: [number, number] = [CX + leanX * 0.6, pelvisY];
  const hipL: [number, number] = [pelvis[0] - HIP_HALF, pelvisY];
  const hipR: [number, number] = [pelvis[0] + HIP_HALF, pelvisY];
  const waistY = shoulderY + (pelvisY - shoulderY) * 0.55;
  const waistL: [number, number] = [CX - 13 + leanX * 0.8, waistY];
  const waistR: [number, number] = [CX + 13 + leanX * 0.8, waistY];

  const stanceX = 6 + pose.squat * 8;
  const legFor = (hip: [number, number], sign: number) => {
    let foot: [number, number] = [hip[0] + sign * stanceX, GROUND];
    let kneeOut = pose.squat * 14;
    if (pose.legLift > 0) {
      foot = [hip[0] + sign * stanceX + pose.legLift * 26, hip[1] - pose.legLift * 46];
      kneeOut = 6 + pose.legLift * 6;
    }
    const knee: [number, number] = [
      (hip[0] + foot[0]) / 2 + sign * kneeOut,
      (hip[1] + foot[1]) / 2 + pose.squat * 4 - pose.legLift * 6,
    ];
    return { knee, foot };
  };
  const legL = legFor(hipL, -1);
  const legR = legFor(hipR, 1);

  return {
    head,
    headR,
    neck,
    shoulderL,
    shoulderR,
    elbowL: L.elbow,
    elbowR: R.elbow,
    handL: L.hand,
    handR: R.hand,
    hipL,
    hipR,
    kneeL: legL.knee,
    kneeR: legR.knee,
    footL: legL.foot,
    footR: legR.foot,
    pelvis,
    waistL,
    waistR,
  };
}

function orientTransform(orient: Pose["orient"]): string | undefined {
  switch (orient) {
    case "lieBack":
      return "translate(70 104) rotate(-78) scale(0.82) translate(-70 -104)";
    case "lieFront":
      return "translate(70 104) rotate(78) scale(0.82) translate(-70 -104)";
    case "sideLie":
      return "translate(70 104) rotate(-78) scale(0.82) translate(-70 -104)";
    default:
      return undefined;
  }
}

interface PersonProps {
  pose: Pose;
  color: string;
  accent: string;
  shade?: string;
  implement?: Implement;
  opacity?: number;
}

export function Person({ pose, color, accent, shade = "#FFFFFF", implement = "none", opacity = 1 }: PersonProps) {
  const j = computeJoints(pose);

  // A limb = thick rounded base stroke (muscle tube) + a thin offset sheen for volume.
  const limb = (a: [number, number], b: [number, number], w: number, key: string) => (
    <G key={key}>
      <Line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <Line
        x1={a[0] - 1.4}
        y1={a[1] - 1.6}
        x2={b[0] - 1.4}
        y2={b[1] - 1.6}
        stroke={shade}
        strokeWidth={w * 0.34}
        strokeLinecap="round"
        opacity={0.28}
      />
    </G>
  );

  const torsoPath = `M ${j.shoulderL[0]} ${j.shoulderL[1]}
    L ${j.waistL[0]} ${j.waistL[1]}
    L ${j.hipL[0]} ${j.hipL[1] + 2}
    L ${j.hipR[0]} ${j.hipR[1] + 2}
    L ${j.waistR[0]} ${j.waistR[1]}
    L ${j.shoulderR[0]} ${j.shoulderR[1]} Z`;

  const impl = () => {
    if (implement === "barbell") {
      const dx = j.handR[0] - j.handL[0];
      const dy = j.handR[1] - j.handL[1];
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const ext = 10;
      const x1 = j.handL[0] - ux * ext;
      const y1 = j.handL[1] - uy * ext;
      const x2 = j.handR[0] + ux * ext;
      const y2 = j.handR[1] + uy * ext;
      return (
        <G>
          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={x1} cy={y1} r={6} fill={accent} />
          <Circle cx={x2} cy={y2} r={6} fill={accent} />
        </G>
      );
    }
    if (implement === "mancuerna") {
      return (
        <G>
          <Rect x={j.handL[0] - 8} y={j.handL[1] - 5} width={16} height={10} rx={3} fill={accent} />
          <Rect x={j.handR[0] - 8} y={j.handR[1] - 5} width={16} height={10} rx={3} fill={accent} />
        </G>
      );
    }
    return null;
  };

  const showGround = pose.orient === "stand" && pose.legLift === 0;

  return (
    <G transform={orientTransform(pose.orient)} opacity={opacity}>
      {showGround ? (
        <Ellipse cx={CX} cy={GROUND + 6} rx={40} ry={5} fill={color} opacity={0.1} />
      ) : null}
      {/* legs (thigh thicker than shin) */}
      {limb(j.hipL, j.kneeL, 14, "tl")}
      {limb(j.kneeL, j.footL, 11, "sl")}
      {limb(j.hipR, j.kneeR, 14, "tr")}
      {limb(j.kneeR, j.footR, 11, "sr")}
      {/* feet */}
      <Ellipse cx={j.footL[0]} cy={j.footL[1]} rx={7} ry={4} fill={color} />
      <Ellipse cx={j.footR[0]} cy={j.footR[1]} rx={7} ry={4} fill={color} />
      {/* torso with waist taper + sheen */}
      <Path d={torsoPath} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={4} />
      <Path
        d={`M ${j.shoulderL[0] + 3} ${j.shoulderL[1] + 3} L ${j.waistL[0] + 3} ${j.waistL[1]} L ${CX} ${j.waistR[1]} Z`}
        fill={shade}
        opacity={0.14}
      />
      {/* neck */}
      {limb(j.neck, j.head, 10, "neck")}
      {/* arms (upper thicker than fore) */}
      {limb(j.shoulderL, j.elbowL, 11, "ul")}
      {limb(j.elbowL, j.handL, 9, "fl")}
      {limb(j.shoulderR, j.elbowR, 11, "ur")}
      {limb(j.elbowR, j.handR, 9, "fr")}
      {/* head */}
      <Circle cx={j.head[0]} cy={j.head[1]} r={j.headR} fill={color} />
      <Circle cx={j.head[0] - 3} cy={j.head[1] - 3} r={j.headR * 0.42} fill={shade} opacity={0.2} />
      {impl()}
    </G>
  );
}

interface FigureProps {
  pose: Pose;
  color: string;
  accent: string;
  shade?: string;
  implement?: Implement;
  size?: number;
  bg?: string;
}

export function Figure({ pose, color, accent, shade, implement = "none", size = 140, bg }: FigureProps) {
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 140 200">
      {bg ? <Path d="M0 0 H140 V200 H0 Z" fill={bg} /> : null}
      <Person pose={pose} color={color} accent={accent} shade={shade} implement={implement} />
    </Svg>
  );
}
