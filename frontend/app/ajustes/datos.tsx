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
import { Exercise, MuscleGroup } from "@/src/types";
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

export default function Datos() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { ready, exportData, importData, addCustomExercises, routines, history, exercises } = useGym();

  const [text, setText] = useState("");

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

  const handleText = async (raw: string): Promise<boolean> => {
    const t = raw.trim();
    if (!t) return false;
    // Try JSON first
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) {
          const n = await addCustomExercises(parsed as Exercise[]);
          toast.show(`${n} ejercicios importados`, "success");
          return true;
        }
        await importData(parsed);
        toast.show("Datos importados correctamente", "success");
        return true;
      } catch {
        toast.show("JSON no válido", "error");
        return false;
      }
    }
    // CSV
    const list = parseCSV(t);
    if (list.length > 0) {
      const n = await addCustomExercises(list);
      toast.show(`${n} ejercicios importados (CSV)`, "success");
      return true;
    }
    toast.show("No se pudo interpretar el contenido", "error");
    return false;
  };

  const importPaste = async () => {
    const ok = await handleText(text);
    if (ok) setText("");
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
