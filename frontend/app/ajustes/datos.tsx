import React, { useState } from "react";
import { Platform, Pressable, ScrollView, Share, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { mk } from "@/src/data/_ex";
import { Exercise, ImageOverride, KneeSettings, MuscleGroup, Routine, UserSettings, WorkoutSession } from "@/src/types";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { Btn, Card, Loading } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";

const CSV_TEMPLATE =
  "id,name,group,equipment,level,pattern,view,muscles,instructions,mistakes,easier,noEquip,sets,reps,restSec,kneeSafety\n" +
  "mi-ejercicio,Mi Ejercicio,pecho,Mancuernas,intermedio,press,front,pecho|triceps,Paso 1|Paso 2,Error 1,Alternativa facil,Sin equipo,3,10-12,60,permitido";

function parseCSV(text: string): Exercise[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const out: Exercise[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, j) => (row[h] = (cells[j] ?? "").trim()));
    if (!row.id || !row.name) continue;
    out.push(
      mk({
        id: row.id,
        name: row.name,
        group: (row.group as MuscleGroup) || "core",
        equipment: row.equipment || "Peso corporal",
        level: (row.level as any) || "intermedio",
        pattern: row.pattern || "squat",
        view: (row.view as any) || "front",
        muscles: (row.muscles || "").split("|").filter(Boolean),
        instructions: (row.instructions || "").split("|").filter(Boolean),
        mistakes: (row.mistakes || "").split("|").filter(Boolean),
        easier: row.easier || "-",
        noEquip: row.noEquip || "-",
        sets: Number(row.sets) || 3,
        reps: row.reps || "10-12",
        restSec: Number(row.restSec) || 60,
        kneeSafety: (row.kneeSafety as any) || "permitido",
      }),
    );
  }
  return out;

}

const MUSCLE_GROUPS = ["pecho", "espalda", "hombros", "biceps", "triceps", "core", "gluteos", "piernas", "movilidad", "cardio", "estiramientos"];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function isExercise(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    MUSCLE_GROUPS.includes(value.group as string) &&
    typeof value.equipment === "string" &&
    ["principiante", "intermedio", "avanzado"].includes(value.level as string) &&
    typeof value.pattern === "string" &&
    ["front", "back"].includes(value.view as string) &&
    isStringArray(value.muscles) &&
    isStringArray(value.instructions) &&
    isStringArray(value.mistakes) &&
    typeof value.easier === "string" &&
    typeof value.noEquip === "string" &&
    isFiniteNumber(value.sets) &&
    typeof value.reps === "string" &&
    isFiniteNumber(value.restSec) &&
    ["permitido", "precaucion", "bloqueado"].includes(value.kneeSafety as string) &&
    ["barra", "mancuerna", "none"].includes(value.implement as string) &&
    typeof value.jumping === "boolean" &&
    typeof value.highImpact === "boolean" &&
    typeof value.deepKnee === "boolean" &&
    (value.duration === undefined || typeof value.duration === "string")
  );
}

function isRoutine(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.icon === "string" &&
    typeof value.isTemplate === "boolean" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.exercises) &&
    value.exercises.every(
      (exercise) =>
        isRecord(exercise) &&
        typeof exercise.exerciseId === "string" &&
        isFiniteNumber(exercise.sets) &&
        typeof exercise.reps === "string" &&
        isFiniteNumber(exercise.restSec),
    )
  );
}

function isWorkoutSession(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.routineId === undefined || typeof value.routineId === "string") &&
    typeof value.routineName === "string" &&
    typeof value.date === "string" &&
    isFiniteNumber(value.durationSec) &&
    isFiniteNumber(value.totalVolume) &&
    isFiniteNumber(value.totalSets) &&
    isFiniteNumber(value.avgEffort) &&
    isFiniteNumber(value.maxPain) &&
    Array.isArray(value.exercises) &&
    value.exercises.every(
      (exercise) =>
        isRecord(exercise) &&
        typeof exercise.exerciseId === "string" &&
        typeof exercise.name === "string" &&
        isFiniteNumber(exercise.effort) &&
        isFiniteNumber(exercise.pain) &&
        typeof exercise.notes === "string" &&
        Array.isArray(exercise.sets) &&
        exercise.sets.every(
          (set) =>
            isRecord(set) &&
            isFiniteNumber(set.weight) &&
            isFiniteNumber(set.reps) &&
            typeof set.done === "boolean",
        ),
    )
  );
}

function isBackupData(value: unknown): value is BackupData {
  if (!isRecord(value)) return false;
  const settings = value.settings;
  const knee = value.knee;
  const images = value.images;
  return (
    value.version === 1 &&
    typeof value.exportedAt === "string" &&
    Array.isArray(value.routines) &&
    value.routines.every(isRoutine) &&
    Array.isArray(value.history) &&
    value.history.every(isWorkoutSession) &&
    isRecord(settings) &&
    typeof settings.name === "string" &&
    ["kg", "lb"].includes(settings.units as string) &&
    isFiniteNumber(settings.weeklyGoal) &&
    isRecord(knee) &&
    typeof knee.enabled === "boolean" &&
    ["izquierda", "derecha", "ambas"].includes(knee.side as string) &&
    isFiniteNumber(knee.painThreshold) &&
    knee.painThreshold >= 0 &&
    knee.painThreshold <= 10 &&
    isFiniteNumber(knee.maxIntensity) &&
    knee.maxIntensity >= 0 &&
    knee.maxIntensity <= 10 &&
    isFiniteNumber(knee.maxWeightKg) &&
    knee.maxWeightKg >= 0 &&
    typeof knee.reducedRom === "boolean" &&
    isRecord(images) &&
    Object.values(images).every(
      (image) =>
        isRecord(image) &&
        ["main", "start", "end"].every(
          (key) => image[key] === undefined || typeof image[key] === "string",
        ),
    ) &&
    Array.isArray(value.customExercises) &&
    value.customExercises.every(isExercise)
  );
}

type BackupData = {
  version: 1;
  exportedAt: string;
  routines: Routine[];
  history: WorkoutSession[];
  settings: UserSettings;
  knee: KneeSettings;
  images: Record<string, ImageOverride>;
  customExercises: Exercise[];
};

type PendingBackup = {
  data: BackupData;
  routineCount: number;
  sessionCount: number;
  customExerciseCount: number;
};

export default function Datos() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { ready, exportData, importData, addCustomExercises, routines, history, exercises } = useGym();

  const [text, setText] = useState("");
  const [pendingBackup, setPendingBackup] = useState<PendingBackup | null>(null);

  if (!ready) return <Loading />;

  const doExport = async () => {
    const json = JSON.stringify(exportData(), null, 2);
    await Clipboard.setStringAsync(json);
    toast.show("Copia JSON copiada al portapapeles", "success");
    try {
      await Share.share({ message: json, title: "Copia de seguridad Gym Personal" });
    } catch {
      /* user cancelled */
    }
  };

  const handleText = async (raw: string): Promise<"imported" | "pending" | "invalid"> => {
    const t = raw.trim();
    if (!t) return "invalid";
    // Try JSON first
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(t);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0 || !parsed.every(isExercise)) {
            toast.show("El JSON no contiene una lista válida de ejercicios.", "error");
            return "invalid";
          }
          const n = await addCustomExercises(parsed);
          toast.show(`${n} ejercicios importados`, "success");
          return "imported";
        }
        if (!isBackupData(parsed)) {
          toast.show("La copia no tiene un formato válido de Gym Personal.", "error");
          return "invalid";
        }
        setPendingBackup({
          data: parsed,
          routineCount: parsed.routines.length,
          sessionCount: parsed.history.length,
          customExerciseCount: parsed.customExercises.length,
        });
        return "pending";
      } catch {
        toast.show("JSON no válido", "error");
        return "invalid";
      }
    }
    // CSV
    const list = parseCSV(t);
    if (list.length > 0) {
      const n = await addCustomExercises(list);
      toast.show(`${n} ejercicios importados (CSV)`, "success");
      return "imported";
    }
    toast.show("No se pudo interpretar el contenido", "error");
    return "invalid";
  };

  const importPaste = async () => {
    const result = await handleText(text);
    if (result === "imported") setText("");
  };

  const confirmBackupImport = async () => {
    if (!pendingBackup) return;
    try {
      await importData(pendingBackup.data);
      setPendingBackup(null);
      setText("");
      toast.show("Copia importada correctamente", "success");
    } catch {
      toast.show("No se pudo importar la copia.", "error");
    }
  };

  const importFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/csv", "text/comma-separated-values", "*/*"] });
      if (res.canceled || !res.assets?.[0]) return;
      const uri = res.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);
      await handleText(content);
    } catch {
      toast.show("No se pudo leer el archivo. Pega el contenido manualmente.", "error");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} testID="data-back">
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Importar / Exportar</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <SummaryItem value={exercises.length} label="Ejercicios" />
          <SummaryItem value={routines.length} label="Rutinas" />
          <SummaryItem value={history.length} label="Sesiones" />
        </View>

        <Card>
          <Text style={styles.cardTitle}>Exportar copia</Text>
          <Text style={styles.cardSub}>Genera un JSON con todas tus rutinas, historial y ajustes. Se copia al portapapeles y puedes compartirlo o guardarlo.</Text>
          <Btn title="Exportar copia (JSON)" icon="share-outline" onPress={doExport} style={{ marginTop: 12 }} testID="export-btn" />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Importar datos</Text>
          <Text style={styles.cardSub}>Pega aquí una copia JSON, un array de ejercicios (JSON) o filas CSV de ejercicios.</Text>
          <TextInput
            style={styles.textarea}
            multiline
            placeholder="Pega el JSON o CSV aquí..."
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            testID="import-textarea"
          />
          <Btn title="Importar desde texto" icon="download-outline" onPress={importPaste} style={{ marginTop: 10 }} testID="import-text-btn" />
          <Btn title="Importar desde archivo" variant="secondary" icon="folder-open-outline" onPress={importFile} style={{ marginTop: 10 }} testID="import-file-btn" />
        </Card>

        {pendingBackup ? (
          <Card>
            <Text style={styles.cardTitle}>Confirmar importación</Text>
            <Text style={styles.cardSub}>
              La copia contiene {pendingBackup.routineCount} rutinas, {pendingBackup.sessionCount} sesiones y {pendingBackup.customExerciseCount} ejercicios personalizados.
              Al continuar, reemplazará tus rutinas, historial, ajustes, imágenes y ejercicios personalizados actuales.
            </Text>
            <Btn title="Confirmar y reemplazar" icon="checkmark" onPress={confirmBackupImport} style={{ marginTop: 12 }} testID="confirm-backup-import" />
            <Btn title="Cancelar" variant="secondary" onPress={() => setPendingBackup(null)} style={{ marginTop: 8 }} testID="cancel-backup-import" />
          </Card>
        ) : null}

        <Card>
          <View style={styles.tmplHead}>
            <Text style={styles.cardTitle}>Plantilla CSV</Text>
            <Pressable
              onPress={() => { Clipboard.setStringAsync(CSV_TEMPLATE); toast.show("Plantilla copiada", "success"); }}
              testID="copy-template"
            >
              <Text style={styles.copy}>Copiar</Text>
            </Pressable>
          </View>
          <Text style={styles.code}>{CSV_TEMPLATE}</Text>
          <Text style={styles.cardSub}>Usa &quot;|&quot; para separar músculos, instrucciones y errores.</Text>
        </Card>

        <Text style={styles.note}>
          Todos tus datos se guardan localmente en el dispositivo. Realiza copias periódicas para no perder tu historial
          {Platform.OS === "web" ? "" : " al reinstalar la app"}.
        </Text>
      </ScrollView>
    </View>
  );
}

function SummaryItem({ value, label }: { value: number; label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBtn: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.onSurface, textAlign: "center" },
  summary: { flexDirection: "row", gap: 12 },
  summaryItem: { flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 16, alignItems: "center" },
  summaryValue: { fontSize: 24, fontWeight: "900", color: colors.brandPrimary },
  summaryLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },
  textarea: {
    marginTop: 12,
    minHeight: 120,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 13,
    color: colors.onSurface,
    textAlignVertical: "top",
  },
  tmplHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  copy: { color: colors.brandPrimary, fontWeight: "800", fontSize: 14 },
  code: { fontSize: 11, color: colors.onSurfaceSecondary, backgroundColor: colors.surfaceTertiary, padding: 10, borderRadius: radius.sm, marginTop: 8, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  note: { fontSize: 12, color: colors.muted, lineHeight: 17, fontStyle: "italic" },
}));
