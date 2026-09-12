import React from "react";
import Svg, { Circle, G, Line, Path } from "react-native-svg";

import { Implement } from "@/src/types";
import { Pose } from "@/src/data/poses";

const CX = 70;
const GROUND = 178;
const HIP_HALF = 10;
const UPPER = 24;
const FORE = 22;

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
}

export function computeJoints(pose: Pose): Joints {
  const pelvisY = 116 + pose.squat * 26;
  const torsoLen = 44 - pose.squat * 8;
  const shoulderY = pelvisY - torsoLen;
  const shoulderHalf = 20;
  const leanX = pose.lean * 0.22;
  const shoulderL: [number, number] = [CX - shoulderHalf + leanX, shoulderY + pose.lean * 0.1];
  const shoulderR: [number, number] = [CX + shoulderHalf + leanX, shoulderY + pose.lean * 0.1];
  const neck: [number, number] = [CX + leanX, shoulderY - 5];
  const headR = 11;
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
  implement?: Implement;
  opacity?: number;
}

export function Person({ pose, color, accent, implement = "none", opacity = 1 }: PersonProps) {
  const j = computeJoints(pose);
  const lw = 8.5;
  const torsoPath = `M ${j.shoulderL[0]} ${j.shoulderL[1]} L ${j.shoulderR[0]} ${j.shoulderR[1]} L ${j.hipR[0]} ${j.hipR[1]} L ${j.hipL[0]} ${j.hipL[1]} Z`;
  const line = (a: [number, number], b: [number, number], w = lw) => (
    <Line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );

  const impl = () => {
    if (implement === "barbell") {
      return (
        <>
          <Line x1={j.handL[0]} y1={j.handL[1]} x2={j.handR[0]} y2={j.handR[1]} stroke={accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={j.handL[0]} cy={j.handL[1]} r={5} fill={accent} />
          <Circle cx={j.handR[0]} cy={j.handR[1]} r={5} fill={accent} />
        </>
      );
    }
    if (implement === "mancuerna") {
      return (
        <>
          <Circle cx={j.handL[0]} cy={j.handL[1]} r={5} fill={accent} />
          <Circle cx={j.handR[0]} cy={j.handR[1]} r={5} fill={accent} />
        </>
      );
    }
    return null;
  };

  return (
    <G transform={orientTransform(pose.orient)} opacity={opacity}>
      {/* legs */}
      {line(j.hipL, j.kneeL)}
      {line(j.kneeL, j.footL)}
      {line(j.hipR, j.kneeR)}
      {line(j.kneeR, j.footR)}
      {/* torso */}
      <Path d={torsoPath} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* arms */}
      {line(j.shoulderL, j.elbowL)}
      {line(j.elbowL, j.handL)}
      {line(j.shoulderR, j.elbowR)}
      {line(j.elbowR, j.handR)}
      {/* head */}
      <Circle cx={j.head[0]} cy={j.head[1]} r={j.headR} fill={color} />
      {impl()}
    </G>
  );
}

interface FigureProps {
  pose: Pose;
  color: string;
  accent: string;
  implement?: Implement;
  size?: number;
  bg?: string;
}

export function Figure({ pose, color, accent, implement = "none", size = 140, bg }: FigureProps) {
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 140 200">
      {bg ? <Path d="M0 0 H140 V200 H0 Z" fill={bg} /> : null}
      <Person pose={pose} color={color} accent={accent} implement={implement} />
    </Svg>
  );
}
