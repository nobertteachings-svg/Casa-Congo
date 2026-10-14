import { Platform } from "react-native";

/** Plus Jakarta Sans from Google Fonts drops spaces on many Android devices. */
const ios = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

const android = {
  regular: "sans-serif",
  medium: "sans-serif-medium",
  semibold: "sans-serif-medium",
  bold: "sans-serif-medium",
  extrabold: "sans-serif-medium",
} as const;

export const fontFamily = Platform.OS === "android" ? android : ios;
