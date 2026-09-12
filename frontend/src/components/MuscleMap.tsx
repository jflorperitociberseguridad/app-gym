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
  quads: [[51, 156, 8, 22], [69, 156, 8, 22]],
  calves: [[49, 204, 6, 14], [71, 204, 6, 14]],
  glutes: [[51, 156, 8, 22], [69, 156, 8, 22]],
  hamstrings: [[51, 156, 8, 22], [69, 156, 8, 22]],
};

const REGION_BACK: Record<string, E[]> = {
  traps: [[60, 58, 14, 9]],
  rearDelts: [[38, 58, 9, 8], [82, 58, 9, 8]],
  upperBack: [[60, 76, 18, 12]],
  lats: [[48, 94, 8, 16], [72, 94, 8, 16]],
  triceps: [[32, 84, 6, 12], [88, 84, 6, 12]],
  lowerBack: [[60, 112, 12, 12]],
  glutes: [[51, 140, 10, 11], [69, 140, 10, 11]],
  hamstrings: [[51, 168, 8, 20], [69, 168, 8, 20]],
  calves: [[49, 204, 6, 14], [71, 204, 6, 14]],
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
  shade?: string;
  size?: number;
}

export function MuscleMap({ view, muscles, color, accent, faint, shade = "#FFFFFF", size = 150 }: Props) {
  const dict = view === "front" ? REGION_FRONT : REGION_BACK;
  const active = new Set(muscles);

  const limb = (a: [number, number], b: [number, number], w: number, key: string) => (
    <Line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );

  // Torso with V-taper (wide shoulders -> narrow waist -> hips)
  const torso =
    "M36 54 L47 118 L46 140 L74 140 L73 118 L84 54 Q60 46 36 54 Z";

  return (
    <Svg width={size} height={size * 1.75} viewBox="0 0 120 240">
      {/* head + neck */}
      <Circle cx={60} cy={24} r={15} fill={color} />
      {limb([60, 38], [60, 52], 12, "neck")}
      {/* torso */}
      <Path d={torso} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M40 56 L48 116 L60 116 Z" fill={shade} opacity={0.12} />
      {/* arms */}
      {limb([40, 56], [30, 98], 13, "ul")}
      {limb([30, 98], [26, 140], 10, "fl")}
      {limb([80, 56], [90, 98], 13, "ur")}
      {limb([90, 98], [94, 140], 10, "fr")}
      <Circle cx={26} cy={142} r={5} fill={color} />
      <Circle cx={94} cy={142} r={5} fill={color} />
      {/* legs */}
      {limb([51, 138], [49, 186], 17, "thl")}
      {limb([49, 186], [48, 226], 13, "shl")}
      {limb([69, 138], [71, 186], 17, "thr")}
      {limb([71, 186], [72, 226], 13, "shr")}
      <Ellipse cx={47} cy={228} rx={8} ry={4} fill={color} />
      <Ellipse cx={73} cy={228} rx={8} ry={4} fill={color} />
      {/* muscle overlays */}
      <G>
        {Object.entries(dict).map(([key, ellipses]) => {
          const isActive = active.has(key);
          return ellipses.map((e, i) => (
            <G key={`${key}-${i}`}>
              {isActive ? <Ellipse cx={e[0]} cy={e[1]} rx={e[2] + 3} ry={e[3] + 3} fill={accent} opacity={0.22} /> : null}
              <Ellipse cx={e[0]} cy={e[1]} rx={e[2]} ry={e[3]} fill={isActive ? accent : faint} opacity={isActive ? 0.95 : 0.22} />
            </G>
          ));
        })}
      </G>
    </Svg>
  );
}
