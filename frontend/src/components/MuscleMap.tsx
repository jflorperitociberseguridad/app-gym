import React from "react";
import Svg, { Circle, Ellipse, G, Line, Path } from "react-native-svg";

import { BodyView } from "@/src/types";

type E = [number, number, number, number]; // cx, cy, rx, ry

const REGION_FRONT: Record<string, E[]> = {
  frontDelts: [[38, 58, 9, 8], [82, 58, 9, 8]],
  sideDelts: [[34, 56, 7, 7], [86, 56, 7, 7]],
  pecho: [[50, 72, 11, 9], [70, 72, 11, 9]],
  abs: [[60, 100, 10, 17]],
  core: [[60, 100, 10, 17]],
  obliques: [[47, 100, 5, 14], [73, 100, 5, 14]],
  biceps: [[32, 84, 6, 12], [88, 84, 6, 12]],
  forearms: [[27, 120, 6, 12], [93, 120, 6, 12]],
  quads: [[50, 152, 8, 20], [70, 152, 8, 20]],
  calves: [[46, 200, 6, 14], [74, 200, 6, 14]],
  glutes: [[50, 152, 8, 20], [70, 152, 8, 20]],
  hamstrings: [[50, 152, 8, 20], [70, 152, 8, 20]],
};

const REGION_BACK: Record<string, E[]> = {
  traps: [[60, 58, 14, 9]],
  rearDelts: [[38, 58, 9, 8], [82, 58, 9, 8]],
  upperBack: [[60, 76, 18, 12]],
  lats: [[48, 94, 8, 16], [72, 94, 8, 16]],
  triceps: [[32, 84, 6, 12], [88, 84, 6, 12]],
  lowerBack: [[60, 112, 12, 12]],
  glutes: [[50, 134, 10, 10], [70, 134, 10, 10]],
  hamstrings: [[50, 160, 8, 18], [70, 160, 8, 18]],
  calves: [[46, 200, 6, 14], [74, 200, 6, 14]],
  core: [[60, 112, 12, 12]],
  pecho: [[60, 76, 18, 10]],
  frontDelts: [[38, 58, 9, 8], [82, 58, 9, 8]],
  sideDelts: [[34, 56, 7, 7], [86, 56, 7, 7]],
};

interface Props {
  view: BodyView;
  muscles: string[];
  color: string; // body silhouette
  accent: string; // highlight
  faint: string; // non-highlighted region
  size?: number;
}

export function MuscleMap({ view, muscles, color, accent, faint, size = 150 }: Props) {
  const dict = view === "front" ? REGION_FRONT : REGION_BACK;
  const active = new Set(muscles);
  const lw = 11;
  const seg = (x1: number, y1: number, x2: number, y2: number) => (
    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={lw} strokeLinecap="round" />
  );

  return (
    <Svg width={size} height={size * 1.7} viewBox="0 0 120 240">
      {/* silhouette */}
      <Circle cx={60} cy={24} r={14} fill={color} />
      <Path d="M40 52 L80 52 L74 120 L46 120 Z" fill={color} />
      {/* arms */}
      {seg(40, 56, 30, 96)}
      {seg(30, 96, 26, 138)}
      {seg(80, 56, 90, 96)}
      {seg(90, 96, 94, 138)}
      {/* hips */}
      <Path d="M44 116 L76 116 L74 132 L46 132 Z" fill={color} />
      {/* legs */}
      {seg(50, 126, 47, 176)}
      {seg(47, 176, 47, 224)}
      {seg(70, 126, 73, 176)}
      {seg(73, 176, 73, 224)}
      {/* region overlays */}
      <G>
        {Object.entries(dict).map(([key, ellipses]) =>
          ellipses.map((e, i) => (
            <Ellipse
              key={`${key}-${i}`}
              cx={e[0]}
              cy={e[1]}
              rx={e[2]}
              ry={e[3]}
              fill={active.has(key) ? accent : faint}
              opacity={active.has(key) ? 0.95 : 0.28}
            />
          )),
        )}
      </G>
    </Svg>
  );
}
