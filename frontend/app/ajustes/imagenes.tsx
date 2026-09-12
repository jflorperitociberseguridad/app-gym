import React, { useMemo, useState } from "react";
import { FlatList, Linking, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useGym } from "@/src/store/GymStore";
import { GROUP_LABEL } from "@/src/data/exercises";
import { makeStyles, radius, useTheme } from "@/src/theme";
import { MuscleMap } from "@/src/components/MuscleMap";
import { Btn, Loading, Sheet } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";

type Slot = "main" | "start" | "end";

export default function GestionImagenes() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { ready, exercises, images, setImageOverride, resetImages, getExercise } = useGym();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((e) => !q || e.name.toLowerCase().includes(q));
  }, [exercises, search]);

  if (!ready) return <Loading />;

  const pick = async (exId: string, slot: Slot) => {
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    let status = perm.status;
    if (status !== "granted") {
      if (perm.canAskAgain) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = req.status;
      }
      if (status !== "granted") {
        toast.show("Permiso de fotos denegado", "warning");
        Linking.openSettings().catch(() => {});
        return;
      }
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      await setImageOverride(exId, { [slot]: res.assets[0].uri });
      toast.show("Imagen actualizada", "success");
    }
  };

  const sel = selected ? getExercise(selected) : null;
  const selOv = selected ? images[selected] : undefined;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} testID="images-back">
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Gestión de imágenes</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Buscar ejercicio..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            testID="images-search"
          />
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ov = images[item.id];
          const custom = ov && (ov.main || ov.start || ov.end);
          return (
            <Pressable style={styles.row} onPress={() => setSelected(item.id)} testID={`image-row-${item.id}`}>
              <View style={styles.thumb}>
                {ov?.main ? (
                  <Image source={{ uri: ov.main }} style={{ width: 44, height: 60 }} contentFit="contain" />
                ) : (
                  <MuscleMap view={item.view} muscles={item.muscles} color={colors.onSurfaceSecondary} accent={colors.brandPrimary} faint={colors.muted} size={26} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.rowMeta}>{GROUP_LABEL[item.group]}</Text>
              </View>
              <View style={[styles.tag, custom ? { backgroundColor: colors.success } : { backgroundColor: colors.surfaceTertiary }]}>
                <Text style={[styles.tagText, custom ? { color: "#FFFFFF" } : { color: colors.muted }]}>
                  {custom ? "Personalizada" : "Diagrama"}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Sheet visible={!!selected} onClose={() => setSelected(null)} title={sel?.name}>
        <Text style={styles.sheetHint}>Sustituye los diagramas por tus propias fotos (posición inicial, final o principal).</Text>
        {(["main", "start", "end"] as Slot[]).map((slot) => (
          <View key={slot} style={styles.slotRow}>
            <View style={styles.slotThumb}>
              {selOv?.[slot] ? (
                <Image source={{ uri: selOv[slot] }} style={{ width: 40, height: 52 }} contentFit="contain" />
              ) : (
                <Ionicons name="image-outline" size={22} color={colors.muted} />
              )}
            </View>
            <Text style={styles.slotLabel}>{slot === "main" ? "Principal" : slot === "start" ? "Inicio" : "Fin"}</Text>
            <Btn title="Elegir" small variant="secondary" icon="cloud-upload" onPress={() => selected && pick(selected, slot)} testID={`pick-${slot}`} />
          </View>
        ))}
        {selected && selOv && (selOv.main || selOv.start || selOv.end) ? (
          <Btn
            title="Quitar imágenes de este ejercicio"
            variant="ghost"
            icon="trash"
            onPress={() => { setImageOverride(selected, { main: undefined, start: undefined, end: undefined }); toast.show("Restablecido", "info"); }}
          />
        ) : null}
      </Sheet>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Btn title="Restablecer todas las imágenes" variant="secondary" icon="refresh" onPress={() => { resetImages(); toast.show("Diagramas restaurados", "info"); }} testID="reset-images" />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBtn: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.onSurface, textAlign: "center" },
  searchWrap: { padding: 16, paddingBottom: 0 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: 12, height: 46 },
  searchInput: { flex: 1, fontSize: 16, color: colors.onSurface },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 10 },
  thumb: { width: 56, height: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  rowName: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  rowMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  tagText: { fontSize: 11, fontWeight: "800" },
  sheetHint: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  slotThumb: { width: 52, height: 60, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  slotLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.onSurface },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
}));
