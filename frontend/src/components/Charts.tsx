import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";

import { makeStyles, useTheme } from "@/src/theme";
import { Point, Series, shortDate } from "@/src/lib/metrics";

export function BarChart({ data, unit, height = 150 }: { data: Point[]; unit?: string; height?: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.barWrap} testID="bar-chart">
      {data.map((d, i) => {
        const h = Math.max(3, (d.value / max) * height);
        return (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barVal} numberOfLines={1}>
              {d.value}
            </Text>
            <View style={[styles.bar, { height: h, backgroundColor: d.value > 0 ? colors.brandPrimary : colors.border }]} />
            <Text style={styles.barLabel} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        );
      })}
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

export function LineChart({
  data,
  width,
  height = 160,
  color,
  unit,
}: {
  data: Series[];
  width: number;
  height?: number;
  color?: string;
  unit?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const stroke = color ?? colors.brandPrimary;
  const pad = 24;
  const w = width - pad * 2;
  const h = height - pad * 2;
  if (data.length === 0) return null;
  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const pts = data.map((d, i) => {
    const x = pad + i * stepX + (data.length === 1 ? w / 2 : 0);
    const y = pad + h - ((d.value - min) / range) * h;
    return { x, y, d };
  });
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${pts[0].x} ${pad + h} ` + pts.map((p) => `L ${p.x} ${p.y}`).join(" ") + ` L ${pts[pts.length - 1].x} ${pad + h} Z`;

  return (
    <View testID="line-chart">
      <Svg width={width} height={height}>
        <Line x1={pad} y1={pad + h} x2={width - pad} y2={pad + h} stroke={colors.border} strokeWidth={1} />
        <Path d={area} fill={stroke} opacity={0.12} />
        <Polyline points={poly} fill="none" stroke={stroke} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={stroke} />
        ))}
      </Svg>
      <View style={[styles.lineLabels, { paddingHorizontal: pad }]}>
        {data.map((d, i) => (
          <Text key={i} style={styles.barLabel}>
            {shortDate(d.date)}
          </Text>
        ))}
      </View>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  barWrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 4 },
  barCol: { flex: 1, alignItems: "center" },
  bar: { width: "72%", borderRadius: 6, minHeight: 3 },
  barVal: { fontSize: 10, color: colors.muted, marginBottom: 4, fontWeight: "700" },
  barLabel: { fontSize: 10, color: colors.muted, marginTop: 6, flex: 1, textAlign: "center" },
  unit: { position: "absolute", top: -2, right: 0, fontSize: 10, color: colors.muted },
  lineLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
}));
