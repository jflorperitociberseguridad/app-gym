import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { Btn, Card, Field, Loading, SegmentedControl, Sheet, Stepper } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";

function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  tint,
  testID,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  tint?: string;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable style={styles.row} onPress={onPress} testID={testID}>
      <View style={[styles.rowIcon, tint ? { backgroundColor: tint } : null]}>
        <Ionicons name={icon as any} size={20} color={colors.brandPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

export default function Ajustes() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { ready, settings, knee, updateSettings } = useGym();

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(settings.name);

  if (!ready) return <Loading />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Ajustes</Text>

      <Card>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.onBrandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{settings.name}</Text>
            <Text style={styles.profileSub}>Meta: {settings.weeklyGoal} entrenos/semana · {settings.units}</Text>
          </View>
          <Pressable onPress={() => { setName(settings.name); setEdit(true); }} testID="edit-profile">
            <Ionicons name="create-outline" size={22} color={colors.brandPrimary} />
          </Pressable>
        </View>

        <View style={styles.divider} />
        <View style={styles.inlineRow}>
          <Text style={styles.inlineLabel}>Unidad de peso</Text>
          <View style={{ width: 160 }}>
            <SegmentedControl
              options={[
                { key: "kg", label: "kg" },
                { key: "lb", label: "lb" },
              ]}
              value={settings.units}
              onChange={(v) => updateSettings({ units: v })}
              testID="units-segment"
            />
          </View>
        </View>
        <View style={styles.inlineRow}>
          <Text style={styles.inlineLabel}>Meta semanal</Text>
          <View style={{ width: 160 }}>
            <Stepper value={settings.weeklyGoal} min={1} max={7} onChange={(v) => updateSettings({ weeklyGoal: v })} testID="goal-stepper" />
          </View>
        </View>
      </Card>

      <SettingRow
        icon="shield-checkmark"
        title="Rodilla protegida"
        subtitle={knee.enabled ? `Activo · ${knee.side} · umbral ${knee.painThreshold}` : "Desactivado"}
        onPress={() => router.push("/ajustes/rodilla")}
        tint={colors.brandTertiary}
        testID="settings-knee"
      />
      <SettingRow
        icon="image"
        title="Gestión de imágenes"
        subtitle="Sustituye los diagramas por tus propias fotos"
        onPress={() => router.push("/ajustes/imagenes")}
        testID="settings-images"
      />
      <SettingRow
        icon="sync"
        title="Importar / Exportar datos"
        subtitle="Copia de seguridad en JSON o CSV"
        onPress={() => router.push("/ajustes/datos")}
        testID="settings-data"
      />

      <Card>
        <Text style={styles.aboutTitle}>Aviso de salud</Text>
        <Text style={styles.aboutText}>
          Esta aplicación es una herramienta personal de seguimiento y no ofrece diagnóstico médico. La etiqueta
          &quot;Rodilla protegida&quot; ayuda a evitar movimientos de riesgo, pero no garantiza que un ejercicio sea
          seguro para ti. Ante dolor o molestias, detente y consulta a un médico o fisioterapeuta.
        </Text>
      </Card>

      <Sheet visible={edit} onClose={() => setEdit(false)} title="Editar perfil">
        <Field label="Nombre" value={name} onChangeText={setName} testID="profile-name-input" />
        <Btn
          title="Guardar"
          icon="checkmark"
          onPress={() => { updateSettings({ name: name.trim() || "Atleta" }); setEdit(false); toast.show("Perfil actualizado", "success"); }}
          testID="profile-save"
        />
      </Sheet>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 30, fontWeight: "900", color: colors.onSurface },
  profile: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 54, height: 54, borderRadius: 999, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 20, fontWeight: "900", color: colors.onSurface },
  profileSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  inlineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  inlineLabel: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  rowIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  rowSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  aboutTitle: { fontSize: 15, fontWeight: "800", color: colors.onSurface, marginBottom: 6 },
  aboutText: { fontSize: 13, color: colors.muted, lineHeight: 19 },
}));
