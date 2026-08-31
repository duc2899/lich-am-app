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

export default function ForgotPasswordScreen() {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
        </Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentText}>
              ✓ Nếu email "{email}" tồn tại trong hệ thống, bạn sẽ nhận được
              link đặt lại mật khẩu.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              style={[styles.input, !!error && styles.inputError]}
              placeholder="Email"
              placeholderTextColor="#999"
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
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSend}>
              <Text style={styles.submitText}>Gửi link đặt lại</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
          <Text style={styles.backLink}>‹ Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 40 },
  heading: { fontSize: 22, fontWeight: "700", color: "#222", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#D9364A" },
  errorText: { fontSize: 12, color: "#D9364A", marginBottom: 12, marginTop: 4 },
  submitBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sentBox: {
    backgroundColor: "#EAF7EE",
    borderRadius: 10,
    padding: 16,
  },
  sentText: { color: "#2E8B57", fontSize: 14, lineHeight: 20 },
  backWrap: { marginTop: 24, alignItems: "center" },
  backLink: { fontSize: 13, color: "#4A90D9", fontWeight: "600" },
});
