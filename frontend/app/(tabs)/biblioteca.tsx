import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { GROUPS } from "@/src/data/exercises";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { ExerciseCard } from "@/src/components/ExerciseCard";
import { ChipItem, FilterChips } from "@/src/components/FilterChips";
import { EmptyState, Loading } from "@/src/components/ui";

export default function Biblioteca() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ready, exercises, knee, safetyOf } = useGym();

  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("todos");
  const [onlyAllowed, setOnlyAllowed] = useState(false);

  const chips: ChipItem[] = useMemo(
    () => [{ key: "todos", label: "Todos" }, ...GROUPS.map((g) => ({ key: g.key, label: g.label }))],
    [],
  );

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (group !== "todos" && e.group !== group) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (onlyAllowed && safetyOf(e) === "bloqueado") return false;
      return true;
    });
  }, [exercises, query, group, onlyAllowed, safetyOf]);

  if (!ready) return <Loading />;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Biblioteca</Text>
        <Text style={styles.subtitle}>{exercises.length} ejercicios con diagramas</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="library-search"
            placeholder="Buscar ejercicio..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <View style={{ marginHorizontal: -16 }}>
          <FilterChips items={chips} value={group} onChange={setGroup} testID="group-chips" />
        </View>
        {knee.enabled ? (
          <Pressable
            testID="only-allowed-toggle"
            onPress={() => setOnlyAllowed((v) => !v)}
            style={[styles.allowedToggle, onlyAllowed && styles.allowedToggleOn]}
          >
            <Ionicons
              name={onlyAllowed ? "shield-checkmark" : "shield-outline"}
              size={15}
              color={onlyAllowed ? colors.onBrandPrimary : colors.muted}
            />
            <Text style={[styles.allowedText, onlyAllowed && { color: colors.onBrandPrimary }]}>
              Ocultar bloqueados por rodilla
            </Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={data}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            safety={safetyOf(item)}
            onPress={() => router.push(`/exercise/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="search" title="Sin resultados" message="Ningún ejercicio coincide con los filtros seleccionados." />
        }
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  title: { fontSize: 30, fontWeight: "900", color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: -4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 46,
    marginHorizontal: 0,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.onSurface },
  allowedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surfaceTertiary,
  },
  allowedToggleOn: { backgroundColor: colors.brandPrimary },
  allowedText: { fontSize: 12, fontWeight: "700", color: colors.muted },
}));

// FilterChips has its own horizontal padding; neutralize header padding for it.
