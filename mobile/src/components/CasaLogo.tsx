import { Image, type ImageStyle } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

const mark = require("../../assets/casa_logo_mark.png");

/** Casa master mark — square house icon */
export default function CasaLogo({
  width = 56,
  style,
}: {
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={mark}
        style={[styles.img, { width, height: width }] as StyleProp<ImageStyle>}
        contentFit="contain"
        accessibilityLabel="Casa Congo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "flex-start" },
  img: { borderRadius: 12 },
});
