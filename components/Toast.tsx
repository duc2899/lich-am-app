import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useToastStore } from "../store/toastStore";

export default function Toast() {
  const message = useToastStore((s) => s.message);
  const hideToast = useToastStore((s) => s.hideToast);
  const opacity = useRef(new Animated.Value(0)).current;

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
    }, 2000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View style={[styles.toast, { opacity }]}>
        <Text style={styles.text}>✓ {message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    backgroundColor: "#2E8B57",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    maxWidth: "85%",
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 13, textAlign: "center" },
});
