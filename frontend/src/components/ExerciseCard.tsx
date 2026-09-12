import React from "react";
import { Pressable, Text, View } from "react-native";

import { Exercise, KneeSafety } from "@/src/types";
import { GROUP_LABEL } from "@/src/data/exercises";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { MuscleMap } from "./MuscleMap";
import { KneeBadge } from "./ui";

export function ExerciseCard({
  exercise,
  safety,
  onPress,
}: {
  exercise: Exercise;
  safety: KneeSafety;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      testID={`exercise-card-${exercise.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.thumb}>
        <MuscleMap
          view={exercise.view}
          muscles={exercise.muscles}
          color={colors.onSurfaceSecondary}
          accent={colors.brandPrimary}
          faint={colors.muted}
          shade={colors.surface}
          size={40}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {GROUP_LABEL[exercise.group]} · {exercise.equipment}
        </Text>
        <View style={styles.row}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>{exercise.level}</Text>
          </View>
          {safety !== "permitido" ? <KneeBadge safety={safety} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  body: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  meta: { fontSize: 13, color: colors.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  levelPill: {
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  levelText: { fontSize: 11, fontWeight: "700", color: colors.onSurfaceTertiary, textTransform: "capitalize" },
}));
