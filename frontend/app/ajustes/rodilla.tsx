import React, { useMemo } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { effectiveSafety, useGym } from "@/src/store/GymStore";
import { GROUP_LABEL } from "@/src/data/exercises";
import { KneeSafety } from "@/src/types";
import { makeStyles, useTheme } from "@/src/theme";
import { Card, Loading, SegmentedControl, Stepper } from "@/src/components/ui";

const AVOID = [
  "Saltos",
  "Carrera intensa",
  "Cambios bruscos de dirección",
  "Flexiones profundas de rodilla",
  "Cargas excesivas",
  "Ejercicios de alto impacto",
];

export default function RodillaConfig() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ready, knee, exercises, updateKnee } = useGym();

  const groups = useMemo(() => {
    const res: Record<KneeSafety, typeof exercises> = { permitido: [], precaucion: [], bloqueado: [] };
    exercises.forEach((e) => res[effectiveSafety(e, knee)].push(e));
    return res;
  }, [exercises, knee]);

  if (!ready) return <Loading />;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} testID="knee-back">
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Rodilla protegida</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Activar modo protegido</Text>
              <Text style={styles.switchSub}>Filtra y avisa sobre ejercicios de riesgo para la rodilla.</Text>
            </View>
            <Switch
              testID="knee-enabled"
              value={knee.enabled}
              onValueChange={(v) => updateKnee({ enabled: v })}
              trackColor={{ true: colors.brandPrimary, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {knee.enabled ? (
          <>
            <Card>
              <Text style={styles.label}>Rodilla afectada</Text>
              <SegmentedControl
                options={[
                  { key: "izquierda", label: "Izquierda" },
                  { key: "derecha", label: "Derecha" },
                  { key: "ambas", label: "Ambas" },
                ]}
                value={knee.side}
                onChange={(v) => updateKnee({ side: v })}
                testID="knee-side"
              />

              <View style={styles.stepRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Umbral de dolor (0-10)</Text>
                  <Text style={styles.hint}>Sobre este valor se reduce la intensidad</Text>
                </View>
                <View style={{ width: 150 }}>
                  <Stepper value={knee.painThreshold} min={0} max={10} onChange={(v) => updateKnee({ painThreshold: v })} testID="knee-pain" />
                </View>
              </View>
              <View style={styles.stepRow}>
                <Text style={[styles.label, { flex: 1 }]}>Intensidad máxima (0-10)</Text>
                <View style={{ width: 150 }}>
                  <Stepper value={knee.maxIntensity} min={0} max={10} onChange={(v) => updateKnee({ maxIntensity: v })} testID="knee-intensity" />
                </View>
              </View>
              <View style={styles.stepRow}>
                <Text style={[styles.label, { flex: 1 }]}>Peso máximo (kg)</Text>
                <View style={{ width: 150 }}>
                  <Stepper value={knee.maxWeightKg} min={0} max={300} step={5} onChange={(v) => updateKnee({ maxWeightKg: v })} testID="knee-weight" />
                </View>
              </View>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Rango de movimiento reducido</Text>
                  <Text style={styles.switchSub}>Bloquea flexiones profundas de rodilla.</Text>
                </View>
                <Switch
                  testID="knee-rom"
                  value={knee.reducedRom}
                  onValueChange={(v) => updateKnee({ reducedRom: v })}
                  trackColor={{ true: colors.brandPrimary, false: colors.border }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            <Card>
              <Text style={styles.cardTitle}>Se evitan automáticamente</Text>
              {AVOID.map((a) => (
                <View key={a} style={styles.avoidRow}>
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                  <Text style={styles.avoidText}>{a}</Text>
                </View>
              ))}
            </Card>

            <SafetyList title="Permitidos" tone={colors.success} icon="checkmark-circle" items={groups.permitido} />
            <SafetyList title="Con precaución" tone={colors.warning} icon="alert-circle" items={groups.precaucion} />
            <SafetyList title="Bloqueados" tone={colors.error} icon="close-circle" items={groups.bloqueado} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SafetyList({ title, tone, icon, items }: { title: string; tone: string; icon: string; items: any[] }) {
  const styles = useStyles();
  return (
    <Card>
      <View style={styles.listHead}>
        <Ionicons name={icon as any} size={20} color={tone} />
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.count, { backgroundColor: tone }]}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
      </View>
      {items.slice(0, 40).map((e) => (
        <View key={e.id} style={styles.listItem}>
          <Text style={styles.listName} numberOfLines={1}>
            {e.name}
          </Text>
          <Text style={styles.listGroup}>{GROUP_LABEL[e.group]}</Text>
        </View>
      ))}
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBtn: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.onSurface, textAlign: "center" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  switchTitle: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  switchSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  label: { fontSize: 15, fontWeight: "700", color: colors.onSurface, marginBottom: 8, marginTop: 12 },
  hint: { fontSize: 12, color: colors.muted, marginTop: -6, marginBottom: 4 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  avoidRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  avoidText: { fontSize: 14, color: colors.onSurfaceSecondary },
  listHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  count: { minWidth: 26, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  countText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  listName: { flex: 1, fontSize: 14, color: colors.onSurface, fontWeight: "600" },
  listGroup: { fontSize: 12, color: colors.muted },
}));
