import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import {
  computeTotals,
  exerciseProgress,
  frequencyByWeek,
  loadTrend,
  painTrend,
  personalRecords,
  volumeByWeek,
} from "@/src/lib/metrics";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { BarChart, LineChart } from "@/src/components/Charts";
import { FilterChips } from "@/src/components/FilterChips";
import { Card, EmptyState, Loading } from "@/src/components/ui";

export default function Progreso() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { ready, history } = useGym();
  const width = Dimensions.get("window").width - 32 - 32; // screen - padding - card padding

  const totals = useMemo(() => computeTotals(history), [history]);
  const volume = useMemo(() => volumeByWeek(history), [history]);
  const freq = useMemo(() => frequencyByWeek(history), [history]);
  const pain = useMemo(() => painTrend(history), [history]);
  const load = useMemo(() => loadTrend(history), [history]);
  const prs = useMemo(() => personalRecords(history), [history]);

  const exOptions = useMemo(() => {
    const set = new Map<string, string>();
    history.forEach((s) => s.exercises.forEach((e) => set.set(e.exerciseId, e.name)));
    return Array.from(set.entries()).map(([key, name]) => ({ key, label: name }));
  }, [history]);
  const [selectedEx, setSelectedEx] = useState(exOptions[0]?.key ?? "");
  const exProg = useMemo(
    () => (selectedEx ? exerciseProgress(history, selectedEx) : []),
    [history, selectedEx],
  );

  if (!ready) return <Loading />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Progreso</Text>

      {history.length === 0 ? (
        <EmptyState
          icon="bar-chart-outline"
          title="Sin datos todavía"
          message="Completa tu primer entrenamiento para ver tus gráficas y récords."
        />
      ) : (
        <>
          <View style={styles.grid}>
            <Stat icon="barbell" value={`${totals.workouts}`} label="Entrenos" />
            <Stat icon="layers" value={`${totals.sets}`} label="Series" />
            <Stat icon="trending-up" value={`${(totals.volume / 1000).toFixed(1)}k`} label="Volumen kg" />
            <Stat icon="calendar" value={`${totals.daysTrained}`} label="Días" />
          </View>

          <ChartCard title="Volumen por semana" subtitle="kg totales">
            <BarChart data={volume} />
          </ChartCard>

          <ChartCard title="Frecuencia" subtitle="sesiones por semana">
            <BarChart data={freq} />
          </ChartCard>

          {pain.length > 0 ? (
            <ChartCard title="Evolución del dolor" subtitle="dolor máximo por sesión (0-10)">
              <LineChart data={pain} width={width} color={colors.error} />
            </ChartCard>
          ) : null}

          <ChartCard title="Evolución de la carga" subtitle="volumen por sesión">
            <LineChart data={load} width={width} />
          </ChartCard>

          {exOptions.length > 0 ? (
            <ChartCard title="Evolución por ejercicio" subtitle="mejor peso por sesión">
              <View style={{ marginHorizontal: -16, marginBottom: 8 }}>
                <FilterChips items={exOptions} value={selectedEx} onChange={setSelectedEx} testID="ex-progress-chips" />
              </View>
              {exProg.length > 0 ? (
                <LineChart data={exProg} width={width} />
              ) : (
                <Text style={styles.noData}>Aún no hay pesos registrados para este ejercicio.</Text>
              )}
            </ChartCard>
          ) : null}

          {prs.length > 0 ? (
            <Card>
              <Text style={styles.cardTitle}>Mejores marcas</Text>
              {prs.slice(0, 8).map((pr) => (
                <View key={pr.exerciseId} style={styles.prRow}>
                  <Ionicons name="trophy" size={18} color={colors.brandPrimary} />
                  <Text style={styles.prName} numberOfLines={1}>
                    {pr.name}
                  </Text>
                  <Text style={styles.prVal}>
                    {pr.weight} kg × {pr.reps}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Ionicons name={icon as any} size={18} color={colors.brandPrimary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <Card>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
      <View style={{ marginTop: 14 }}>{children}</View>
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 30, fontWeight: "900", color: colors.onSurface },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  stat: {
    width: (Dimensions.get("window").width - 32 - 36) / 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "900", color: colors.onSurface },
  statLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  noData: { fontSize: 13, color: colors.muted, textAlign: "center", paddingVertical: 20 },
  prRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 },
  prName: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.onSurface },
  prVal: { fontSize: 14, fontWeight: "800", color: colors.brandPrimary },
}));
