import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Line, Path, Polygon } from "react-native-svg";

import { Exercise, ImageOverride } from "@/src/types";
import { resolvePose, Arrow as ArrowType } from "@/src/data/poses";
import { makeStyles, useTheme } from "@/src/theme";
import { Person } from "./Figure";
import { MuscleMap } from "./MuscleMap";

function ArrowMotif({ type, accent }: { type: ArrowType; accent: string }) {
  const head = (x: number, y: number, dir: "up" | "down" | "left" | "right") => {
    const s = 7;
    const pts =
      dir === "up"
        ? `${x},${y} ${x - s},${y + s} ${x + s},${y + s}`
        : dir === "down"
          ? `${x},${y} ${x - s},${y - s} ${x + s},${y - s}`
          : dir === "left"
            ? `${x},${y} ${x + s},${y - s} ${x + s},${y + s}`
            : `${x},${y} ${x - s},${y - s} ${x - s},${y + s}`;
    return <Polygon points={pts} fill={accent} />;
  };
  const stroke = accent;
  const w = 5;
  switch (type) {
    case "up":
      return (
        <>
          <Line x1={70} y1={130} x2={70} y2={66} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          {head(70, 58, "up")}
        </>
      );
    case "down":
      return (
        <>
          <Line x1={70} y1={70} x2={70} y2={134} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          {head(70, 142, "down")}
        </>
      );
    case "in":
      return (
        <>
          <Line x1={26} y1={100} x2={54} y2={100} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          {head(58, 100, "right")}
          <Line x1={114} y1={100} x2={86} y2={100} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          {head(82, 100, "left")}
        </>
      );
    case "out":
      return (
        <>
          <Line x1={54} y1={100} x2={26} y2={100} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          {head(22, 100, "left")}
          <Line x1={86} y1={100} x2={114} y2={100} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          {head(118, 100, "right")}
        </>
      );
    case "twist":
      return (
        <>
          <Path d="M40 96 A32 20 0 0 1 100 96" stroke={stroke} strokeWidth={w} fill="none" strokeLinecap="round" />
          {head(100, 96, "down")}
        </>
      );
    default:
      return null;
  }
}

interface Props {
  exercise: Exercise;
  override?: ImageOverride;
  width: number;
}

const PAGES = [
  { key: "main", label: "Principal" },
  { key: "start", label: "Inicio" },
  { key: "end", label: "Fin" },
  { key: "move", label: "Movimiento" },
] as const;

export function ExerciseVisual({ exercise, override, width }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [page, setPage] = useState(0);
  const cfg = resolvePose(exercise.pattern);
  const figColor = colors.onSurfaceSecondary;
  const accent = colors.brandPrimary;
  const H = Math.min(width * 0.92, 300);

  const renderFigureSvg = (children: React.ReactNode) => (
    <Svg width={width} height={H} viewBox="0 0 140 200">
      {children}
    </Svg>
  );

  const pageContent = (key: string) => {
    if (key === "main") {
      if (override?.main) return <Image source={{ uri: override.main }} style={{ width, height: H }} contentFit="contain" />;
      return (
        <MuscleMap
          view={exercise.view}
          muscles={exercise.muscles}
          color={figColor}
          accent={accent}
          faint={colors.muted}
          shade={colors.surface}
          size={H * 0.62}
        />
      );
    }
    if (key === "start") {
      if (override?.start) return <Image source={{ uri: override.start }} style={{ width, height: H }} contentFit="contain" />;
      return renderFigureSvg(<Person pose={cfg.start} color={figColor} accent={accent} shade={colors.surface} implement={exercise.implement} />);
    }
    if (key === "end") {
      if (override?.end) return <Image source={{ uri: override.end }} style={{ width, height: H }} contentFit="contain" />;
      return renderFigureSvg(<Person pose={cfg.end} color={figColor} accent={accent} shade={colors.surface} implement={exercise.implement} />);
    }
    return renderFigureSvg(
      <>
        <Person pose={cfg.start} color={colors.muted} accent={colors.muted} implement={exercise.implement} opacity={0.3} />
        <Person pose={cfg.end} color={figColor} accent={accent} shade={colors.surface} implement={exercise.implement} />
        <ArrowMotif type={cfg.arrow} accent={accent} />
      </>,
    );
  };

  return (
    <View style={styles.wrap} testID="exercise-visual">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {PAGES.map((p) => (
          <View key={p.key} style={[styles.page, { width, height: H }]}>
            {pageContent(p.key)}
            <View style={styles.labelPill}>
              <Text style={styles.labelText}>{p.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {PAGES.map((p, i) => (
          <View key={p.key} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { backgroundColor: colors.surfaceSecondary },
  page: { alignItems: "center", justifyContent: "center" },
  labelPill: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.surfaceInverse,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  labelText: { color: colors.onSurfaceInverse, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 10 },
  dot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.brandPrimary, width: 20 },
}));
