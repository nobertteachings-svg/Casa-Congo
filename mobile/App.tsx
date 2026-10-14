import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import type { CasaUser, Language, UserRole } from "./src/api/client";
import { bootstrapSession, getMe, unregisterDeviceTokens, updateAppLanguage } from "./src/api/client";
import { registerForPushNotifications } from "./src/notifications/register";
import { pushInboxItem } from "./src/storage/notification-inbox";
import { clearAuth, loadAuth } from "./src/storage/auth";
import { loadLanguagePref, saveLanguagePref } from "./src/storage/language";
import RoleScreen from "./src/screens/RoleScreen";
import LoginScreen from "./src/screens/LoginScreen";
import EmailCodeScreen from "./src/screens/EmailCodeScreen";
import MainShell from "./src/screens/MainShell";
import { parseListingIdFromUrl } from "./src/utils/deep-link";
import { hydrateApiBase } from "./src/config";
import { CasaThemeProvider, useCasaTheme } from "./src/theme/ThemeContext";

type GateStep = "role" | "login" | "code";

export default function App() {
  const [fontsLoaded] = useFonts(
    Platform.OS === "android"
      ? {}
      : {
          PlusJakartaSans_400Regular,
          PlusJakartaSans_500Medium,
          PlusJakartaSans_600SemiBold,
          PlusJakartaSans_700Bold,
          PlusJakartaSans_800ExtraBold,
        }
  );

  return (
    <CasaThemeProvider>
      <AppBody fontsLoaded={fontsLoaded} />
    </CasaThemeProvider>
  );
}

function AppBody({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { gradient, colors } = useCasaTheme();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<CasaUser | null>(null);
  const [needsSignup, setNeedsSignup] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<Language>("en");
  const [pendingListingId, setPendingListingId] = useState<string | null>(null);
  const [gateStep, setGateStep] = useState<GateStep>("role");
  const [pendingRole, setPendingRole] = useState<UserRole>("tenant");
  const [pendingReferrer, setPendingReferrer] = useState<string | undefined>();
  const [pendingCode, setPendingCode] = useState<{
    phone: string;
    email: string;
    expiresInSec: number;
  } | null>(null);
  const notificationSub = useRef<Notifications.Subscription | null>(null);
  const responseSub = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    responseSub.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const houseId = response.notification.request.content.data?.houseId;
      if (typeof houseId === "string" && houseId.length > 0) {
        setPendingListingId(houseId.toUpperCase());
      }
    });
    notificationSub.current = Notifications.addNotificationReceivedListener((notification) => {
      const houseId = notification.request.content.data?.houseId;
      const title = notification.request.content.title ?? "Casa";
      const body = notification.request.content.body ?? "";
      void pushInboxItem({
        title: String(title),
        body: String(body),
        houseId: typeof houseId === "string" ? houseId.toUpperCase() : undefined,
        receivedAt: new Date().toISOString(),
      });
    });
    return () => {
      notificationSub.current?.remove();
      responseSub.current?.remove();
    };
  }, []);

  useEffect(() => {
    function openListingFromUrl(url: string) {
      const houseId = parseListingIdFromUrl(url);
      if (houseId) setPendingListingId(houseId);
    }

    const sub = Linking.addEventListener("url", ({ url }) => openListingFromUrl(url));
    void Linking.getInitialURL().then((url) => {
      if (url) openListingFromUrl(url);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await hydrateApiBase();
        const pref = await loadLanguagePref();
        if (pref) setUiLanguage(pref);

        const saved = await loadAuth();
        if (!saved) return;
        const me = await getMe(saved.token);
        setToken(saved.token);
        setPhone(saved.phone);
        setUser(me.user);
        setNeedsSignup(me.needsSignup);
        const nextLang: Language = "en";
        setUiLanguage(nextLang);
        await saveLanguagePref(nextLang);
        if (me.needsSignup) {
          await bootstrapSession(saved.token, nextLang);
        }
        void registerForPushNotifications(saved.token);
      } catch {
        await clearAuth();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLoggedIn = useCallback(
    async (t: string, u: CasaUser | null, signup: boolean, savedPhone: string) => {
      setToken(t);
      setUser(u ? { ...u, language: "en" } : u);
      setNeedsSignup(signup);
      setPhone(savedPhone);
      const nextLang: Language = "en";
      setUiLanguage(nextLang);
      await saveLanguagePref(nextLang);
      void registerForPushNotifications(t);
    },
    []
  );

  const handleUserUpdate = useCallback((u: CasaUser | null, signup: boolean) => {
    setUser(u ? { ...u, language: "en" } : u);
    setNeedsSignup(signup);
    setUiLanguage("en");
  }, []);

  const handleLanguageChange = useCallback(async (_lang: Language) => {
    const next: Language = "en";
    setUiLanguage(next);
    await saveLanguagePref(next);
    if (token) {
      try {
        const res = await updateAppLanguage(token, next);
        if (res.user) setUser(res.user);
      } catch {
        /* keep local preference */
      }
    }
  }, [token]);

  const handleLogout = useCallback(async () => {
    if (token) {
      try {
        await unregisterDeviceTokens(token);
      } catch {
        /* ignore */
      }
    }
    await clearAuth();
    setToken(null);
    setUser(null);
    setPhone("");
    setNeedsSignup(false);
    setGateStep("role");
    setPendingReferrer(undefined);
    setPendingCode(null);
  }, [token]);

  if (loading || !fontsLoaded) {
    return (
      <LinearGradient colors={[...gradient.hero]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.leafBright} />
        <StatusBar style="light" />
      </LinearGradient>
    );
  }

  if (!token) {
    if (gateStep === "role") {
      return (
        <>
          <RoleScreen
            onPick={(role, referrer) => {
              setPendingRole(role);
              setPendingReferrer(referrer);
              setGateStep("login");
            }}
          />
          <StatusBar style="light" />
        </>
      );
    }
    if (gateStep === "code" && pendingCode) {
      return (
        <>
          <EmailCodeScreen
            role={pendingRole}
            referrer={pendingReferrer}
            phone={pendingCode.phone}
            email={pendingCode.email}
            expiresInSec={pendingCode.expiresInSec}
            onBack={() => setGateStep("login")}
            onLoggedIn={(authToken, u, s, p) => void handleLoggedIn(authToken, u, s, p)}
          />
          <StatusBar style="light" />
        </>
      );
    }
    return (
      <>
        <LoginScreen
          role={pendingRole}
          referrer={pendingReferrer}
          onBack={() => setGateStep("role")}
          onNeedCode={(info) => {
            setPendingCode(info);
            setGateStep("code");
          }}
          onLoggedIn={(authToken, u, s, p) => void handleLoggedIn(authToken, u, s, p)}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <MainShell
        token={token}
        phone={phone}
        user={user}
        needsSignup={needsSignup}
        uiLanguage={uiLanguage}
        onUserUpdate={handleUserUpdate}
        onLanguageChange={handleLanguageChange}
        onLogout={() => void handleLogout()}
        pendingListingId={pendingListingId}
        onPendingListingHandled={() => setPendingListingId(null)}
        onNeedLogin={() => {
          setGateStep("login");
        }}
      />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
