import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamily } from "../theme/fonts";
import { useCasaTheme } from "../theme/ThemeContext";

interface Props {
  label: string;
  onPress: () => void;
}

export default function GateBackButton({ label, onPress }: Props) {
  const { colors } = useCasaTheme();
  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.row} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name="chevron-back" size={22} color={colors.onDark} />
      <Text style={[styles.label, { color: colors.onDark }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingVertical: 8 },
  label: { fontSize: 16, fontWeight: "600", fontFamily: fontFamily.semibold },
});
