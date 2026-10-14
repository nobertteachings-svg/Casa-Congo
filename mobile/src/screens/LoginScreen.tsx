import { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { requestLoginCode } from "../api/client";
import type { CasaUser, Language, UserRole } from "../api/client";
import { normalizeCongoPhone } from "../utils/congo-phone";
import { t } from "../i18n/strings";
import CasaButton from "../components/CasaButton";
import CasaLogo from "../components/CasaLogo";
import GateBackButton from "../components/GateBackButton";
import { completeLogin } from "./completeLogin";
import { fontFamily } from "../theme/fonts";
import { radii, spacing, type ColorTokens } from "../theme/casa";
import { screenInsets } from "../theme/insets";
import { useCasaTheme } from "../theme/ThemeContext";

interface Props {
  role: UserRole;
  referrer?: string;
  onBack: () => void;
  onNeedCode: (info: { phone: string; email: string; expiresInSec: number }) => void;
  onLoggedIn: (
    token: string,
    user: CasaUser | null,
    needsSignup: boolean,
    phone: string,
    language: Language
  ) => void;
}

export default function LoginScreen({ role, referrer, onBack, onNeedCode, onLoggedIn }: Props) {
  const { colors, gradient } = useCasaTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const m = t("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("243");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canSend = Boolean(normalizeCongoPhone(phone) || phone.replace(/\D/g, "").length >= 8);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  async function sendCode() {
    setBusy(true);
    setError("");
    try {
      const res = await requestLoginCode(phone, "en", { name, email });
      if (res.delivery === "existing_user" && res.token) {
        const normalized = res.user?.phone || phone.replace(/\D/g, "");
        const done = await completeLogin({
          token: res.token,
          user: res.user ?? null,
          needsSignup: res.needsSignup ?? false,
          phone: normalized,
          language: "en",
          role,
          referrer,
        });
        onLoggedIn(res.token, done.user, done.needsSignup, normalized, "en");
        return;
      }
      onNeedCode({
        phone,
        email: res.email || email,
        expiresInSec: res.expiresIn,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : m.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...gradient.header]} style={[styles.top, { paddingTop: screenInsets().top }]}>
        <View style={styles.backWrap}>
          <GateBackButton label={m.goBack} onPress={onBack} />
        </View>
        <View style={styles.hero}>
          <CasaLogo width={200} />
          <Text style={styles.tagline}>{m.loginSubtitle}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>{m.nameLabel}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Grace Mbala"
            placeholderTextColor={colors.mutedLight}
          />
          <Text style={styles.label}>{m.emailLabel}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            placeholder="vous@email.com"
            placeholderTextColor={colors.mutedLight}
          />
          <Text style={styles.label}>{m.phoneLabel}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="243810000001"
            placeholderTextColor={colors.mutedLight}
          />
          <Text style={styles.note}>{m.phoneNote}</Text>
          <CasaButton label={m.sendCode} onPress={() => void sendCode()} loading={busy} disabled={!canSend} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(c: ColorTokens) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.paper2 },
    top: { paddingBottom: spacing.xl },
    backWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    flex: { flex: 1, paddingHorizontal: spacing.lg, marginTop: -20 },
    hero: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
    tagline: {
      fontSize: 16,
      color: c.onDarkMuted,
      marginTop: spacing.sm,
      lineHeight: 24,
      maxWidth: 320,
      fontFamily: fontFamily.regular,
    },
    card: {
      backgroundColor: c.paper,
      borderRadius: radii.lg,
      padding: spacing.xl,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: c.inkSoft,
      marginBottom: spacing.sm,
      fontFamily: fontFamily.semibold,
    },
    input: {
      backgroundColor: c.paper2,
      borderWidth: 1,
      borderColor: c.lineStrong,
      borderRadius: radii.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      fontSize: 17,
      marginBottom: spacing.md,
      color: c.ink,
      fontFamily: fontFamily.regular,
    },
    note: {
      fontSize: 13,
      color: c.muted,
      marginBottom: spacing.sm,
      lineHeight: 19,
      fontFamily: fontFamily.regular,
    },
    error: { marginTop: spacing.lg, color: c.danger, fontSize: 14, lineHeight: 20, fontFamily: fontFamily.medium },
  });
}
