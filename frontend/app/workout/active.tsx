import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym, uid } from "@/src/store/GymStore";
import { ExerciseLog, WorkoutSession } from "@/src/types";
import { formatDuration } from "@/src/lib/metrics";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { Btn, Loading, Sheet, Stepper } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";

export default function ActiveWorkout() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { ready, active, history, knee, getExercise, finishWorkout, cancelWorkout } = useGym();

  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<{ remaining: number; total: number } | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const startRef = useRef<number>(Date.now());
  const initialized = useRef(false);

  // init from active + prefill from history
  useEffect(() => {
    if (!active || initialized.current) return;
    initialized.current = true;
    startRef.current = new Date(active.startedAt).getTime();
    const prefilled = active.exercises.map((log) => {
      const prev = history.find((s) => s.exercises.some((e) => e.exerciseId === log.exerciseId));
      const prevLog = prev?.exercises.find((e) => e.exerciseId === log.exerciseId);
      return {
        ...log,
        sets: log.sets.map((set, i) => {
          const ref = prevLog?.sets[i] ?? prevLog?.sets[prevLog.sets.length - 1];
          let weight = ref?.weight ?? 0;
          if (active.intensityReduced) weight = Math.round(weight * 0.9);
          return { ...set, weight, reps: ref?.reps ?? 0 };
        }),
      };
    });
    setLogs(prefilled);
  }, [active, history]);

  // elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // rest countdown
  useEffect(() => {
    if (!rest) return;
    if (rest.remaining <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show("¡Descanso terminado!", "success");
      setRest(null);
      return;
    }
    const t = setTimeout(() => setRest((r) => (r ? { ...r, remaining: r.remaining - 1 } : null)), 1000);
    return () => clearTimeout(t);
  }, [rest, toast]);

  const done = useMemo(
    () => logs.reduce((a, l) => a + l.sets.filter((s) => s.done).length, 0),
    [logs],
  );
  const totalSets = useMemo(() => logs.reduce((a, l) => a + l.sets.length, 0), [logs]);

  if (!ready) return <Loading />;
  if (!active) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={styles.emptyTitle}>No hay entrenamiento activo</Text>
        <Btn title="Volver" onPress={() => router.replace("/(tabs)")} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const setField = (ei: number, si: number, field: "weight" | "reps", value: number) =>
    setLogs((prev) =>
      prev.map((l, i) =>
        i === ei ? { ...l, sets: l.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s)) } : l,
      ),
    );

  const toggleDone = (ei: number, si: number) => {
    const log = logs[ei];
    const ex = getExercise(log.exerciseId);
    const set = log.sets[si];
    const willBeDone = !set.done;
    if (willBeDone && knee.enabled && ex && (ex.deepKnee || ex.kneeSafety !== "permitido") && set.weight > knee.maxWeightKg) {
      toast.show(`Supera tu peso máximo de rodilla (${knee.maxWeightKg} kg)`, "warning");
    }
    setLogs((prev) =>
      prev.map((l, i) =>
        i === ei ? { ...l, sets: l.sets.map((s, j) => (j === si ? { ...s, done: willBeDone } : s)) } : l,
      ),
    );
    if (willBeDone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const restSec = ex?.restSec ?? 60;
      if (restSec > 0) setRest({ remaining: restSec, total: restSec });
    }
  };

  const addSet = (ei: number) =>
    setLogs((prev) =>
      prev.map((l, i) => {
        if (i !== ei) return l;
        const last = l.sets[l.sets.length - 1] ?? { weight: 0, reps: 0, done: false };
        return { ...l, sets: [...l.sets, { weight: last.weight, reps: last.reps, done: false }] };
      }),
    );

  const setEffort = (ei: number, v: number) => setLogs((prev) => prev.map((l, i) => (i === ei ? { ...l, effort: v } : l)));
  const setPain = (ei: number, v: number) => setLogs((prev) => prev.map((l, i) => (i === ei ? { ...l, pain: v } : l)));

  const finish = async () => {
    setConfirmFinish(false);
    const doneLogs = logs.map((l) => ({ ...l, sets: l.sets.filter((s) => s.done || s.reps > 0) }));
    const totalVolume = logs.reduce(
      (a, l) => a + l.sets.filter((s) => s.done).reduce((b, s) => b + s.weight * s.reps, 0),
      0,
    );
    const doneCount = logs.reduce((a, l) => a + l.sets.filter((s) => s.done).length, 0);
    const efforts = logs.filter((l) => l.effort > 0).map((l) => l.effort);
    const avgEffort = efforts.length ? efforts.reduce((a, b) => a + b, 0) / efforts.length : 0;
    const maxPain = Math.max(0, ...logs.map((l) => l.pain));
    const session: WorkoutSession = {
      id: uid("ws_"),
      routineId: active.routineId,
      routineName: active.routineName,
      date: new Date().toISOString(),
      durationSec: elapsed,
      exercises: doneLogs,
      totalVolume,
      totalSets: doneCount,
      avgEffort: Math.round(avgEffort * 10) / 10,
      maxPain,
    };
    const res = await finishWorkout(session);
    if (res.painExceeded) {
      toast.show("Dolor alto: reduce la intensidad y consulta a un profesional", "warning");
    } else {
      toast.show("¡Entrenamiento guardado!", "success");
    }
    router.replace("/(tabs)/progreso");
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => setConfirmCancel(true)} testID="cancel-workout">
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.hName} numberOfLines={1}>
            {active.routineName}
          </Text>
          <Text style={styles.hTime}>{formatDuration(elapsed)} · {done}/{totalSets} series</Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {active.intensityReduced ? (
        <View style={styles.reduced}>
          <Ionicons name="alert-circle" size={18} color={colors.onWarning} />
          <Text style={styles.reducedText}>Intensidad reducida por dolor previo. Cargas sugeridas al 90%.</Text>
        </View>
      ) : null}

      <KeyboardAwareScrollView
        bottomOffset={90}
        contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((log, ei) => {
          const ex = getExercise(log.exerciseId);
          return (
            <View key={`${log.exerciseId}-${ei}`} style={styles.exCard} testID={`active-ex-${log.exerciseId}`}>
              <Text style={styles.exName}>{log.name}</Text>
              <View style={styles.setHead}>
                <Text style={[styles.colH, { width: 28 }]}>#</Text>
                <Text style={[styles.colH, { flex: 1 }]}>kg</Text>
                <Text style={[styles.colH, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.colH, { width: 46, textAlign: "center" }]}>OK</Text>
              </View>
              {log.sets.map((s, si) => (
                <View key={si} style={[styles.setRow, s.done && styles.setRowDone]}>
                  <Text style={[styles.setNum, { width: 28 }]}>{si + 1}</Text>
                  <TextInput
                    testID={`weight-${ei}-${si}`}
                    style={styles.numInput}
                    keyboardType="numeric"
                    value={s.weight ? String(s.weight) : ""}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    onChangeText={(t) => setField(ei, si, "weight", Number(t.replace(/[^0-9.]/g, "")) || 0)}
                  />
                  <TextInput
                    testID={`reps-input-${ei}-${si}`}
                    style={styles.numInput}
                    keyboardType="numeric"
                    value={s.reps ? String(s.reps) : ""}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    onChangeText={(t) => setField(ei, si, "reps", Number(t.replace(/[^0-9]/g, "")) || 0)}
                  />
                  <Pressable
                    testID={`done-${ei}-${si}`}
                    style={[styles.check, s.done && styles.checkOn]}
                    onPress={() => toggleDone(ei, si)}
                  >
                    <Ionicons name="checkmark" size={20} color={s.done ? colors.onBrandPrimary : colors.muted} />
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.addSet} onPress={() => addSet(ei)} testID={`add-set-${ei}`}>
                <Ionicons name="add" size={16} color={colors.brandPrimary} />
                <Text style={styles.addSetText}>Añadir serie</Text>
              </Pressable>

              <View style={styles.rpeRow}>
                <View style={styles.rpe}>
                  <Text style={styles.rpeLabel}>Esfuerzo (RPE)</Text>
                  <Stepper value={log.effort} min={0} max={10} onChange={(v) => setEffort(ei, v)} testID={`effort-${ei}`} />
                </View>
                <View style={styles.rpe}>
                  <Text style={[styles.rpeLabel, log.pain > knee.painThreshold && { color: colors.error }]}>
                    Dolor {ex?.kneeSafety !== "permitido" ? "(rodilla)" : ""}
                  </Text>
                  <Stepper value={log.pain} min={0} max={10} onChange={(v) => setPain(ei, v)} testID={`pain-${ei}`} />
                </View>
              </View>
              {log.pain > knee.painThreshold ? (
                <Text style={styles.painWarn}>Dolor por encima de tu umbral ({knee.painThreshold}). Reduce la carga.</Text>
              ) : null}
            </View>
          );
        })}
      </KeyboardAwareScrollView>

      {/* sticky bottom */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        {rest ? (
          <View style={styles.restPanel} testID="rest-timer">
            <View style={{ flex: 1 }}>
              <Text style={styles.restLabel}>Descanso</Text>
              <Text style={styles.restTime}>{formatDuration(rest.remaining)}</Text>
            </View>
            <Pressable style={styles.restBtn} onPress={() => setRest((r) => (r ? { ...r, remaining: r.remaining + 15 } : null))}>
              <Text style={styles.restBtnText}>+15s</Text>
            </Pressable>
            <Pressable style={[styles.restBtn, styles.restSkip]} onPress={() => setRest(null)} testID="skip-rest">
              <Text style={[styles.restBtnText, { color: colors.onBrandPrimary }]}>Saltar</Text>
            </Pressable>
          </View>
        ) : (
          <Btn title="Finalizar entrenamiento" icon="flag" onPress={() => setConfirmFinish(true)} testID="finish-workout-btn" />
        )}
      </View>

      <Sheet visible={confirmFinish} onClose={() => setConfirmFinish(false)} title="Finalizar entrenamiento">
        <Text style={styles.confirmText}>Se guardarán {done} series completadas. ¿Finalizar?</Text>
        <Btn title="Finalizar y guardar" icon="checkmark" onPress={finish} testID="confirm-finish" />
        <Btn title="Seguir entrenando" variant="secondary" onPress={() => setConfirmFinish(false)} />
      </Sheet>

      <Sheet visible={confirmCancel} onClose={() => setConfirmCancel(false)} title="Descartar entrenamiento">
        <Text style={styles.confirmText}>Perderás el progreso de esta sesión. ¿Descartar?</Text>
        <Btn
          title="Descartar"
          variant="danger"
          onPress={() => {
            cancelWorkout();
            router.replace("/(tabs)");
          }}
          testID="confirm-cancel"
        />
        <Btn title="Seguir entrenando" variant="secondary" onPress={() => setConfirmCancel(false)} />
      </Sheet>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBtn: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  hName: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  hTime: { fontSize: 13, color: colors.muted, fontVariant: ["tabular-nums"] },
  reduced: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.warning, paddingHorizontal: 16, paddingVertical: 8 },
  reducedText: { flex: 1, color: colors.onWarning, fontSize: 12, fontWeight: "700" },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: colors.onSurface },
  exCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  exName: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  setHead: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, width: "100%" },
  colH: { fontSize: 12, fontWeight: "700", color: colors.muted },
  setRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4, borderRadius: radius.sm, width: "100%" },
  setRowDone: { backgroundColor: colors.brandTertiary },
  setNum: { fontSize: 16, fontWeight: "800", color: colors.onSurface, textAlign: "center" },
  numInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.sm,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: colors.onSurface,
    fontVariant: ["tabular-nums"],
  },
  check: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: colors.brandPrimary },
  addSet: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  addSetText: { color: colors.brandPrimary, fontWeight: "700", fontSize: 14 },
  rpeRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rpe: { flex: 1, gap: 6 },
  rpeLabel: { fontSize: 12, fontWeight: "700", color: colors.muted },
  painWarn: { fontSize: 12, color: colors.error, fontWeight: "700" },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  restPanel: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surfaceInverse, borderRadius: radius.md, padding: 12 },
  restLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  restTime: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", fontVariant: ["tabular-nums"] },
  restBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary },
  restSkip: { backgroundColor: colors.brandPrimary },
  restBtnText: { fontWeight: "800", color: colors.onSurfaceTertiary },
  confirmText: { fontSize: 15, color: colors.onSurfaceSecondary, marginBottom: 4 },
}));
