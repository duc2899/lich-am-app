import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useToastStore } from "../store/toastStore";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    // Giả lập -- chưa có backend gửi email thật
    setSent(true);
    showToast("Đã gửi email đặt lại mật khẩu (giả lập)");
  };

  return (
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.heading, { color: colors.text }]}>
            Quên mật khẩu
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </Text>

          {sent ? (
            <View
              style={[
                styles.sentBox,
                { backgroundColor: colors.success + "22" },
              ]}
            >
              <Text style={[styles.sentText, { color: colors.success }]}>
                ✓ Nếu email "{email}" tồn tại trong hệ thống, bạn sẽ nhận được
                link đặt lại mật khẩu.
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                  !!error && { borderColor: colors.danger },
                ]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              {!!error && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {error}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSend}
              >
                <Text style={styles.submitText}>Gửi link đặt lại</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backWrap}
          >
            <Text style={[styles.backLink, { color: colors.primary }]}>
              ‹ Quay lại đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 40 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 13, marginBottom: 28, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 14,
  },
  errorText: { fontSize: 12, marginBottom: 12, marginTop: 4 },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sentBox: {
    borderRadius: 10,
    padding: 16,
  },
  sentText: { fontSize: 14, lineHeight: 20 },
  backWrap: { marginTop: 24, alignItems: "center" },
  backLink: { fontSize: 13, fontWeight: "600" },
});
