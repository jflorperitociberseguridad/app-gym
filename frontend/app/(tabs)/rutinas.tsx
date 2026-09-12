import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym, uid } from "@/src/store/GymStore";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { Btn, EmptyState, Field, Loading, Sheet } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";

export default function Rutinas() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { ready, routines, addRoutine } = useGym();

  const [sheet, setSheet] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  if (!ready) return <Loading />;

  const create = async () => {
    const n = name.trim() || "Nueva rutina";
    const r = {
      id: uid("rt_"),
      name: n,
      description: desc.trim() || "Rutina personalizada",
      icon: "barbell-outline",
      exercises: [],
      isTemplate: false,
      createdAt: new Date().toISOString(),
    };
    await addRoutine(r);
    setSheet(false);
    setName("");
    setDesc("");
    toast.show("Rutina creada", "success");
    router.push(`/routine/${r.id}`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Rutinas</Text>
        <Text style={styles.subtitle}>{routines.length} rutinas · toca para editar o iniciar</Text>

        {routines.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title="No tienes rutinas"
            message="Crea tu primera rutina para empezar a entrenar."
            actionLabel="Crear rutina"
            onAction={() => setSheet(true)}
          />
        ) : (
          routines.map((r) => (
            <Pressable
              key={r.id}
              testID={`routine-card-${r.id}`}
              onPress={() => router.push(`/routine/${r.id}`)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={r.icon as any} size={24} color={colors.brandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  {r.isTemplate ? (
                    <View style={styles.tpl}>
                      <Text style={styles.tplText}>Plantilla</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardDesc} numberOfLines={1}>
                  {r.description}
                </Text>
                <Text style={styles.cardCount}>{r.exercises.length} ejercicios</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.muted} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <Pressable
        testID="add-routine-fab"
        onPress={() => setSheet(true)}
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
      >
        <Ionicons name="add" size={28} color={colors.onBrandPrimary} />
      </Pressable>

      <Sheet visible={sheet} onClose={() => setSheet(false)} title="Nueva rutina" testID="new-routine-sheet">
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Empuje lunes" testID="routine-name-input" />
        <Field label="Descripción" value={desc} onChangeText={setDesc} placeholder="Opcional" />
        <Btn title="Crear rutina" icon="checkmark" onPress={create} testID="create-routine-btn" />
      </Sheet>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 30, fontWeight: "900", color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: -6, marginBottom: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { fontSize: 17, fontWeight: "800", color: colors.onSurface, flexShrink: 1 },
  tpl: { backgroundColor: colors.surfaceTertiary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tplText: { fontSize: 10, fontWeight: "800", color: colors.muted },
  cardDesc: { fontSize: 13, color: colors.muted, marginTop: 2 },
  cardCount: { fontSize: 12, color: colors.brandPrimary, fontWeight: "700", marginTop: 4 },
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
}));
