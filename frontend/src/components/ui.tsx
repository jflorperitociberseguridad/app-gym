import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import Ionicons from "@react-native-vector-icons/ionicons";

import { KneeSafety } from "@/src/types";
import { makeStyles, radius, useTheme } from "@/src/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Btn({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  testID,
  style,
  small,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const bg: Record<Variant, string> = {
    primary: colors.brandPrimary,
    secondary: colors.surfaceTertiary,
    ghost: "transparent",
    danger: colors.error,
  };
  const fg: Record<Variant, string> = {
    primary: colors.onBrandPrimary,
    secondary: colors.onSurfaceTertiary,
    ghost: colors.brandPrimary,
    danger: colors.onError,
  };
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg[variant], opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        variant === "ghost" && { borderWidth: 1.5, borderColor: colors.brandPrimary },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon as any} size={small ? 16 : 20} color={fg[variant]} /> : null}
      <Text style={[styles.btnText, small && { fontSize: 14 }, { color: fg[variant] }]}>{title}</Text>
    </Pressable>
  );
}

type Tone = "brand" | "success" | "warning" | "error" | "neutral";

export function Badge({ label, tone = "neutral", icon }: { label: string; tone?: Tone; icon?: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const map: Record<Tone, { bg: string; fg: string }> = {
    brand: { bg: colors.brandTertiary, fg: colors.onBrandTertiary },
    success: { bg: colors.brandTertiary, fg: colors.success },
    warning: { bg: colors.brandTertiary, fg: colors.warning },
    error: { bg: colors.brandTertiary, fg: colors.error },
    neutral: { bg: colors.surfaceTertiary, fg: colors.onSurfaceTertiary },
  };
  return (
    <View style={[styles.badge, { backgroundColor: map[tone].bg }]}>
      {icon ? <Ionicons name={icon as any} size={12} color={map[tone].fg} /> : null}
      <Text style={[styles.badgeText, { color: map[tone].fg }]}>{label}</Text>
    </View>
  );
}

export function KneeBadge({ safety }: { safety: KneeSafety }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const cfg =
    safety === "permitido"
      ? { bg: colors.success, icon: "checkmark-circle", label: "Rodilla OK" }
      : safety === "precaucion"
        ? { bg: colors.warning, icon: "alert-circle", label: "Precaución" }
        : { bg: colors.error, icon: "close-circle", label: "Bloqueado" };
  return (
    <View style={[styles.kneeBadge, { backgroundColor: cfg.bg }]} testID={`knee-badge-${safety}`}>
      <Ionicons name={cfg.icon as any} size={12} color="#FFFFFF" />
      <Text style={styles.kneeBadgeText}>{cfg.label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.segment} testID={testID}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            testID={`segment-${o.key}`}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.key);
            }}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.empty} testID="empty-state">
      <View style={styles.emptyIcon}>
        <Ionicons name={icon as any} size={40} color={colors.muted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMsg}>{message}</Text>
      {actionLabel && onAction ? (
        <Btn title={actionLabel} onPress={onAction} icon="add" style={{ marginTop: 16 }} testID="empty-action" />
      ) : null}
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix,
  testID,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const set = (v: number) => onChange(Math.max(min, Math.min(max, Math.round(v * 100) / 100)));
  return (
    <View style={styles.stepper} testID={testID}>
      <Pressable style={styles.stepBtn} onPress={() => set(value - step)} testID={testID ? `${testID}-minus` : undefined}>
        <Ionicons name="remove" size={20} color={colors.onSurface} />
      </Pressable>
      <Text style={styles.stepValue}>
        {value}
        {suffix ? ` ${suffix}` : ""}
      </Text>
      <Pressable style={styles.stepBtn} onPress={() => set(value + step)} testID={testID ? `${testID}-plus` : undefined}>
        <Ionicons name="add" size={20} color={colors.onSurface} />
      </Pressable>
    </View>
  );
}

export function Field({
  label,
  style,
  ...props
}: { label?: string; style?: StyleProp<ViewStyle> } & TextInputProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={style}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
  testID,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
}) {
  const styles = useStyles();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet} testID={testID}>
          <View style={styles.handle} />
          {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>{children}</View>;
}

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.brandPrimary} size="large" />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  btnSmall: { height: 40, paddingHorizontal: 14, borderRadius: radius.sm },
  btnText: { fontSize: 16, fontWeight: "800" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  kneeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  kneeBadgeText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  segmentItemActive: { backgroundColor: colors.surface },
  segmentText: { fontSize: 14, fontWeight: "700", color: colors.muted },
  segmentTextActive: { color: colors.onSurface },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: colors.onSurface, textAlign: "center" },
  emptyMsg: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: 4,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "800", color: colors.onSurface },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: colors.onSurfaceSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheetWrap: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
}));
