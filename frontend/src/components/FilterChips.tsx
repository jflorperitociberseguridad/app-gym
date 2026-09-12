import React from "react";
import { Pressable, ScrollView, Text } from "react-native";

import { makeStyles } from "@/src/theme";

export interface ChipItem {
  key: string;
  label: string;
}

export function FilterChips({
  items,
  value,
  onChange,
  testID,
}: {
  items: ChipItem[];
  value: string;
  onChange: (key: string) => void;
  testID?: string;
}) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
      testID={testID}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            testID={`chip-${item.key}`}
            onPress={() => onChange(item.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { maxHeight: 56 },
  row: { gap: 8, paddingHorizontal: 16, alignItems: "center", height: 56 },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: { backgroundColor: colors.surfaceInverse, borderColor: colors.surfaceInverse },
  chipText: { fontSize: 14, fontWeight: "700", color: colors.onSurfaceTertiary },
  chipTextActive: { color: colors.onSurfaceInverse },
}));
