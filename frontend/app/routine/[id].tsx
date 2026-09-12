import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { GROUP_LABEL } from "@/src/data/exercises";
import { RoutineExercise } from "@/src/types";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { Btn, Field, KneeBadge, Loading, Sheet, Stepper } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";

export default function RoutineDetail() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, routines, exercises, getExercise, safetyOf, updateRoutine, deleteRoutine, duplicateRoutine, startWorkout } =
    useGym();

  const routine = routines.find((r) => r.id === String(id));
  const [addOpen, setAddOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState(routine?.name ?? "");
  const [desc, setDesc] = useState(routine?.description ?? "");

  const notAdded = useMemo(() => {
    const set = new Set(routine?.exercises.map((e) => e.exerciseId));
    const q = search.trim().toLowerCase();
    return exercises.filter((e) => !set.has(e.id) && (!q || e.name.toLowerCase().includes(q)));
  }, [exercises, routine, search]);

  if (!ready) return <Loading />;
  if (!routine) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={styles.name}>Rutina no encontrada</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const save = (exList: RoutineExercise[]) => updateRoutine({ ...routine, exercises: exList });

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...routine.exercises];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    save(arr);
  };
  const remove = (idx: number) => save(routine.exercises.filter((_, i) => i !== idx));
  const patch = (idx: number, p: Partial<RoutineExercise>) =>
    save(routine.exercises.map((e, i) => (i === idx ? { ...e, ...p } : e)));
  const add = (exId: string) => {
    const ex = getExercise(exId);
    save([
      ...routine.exercises,
      { exerciseId: exId, sets: ex?.sets ?? 3, reps: ex?.reps ?? "10-12", restSec: ex?.restSec ?? 60 },
    ]);
    toast.show("Ejercicio añadido", "success");
  };

  const start = () => {
    if (routine.exercises.length === 0) {
      toast.show("Añade ejercicios primero", "warning");
      return;
    }
    startWorkout(routine);
    router.push("/workout/active");
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} testID="routine-back">
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {routine.name}
        </Text>
        <Pressable style={styles.iconBtn} onPress={() => setMenuOpen(true)} testID="routine-menu">
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 110, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.desc}>{routine.description}</Text>

        {routine.exercises.map((re, idx) => {
          const ex = getExercise(re.exerciseId);
          if (!ex) return null;
          const safety = safetyOf(ex);
          return (
            <View key={`${re.exerciseId}-${idx}`} style={styles.exCard} testID={`routine-ex-${re.exerciseId}`}>
              <View style={styles.exTop}>
                <Text style={styles.exIndex}>{idx + 1}</Text>
                <Pressable style={{ flex: 1 }} onPress={() => router.push(`/exercise/${ex.id}`)}>
                  <Text style={styles.exName} numberOfLines={1}>
                    {ex.name}
                  </Text>
                  <View style={styles.exMetaRow}>
                    <Text style={styles.exMeta}>{GROUP_LABEL[ex.group]}</Text>
                    {safety !== "permitido" ? <KneeBadge safety={safety} /> : null}
                  </View>
                </Pressable>
                <View style={styles.reorder}>
                  <Pressable onPress={() => move(idx, -1)} style={styles.reBtn} testID={`move-up-${idx}`}>
                    <Ionicons name="chevron-up" size={18} color={colors.muted} />
                  </Pressable>
                  <Pressable onPress={() => move(idx, 1)} style={styles.reBtn} testID={`move-down-${idx}`}>
                    <Ionicons name="chevron-down" size={18} color={colors.muted} />
                  </Pressable>
                  <Pressable onPress={() => remove(idx)} style={styles.reBtn} testID={`remove-ex-${idx}`}>
                    <Ionicons name="trash" size={17} color={colors.error} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.controls}>
                <View style={styles.ctrl}>
                  <Text style={styles.ctrlLabel}>Series</Text>
                  <Stepper value={re.sets} min={1} max={10} onChange={(v) => patch(idx, { sets: v })} testID={`sets-${idx}`} />
                </View>
                <View style={styles.ctrl}>
                  <Text style={styles.ctrlLabel}>Reps</Text>
                  <TextInput
                    value={re.reps}
                    onChangeText={(t) => patch(idx, { reps: t })}
                    style={styles.repsInput}
                    testID={`reps-${idx}`}
                  />
                </View>
                <View style={styles.ctrl}>
                  <Text style={styles.ctrlLabel}>Descanso</Text>
                  <Stepper
                    value={re.restSec}
                    min={0}
                    max={300}
                    step={15}
                    suffix="s"
                    onChange={(v) => patch(idx, { restSec: v })}
                    testID={`rest-${idx}`}
                  />
                </View>
              </View>
            </View>
          );
        })}

        <Pressable style={styles.addBtn} onPress={() => setAddOpen(true)} testID="add-exercise-btn">
          <Ionicons name="add-circle" size={22} color={colors.brandPrimary} />
          <Text style={styles.addText}>Añadir ejercicio</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Btn title="Iniciar entrenamiento" icon="play" onPress={start} testID="routine-start-btn" />
      </View>

      {/* add sheet */}
      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title="Añadir ejercicio" testID="add-exercise-sheet">
        <Field placeholder="Buscar..." value={search} onChangeText={setSearch} testID="add-search" />
        <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
          {notAdded.map((e) => (
            <Pressable key={e.id} style={styles.addRow} onPress={() => add(e.id)} testID={`add-pick-${e.id}`}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addRowName}>{e.name}</Text>
                <Text style={styles.addRowMeta}>{GROUP_LABEL[e.group]} · {e.equipment}</Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={colors.brandPrimary} />
            </Pressable>
          ))}
        </ScrollView>
        <Btn title="Listo" variant="secondary" onPress={() => setAddOpen(false)} />
      </Sheet>

      {/* rename sheet */}
      <Sheet visible={renameOpen} onClose={() => setRenameOpen(false)} title="Editar rutina">
        <Field label="Nombre" value={name} onChangeText={setName} testID="rename-input" />
        <Field label="Descripción" value={desc} onChangeText={setDesc} />
        <Btn
          title="Guardar"
          icon="checkmark"
          onPress={() => {
            updateRoutine({ ...routine, name: name.trim() || routine.name, description: desc.trim() || routine.description });
            setRenameOpen(false);
            toast.show("Rutina actualizada", "success");
          }}
          testID="rename-save"
        />
      </Sheet>

      {/* menu sheet */}
      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title="Opciones">
        <MenuItem icon="create-outline" label="Editar nombre" onPress={() => { setMenuOpen(false); setName(routine.name); setDesc(routine.description); setRenameOpen(true); }} />
        <MenuItem
          icon="copy-outline"
          label="Duplicar rutina"
          onPress={async () => {
            setMenuOpen(false);
            const copy = await duplicateRoutine(routine.id);
            toast.show("Rutina duplicada", "success");
            if (copy) router.replace(`/routine/${copy.id}`);
          }}
        />
        <MenuItem
          icon={routine.isTemplate ? "bookmark" : "bookmark-outline"}
          label={routine.isTemplate ? "Quitar de plantillas" : "Guardar como plantilla"}
          onPress={() => { updateRoutine({ ...routine, isTemplate: !routine.isTemplate }); setMenuOpen(false); toast.show("Actualizado", "success"); }}
        />
        <MenuItem
          icon="trash-outline"
          label="Eliminar rutina"
          danger
          onPress={async () => { setMenuOpen(false); await deleteRoutine(routine.id); toast.show("Rutina eliminada", "info"); router.back(); }}
        />
      </Sheet>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable style={styles.menuItem} onPress={onPress} testID={`menu-${label}`}>
      <Ionicons name={icon as any} size={22} color={danger ? colors.error : colors.onSurface} />
      <Text style={[styles.menuLabel, danger && { color: colors.error }]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.onSurface, textAlign: "center" },
  desc: { fontSize: 14, color: colors.muted },
  name: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  link: { color: colors.brandPrimary, fontWeight: "700", fontSize: 16 },
  exCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 12 },
  exTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  exIndex: { fontSize: 16, fontWeight: "900", color: colors.brandPrimary, width: 20 },
  exName: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  exMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  exMeta: { fontSize: 13, color: colors.muted },
  reorder: { flexDirection: "row", gap: 2 },
  reBtn: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceTertiary },
  controls: { flexDirection: "row", gap: 10 },
  ctrl: { flex: 1, gap: 6 },
  ctrlLabel: { fontSize: 11, fontWeight: "700", color: colors.muted },
  repsInput: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    height: 48,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
    borderStyle: "dashed",
  },
  addText: { color: colors.brandPrimary, fontWeight: "800", fontSize: 15 },
  bottomBar: {
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
  addRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  addRowName: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  addRowMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  menuLabel: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
}));
