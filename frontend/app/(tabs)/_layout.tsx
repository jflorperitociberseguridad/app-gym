import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { makeStyles, radius, useTheme } from "@/src/theme";

export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useStyles();
  const icon = (name: string) => ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name as any} size={size} color={color} />
    </View>
  );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 7,
          ...(Platform.OS === "web" ? { height: 72, paddingBottom: 8 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center", paddingTop: 2 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="biblioteca" options={{ title: "Biblioteca", tabBarIcon: icon("barbell") }} />
      <Tabs.Screen name="rutinas" options={{ title: "Rutinas", tabBarIcon: icon("list") }} />
      <Tabs.Screen name="progreso" options={{ title: "Progreso", tabBarIcon: icon("stats-chart") }} />
      <Tabs.Screen name="ajustes" options={{ title: "Ajustes", tabBarIcon: icon("settings") }} />
    </Tabs>
  );
}

const useStyles = makeStyles((colors) => ({
  iconWrap: {
    width: 42,
    height: 30,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.brandTertiary,
  },
}));
