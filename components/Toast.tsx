import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useToastStore, ToastType } from "../store/toastStore";

const TOAST_CONFIG: Record<
  ToastType,
  { icon: string; color: string; duration: number }
> = {
  success: { icon: "✓", color: "#2E8B57", duration: 2000 },
  warning: { icon: "⚠️", color: "#B8860B", duration: 3000 },
  error: { icon: "✕", color: "#D9364A", duration: 3000 },
};

export default function Toast() {
  const message = useToastStore((s) => s.message);
  const type = useToastStore((s) => s.type);
  const hideToast = useToastStore((s) => s.hideToast);
  const opacity = useRef(new Animated.Value(0)).current;

  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (!message) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        hideToast();
      });
    }, config.duration);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const content = (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View
        style={[styles.toast, { opacity, backgroundColor: config.color }]}
      >
        <Text style={styles.text}>
          {config.icon} {message}
        </Text>
      </Animated.View>
    </View>
  );

  // iOS: modal của expo-router (react-native-screens) tạo ra 1 UIWindow riêng, che mất
  // View thường dù zIndex cao cỡ nào. FullWindowOverlay được chính react-native-screens làm ra
  // để giải quyết đúng bài toán này -- render lên trên TOÀN BỘ, kể cả modal đang mở.
  if (Platform.OS === "ios") {
    return <FullWindowOverlay>{content}</FullWindowOverlay>;
  }

  // Android không có vấn đề layer giống iOS -- absolute + elevation cao là đủ.
  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    elevation: 999,
  },
  toast: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    maxWidth: "85%",
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 13, textAlign: "center" },
});
