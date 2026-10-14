import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { normalizePhone, verifyLoginCode } from "../api/client";
import type { CasaUser, Language, UserRole } from "../api/client";
import { t } from "../i18n/strings";
import CasaLogo from "../components/CasaLogo";
import GateBackButton from "../components/GateBackButton";
import { completeLogin } from "./completeLogin";
import { fontFamily } from "../theme/fonts";
import { radii, spacing, type ColorTokens } from "../theme/casa";
import { screenInsets } from "../theme/insets";
import { useCasaTheme } from "../theme/ThemeContext";

const OTP_LEN = 6;

interface Props {
  role: UserRole;
  referrer?: string;
  phone: string;
  email: string;
  expiresInSec: number;
  onBack: () => void;
  onLoggedIn: (
    token: string,
    user: CasaUser | null,
    needsSignup: boolean,
    phone: string,
    language: Language
  ) => void;
}

export default function EmailCodeScreen({
  role,
  referrer,
  phone,
  email,
  expiresInSec,
  onBack,
  onLoggedIn,
}: Props) {
  const { colors, gradient } = useCasaTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const m = t("en");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<Array<TextInput | null>>([]);
  const mins = Math.max(1, Math.round(expiresInSec / 60));

  useEffect(() => {
    const timer = setTimeout(() => otpRefs.current[0]?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  async function verifyWith(codeValue: string) {
    if (codeValue.length < OTP_LEN || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await verifyLoginCode(phone, codeValue);
      const normalized = res.phone || normalizePhone(phone);
      const done = await completeLogin({
        token: res.token,
        user: res.user,
        needsSignup: res.needsSignup,
        phone: normalized,
        language: "en",
        role,
        referrer,
      });
      onLoggedIn(res.token, done.user, done.needsSignup, normalized, "en");
    } catch (e) {
      setError(e instanceof Error ? e.message : m.errorGeneric);
      setCode("");
      setBusy(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }

  function setOtpDigit(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length > 1) {
      const next = digits.slice(0, OTP_LEN);
      setCode(next);
      otpRefs.current[Math.min(next.length, OTP_LEN - 1)]?.focus();
      if (next.length === OTP_LEN) void verifyWith(next);
      return;
    }
    const chars = code.padEnd(OTP_LEN, " ").split("");
    chars[index] = digits.slice(-1) || " ";
    const next = chars.join("").replace(/ /g, "").slice(0, OTP_LEN);
    setCode(next);
    if (digits && index < OTP_LEN - 1) otpRefs.current[index + 1]?.focus();
    if (next.length === OTP_LEN) void verifyWith(next);
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...gradient.header]} style={[styles.top, { paddingTop: screenInsets().top }]}>
        <View style={styles.backWrap}>
          <GateBackButton label={m.goBack} onPress={onBack} />
        </View>
        <View style={styles.hero}>
          <CasaLogo width={200} />
          <Text style={styles.tagline}>{m.codeLabel}</Text>
        </View>
      </LinearGradient>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.card}>
          <Text style={styles.hint}>{m.codeHintEmail(email, mins)}</Text>
          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LEN }).map((_, i) => (
              <TextInput
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                style={styles.otpBox}
                value={code[i] ?? ""}
                onChangeText={(v) => setOtpDigit(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && !code[i] && i > 0) {
                    otpRefs.current[i - 1]?.focus();
                    setCode((prev) => prev.slice(0, i - 1));
                  }
                }}
                keyboardType="number-pad"
                maxLength={i === 0 ? OTP_LEN : 1}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                editable={!busy}
              />
            ))}
          </View>
          {busy ? <Text style={styles.busy}>{m.flowWorking}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
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
      fontSize: 20,
      color: c.onDark,
      marginTop: spacing.sm,
      fontFamily: fontFamily.bold,
    },
    card: {
      backgroundColor: c.paper,
      borderRadius: radii.lg,
      padding: spacing.xl,
    },
    hint: {
      fontSize: 15,
      color: c.inkSoft,
      marginBottom: spacing.xl,
      lineHeight: 22,
      fontFamily: fontFamily.regular,
    },
    otpRow: { flexDirection: "row", gap: 8, marginBottom: spacing.lg },
    otpBox: {
      flex: 1,
      height: 56,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.lineStrong,
      backgroundColor: c.paper2,
      textAlign: "center",
      fontSize: 22,
      fontWeight: "700",
      color: c.ink,
      fontFamily: fontFamily.bold,
    },
    busy: { textAlign: "center", color: c.leaf, fontFamily: fontFamily.semibold },
    error: { marginTop: spacing.md, color: c.danger, fontSize: 14, lineHeight: 20, fontFamily: fontFamily.medium },
  });
}
