import { useState, useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "../components/Toast";
import AppSplashScreen from "../components/AppSplashScreen";
import OnboardingScreen from "../components/OnboardingScreen";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { useEventStore } from "../store/eventStore";

const ONBOARDING_KEY = "hasSeenOnboarding";

// Tách riêng component này để có thể gọi useTheme() -- chỉ dùng được bên trong <ThemeProvider>
function AppContent({
  showSplash,
  needsOnboarding,
  onFinishOnboarding,
}: {
  showSplash: boolean;
  needsOnboarding: boolean | null;
  onFinishOnboarding: () => void;
}) {
  const { isDark } = useTheme();
  const resyncLunarNotifications = useEventStore(
    (s) => s.resyncLunarNotifications,
  );
  // "light" = icon trắng (dùng khi nền tối), "dark" = icon đen (dùng khi nền sáng)
  const statusBarStyle = isDark ? "light" : "dark";

  const readyToUseApp = !showSplash && needsOnboarding === false;

  // Mỗi lần thực sự vào được app (không phải lúc splash/onboarding) -> rà lại xem có
  // sự kiện âm lịch nào cần tính lại ngày cho lần diễn ra kế tiếp không.
  useEffect(() => {
    if (readyToUseApp) {
      resyncLunarNotifications();
    }
  }, [readyToUseApp]);

  if (showSplash || needsOnboarding === null) {
    return (
      <>
        <StatusBar style={statusBarStyle} />
        <AppSplashScreen />
      </>
    );
  }

  if (needsOnboarding) {
    return (
      <>
        <StatusBar style={statusBarStyle} />
        <OnboardingScreen onFinish={onFinishOnboarding} />
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={statusBarStyle} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: "modal" }} />
        <Stack.Screen name="register" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="forgot-password"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="welcome"
          options={{ presentation: "modal", gestureEnabled: false }}
        />
      </Stack>
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  // null = chưa đọc xong AsyncStorage; true/false = đã biết trạng thái thật
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        setNeedsOnboarding(value !== "true");
      })
      .catch(() => {
        // Lỗi đọc storage -> mặc định không ép xem lại onboarding, tránh chặn user vào app
        setNeedsOnboarding(false);
      });
  }, []);

  const handleFinishOnboarding = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(() => {});
    setNeedsOnboarding(false);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent
          showSplash={showSplash}
          needsOnboarding={needsOnboarding}
          onFinishOnboarding={handleFinishOnboarding}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
