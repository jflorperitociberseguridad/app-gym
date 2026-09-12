import React, { useMemo } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { computeTotals, formatDuration, shortDate } from "@/src/lib/metrics";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { Btn, Card, Loading } from "@/src/components/ui";

const HERO =
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

export default function Dashboard() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ready, settings, history, knee, routines, intensityReduced, startWorkout } = useGym();

  const totals = useMemo(() => computeTotals(history), [history]);
  const suggested = useMemo(() => {
    if (knee.enabled) {
      return routines.find((r) => r.id === "rutina-pierna-protegida") ?? routines[0];
    }
    return routines[0];
  }, [routines, knee.enabled]);

  if (!ready) return <Loading />;

  const start = () => {
    if (suggested) {
      startWorkout(suggested);
      router.push("/workout/active");
    } else {
      router.push("/rutinas");
    }
  };

  const stats = [
    { icon: "flame", label: "Racha", value: `${totals.streak}`, unit: "días" },
    { icon: "calendar", label: "Esta semana", value: `${totals.thisWeek}/${settings.weeklyGoal}`, unit: "sesiones" },
    { icon: "barbell", label: "Entrenos", value: `${totals.workouts}`, unit: "total" },
    { icon: "trending-up", label: "Volumen", value: `${(totals.volume / 1000).toFixed(1)}k`, unit: "kg total" },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.hero}>
        <Image source={{ uri: HERO }} style={styles.heroImg} contentFit="cover" />
        <LinearGradient
          colors={["rgba(17,17,17,0.1)", "rgba(17,17,17,0.85)"]}
          style={styles.heroScrim}
        />
        <View style={[styles.heroContent, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.heroHi}>Hola, {settings.name}</Text>
          <Text style={styles.heroTitle}>Listo para entrenar</Text>
          {knee.enabled ? (
            <View style={styles.kneeChip}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.kneeChipText}>Rodilla protegida · {knee.side}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.pad}>
        {intensityReduced ? (
          <Pressable
            testID="intensity-banner"
            onPress={() => router.push("/ajustes/rodilla")}
            style={[styles.banner, { backgroundColor: colors.warning }]}
          >
            <Ionicons name="alert-circle" size={22} color={colors.onWarning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.onWarning }]}>Intensidad reducida</Text>
              <Text style={[styles.bannerMsg, { color: colors.onWarning }]}>
                El dolor superó tu umbral. La próxima sesión reduce la carga.
              </Text>
            </View>
          </Pressable>
        ) : null}

        {/* Suggested routine */}
        {suggested ? (
          <Card style={styles.today}>
            <Text style={styles.todayLabel}>SUGERIDO HOY</Text>
            <Text style={styles.todayName}>{suggested.name}</Text>
            <Text style={styles.todayDesc}>{suggested.exercises.length} ejercicios · {suggested.description}</Text>
            <Btn title="Comenzar entrenamiento" icon="play" onPress={start} testID="start-workout-btn" style={{ marginTop: 14 }} />
          </Card>
        ) : null}

        {/* Bento stats */}
        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name={s.icon as any} size={18} color={colors.brandPrimary} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statUnit}>{s.unit}</Text>
            </View>
          ))}
        </View>

        {/* Recent */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Historial reciente</Text>
          <Pressable onPress={() => router.push("/progreso")} testID="see-progress">
            <Text style={styles.link}>Ver progreso</Text>
          </Pressable>
        </View>
        {history.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Aún no has entrenado. ¡Empieza tu primera rutina hoy!</Text>
          </Card>
        ) : (
          history.slice(0, 4).map((s) => (
            <Card key={s.id} style={styles.histRow}>
              <View style={styles.histIcon}>
                <Ionicons name="checkmark-done" size={20} color={colors.brandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histName}>{s.routineName}</Text>
                <Text style={styles.histMeta}>
                  {shortDate(s.date)} · {formatDuration(s.durationSec)} · {Math.round(s.totalVolume)} kg
                </Text>
              </View>
              {s.maxPain > 0 ? (
                <View style={[styles.painPill, { backgroundColor: s.maxPain > knee.painThreshold ? colors.error : colors.surfaceTertiary }]}>
                  <Text style={[styles.painText, { color: s.maxPain > knee.painThreshold ? colors.onError : colors.muted }]}>
                    Dolor {s.maxPain}
                  </Text>
                </View>
              ) : null}
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 260, justifyContent: "flex-end" },
  heroImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroScrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: { padding: 20 },
  heroHi: { color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: "600" },
  heroTitle: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", marginTop: 2 },
  kneeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
  },
  kneeChipText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  pad: { padding: 16, gap: 16 },
  banner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.md },
  bannerTitle: { fontSize: 15, fontWeight: "800" },
  bannerMsg: { fontSize: 13, marginTop: 2 },
  today: { backgroundColor: colors.surfaceInverse, borderColor: colors.surfaceInverse },
  todayLabel: { color: colors.brandSecondary, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  todayName: { color: colors.onSurfaceInverse, fontSize: 24, fontWeight: "900", marginTop: 4 },
  todayDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  statCard: {
    width: (Dimensions.get("window").width - 32 - 12) / 2,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 26, fontWeight: "900", color: colors.onSurface },
  statLabel: { fontSize: 14, fontWeight: "700", color: colors.onSurface, marginTop: 2 },
  statUnit: { fontSize: 12, color: colors.muted },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  link: { color: colors.brandPrimary, fontSize: 14, fontWeight: "700" },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 8 },
  histRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  histIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  histName: { fontSize: 15, fontWeight: "800", color: colors.onSurface },
  histMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  painPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  painText: { fontSize: 12, fontWeight: "700" },
}));
