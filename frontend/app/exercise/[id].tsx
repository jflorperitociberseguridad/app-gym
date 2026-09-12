import React from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { GROUP_LABEL } from "@/src/data/exercises";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { ExerciseVisual } from "@/src/components/ExerciseVisual";
import { Badge, KneeBadge } from "@/src/components/ui";

function InfoTag({ icon, label, value }: { icon: string; label: string; value: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.infoTag}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={16} color={colors.brandPrimary} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ListBlock({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  const styles = useStyles();
  return (
    <View style={styles.block}>
      <View style={styles.blockHead}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={styles.blockTitle}>{title}</Text>
      </View>
      {items.map((t, i) => (
        <View key={i} style={styles.bullet}>
          <View style={[styles.bulletDot, { backgroundColor: color }]}>
            <Text style={styles.bulletNum}>{i + 1}</Text>
          </View>
          <Text style={styles.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ExerciseDetail() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExercise, safetyOf, images } = useGym();
  const width = Dimensions.get("window").width;

  const ex = getExercise(String(id));
  if (!ex) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={styles.name}>Ejercicio no encontrado</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const safety = safetyOf(ex);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <ExerciseVisual exercise={ex} override={images[ex.id]} width={width} />

        <View style={styles.content}>
          <Text style={styles.name}>{ex.name}</Text>
          <View style={styles.badgeRow}>
            <Badge label={GROUP_LABEL[ex.group]} tone="brand" />
            <Badge label={ex.equipment} icon="barbell-outline" />
            <Badge label={ex.level} />
          </View>

          {safety !== "permitido" ? (
            <View style={[styles.kneeNote, { backgroundColor: safety === "bloqueado" ? colors.error : colors.warning }]}>
              <Ionicons name={safety === "bloqueado" ? "close-circle" : "alert-circle"} size={20} color="#FFFFFF" />
              <Text style={styles.kneeNoteText}>
                {safety === "bloqueado"
                  ? "Bloqueado por tu modo Rodilla protegida. Considera una alternativa más segura."
                  : "Precaución con la rodilla: controla el rango y la carga."}
              </Text>
            </View>
          ) : (
            <View style={styles.okRow}>
              <KneeBadge safety="permitido" />
            </View>
          )}

          <View style={styles.tags}>
            <InfoTag icon="repeat" label="Series" value={`${ex.sets}`} />
            <InfoTag icon="fitness" label="Reps" value={ex.reps} />
            <InfoTag icon="time" label="Descanso" value={`${ex.restSec}s`} />
            {ex.duration ? <InfoTag icon="hourglass" label="Duración" value={ex.duration} /> : null}
          </View>

          <ListBlock icon="list-circle" title="Instrucciones" items={ex.instructions} color={colors.brandPrimary} />
          <ListBlock icon="warning" title="Errores frecuentes" items={ex.mistakes} color={colors.warning} />

          <View style={styles.altRow}>
            <View style={[styles.altCard, { flex: 1 }]}>
              <Ionicons name="trending-down" size={18} color={colors.success} />
              <Text style={styles.altTitle}>Alternativa más fácil</Text>
              <Text style={styles.altText}>{ex.easier}</Text>
            </View>
            <View style={[styles.altCard, { flex: 1 }]}>
              <Ionicons name="home" size={18} color={colors.brandPrimary} />
              <Text style={styles.altTitle}>Sin equipamiento</Text>
              <Text style={styles.altText}>{ex.noEquip}</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Esta información es orientativa y no sustituye el consejo médico. Si sientes dolor, detente y consulta a un
            médico o fisioterapeuta.
          </Text>
        </View>
      </ScrollView>

      {/* top bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable style={styles.backBtn} onPress={() => router.back()} testID="detail-back">
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 14 },
  name: { fontSize: 26, fontWeight: "900", color: colors.onSurface },
  link: { color: colors.brandPrimary, fontWeight: "700", fontSize: 16 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: -4 },
  kneeNote: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.md },
  kneeNoteText: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "600", lineHeight: 18 },
  okRow: { flexDirection: "row" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  infoValue: { fontSize: 15, color: colors.onSurface, fontWeight: "800" },
  block: { gap: 10 },
  blockHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  blockTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  bullet: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  bulletDot: { width: 22, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center", marginTop: 1 },
  bulletNum: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  bulletText: { flex: 1, fontSize: 15, color: colors.onSurfaceSecondary, lineHeight: 21 },
  altRow: { flexDirection: "row", gap: 12 },
  altCard: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  altTitle: { fontSize: 13, fontWeight: "800", color: colors.onSurface },
  altText: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  disclaimer: { fontSize: 12, color: colors.muted, lineHeight: 17, fontStyle: "italic", marginTop: 4 },
  topBar: { position: "absolute", left: 12, right: 12, flexDirection: "row" },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
}));
