import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

export default function WelcomeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const currentUser = useAuthStore((s) => s.currentUser);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const showToast = useToastStore((s) => s.showToast);
  const [resent, setResent] = useState(false);

  const handleResend = () => {
    setResent(true);
    showToast("Đã gửi lại email xác minh (giả lập)");
  };

  const handleVerifyNow = () => {
    verifyEmail();
    showToast("Đã xác minh email!");
  };

  const handleStart = () => {
    router.dismissAll();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>
      <Text style={styles.heading}>Chào mừng bạn!</Text>
      <Text style={styles.subtitle}>
        Tài khoản của bạn đã được tạo thành công.
      </Text>

      <View style={styles.verifyBox}>
        {currentUser?.emailVerified ? (
          <Text style={styles.verifiedText}>✓ Email đã được xác minh</Text>
        ) : (
          <>
            <Text style={styles.verifyText}>
              Chúng tôi đã gửi email xác minh tới{"\n"}
              <Text style={styles.emailText}>
                {email ?? currentUser?.email}
              </Text>
            </Text>
            <Text style={styles.verifyHint}>
              Bạn vẫn có thể dùng app ngay, không cần đợi xác minh xong.
            </Text>
            <View style={styles.verifyActions}>
              <TouchableOpacity onPress={handleResend} disabled={resent}>
                <Text style={styles.linkBtn}>
                  {resent ? "Đã gửi lại" : "Gửi lại email"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVerifyNow}>
                <Text style={styles.linkBtn}>Tôi đã xác minh (demo)</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startText}>Bắt đầu khám phá</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: "#222", marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 28,
  },
  verifyBox: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 32,
  },
  verifyText: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    lineHeight: 19,
  },
  emailText: { fontWeight: "700", color: "#222" },
  verifyHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: "#2E8B57",
    fontWeight: "700",
    textAlign: "center",
  },
  verifyActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  linkBtn: { fontSize: 13, color: "#4A90D9", fontWeight: "600" },
  startBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  startText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
