import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

type FieldError = { field?: "email" | "password"; message: string } | null;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loginWithBiometric = useAuthStore((s) => s.loginWithBiometric);
  const lastAuthenticatedEmail = useAuthStore((s) => s.lastAuthenticatedEmail);
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<FieldError>(null);

  const handleLogin = () => {
    setError(null);
    if (!email.trim()) {
      setError({ field: "email", message: "Vui lòng nhập email" });
      return;
    }
    if (!password) {
      setError({ field: "password", message: "Vui lòng nhập mật khẩu" });
      return;
    }

    const result = login(email.trim(), password);
    if (!result.success) {
      if (result.error === "email_not_found") {
        setError({ field: "email", message: "Email này chưa được đăng ký" });
      } else {
        setError({
          field: "password",
          message: "Sai mật khẩu, vui lòng thử lại",
        });
      }
      return;
    }

    showToast(`Xin chào, ${email.trim()}!`);
    router.back();
  };

  const handleBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      showToast("Thiết bị chưa cài đặt Face ID / vân tay", "warning");
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Xác thực để đăng nhập",
      cancelLabel: "Huỷ",
    });
    if (result.success) {
      const loginResult = loginWithBiometric();
      if (loginResult.success) {
        showToast("Đăng nhập bằng sinh trắc học thành công");
        router.back();
      }
    }
  };

  const handleSocialSignIn = (provider: string) => {
    showToast(
      `Đăng nhập bằng ${provider} cần thiết lập OAuth thật — chưa khả dụng trong bản demo này.`,
      "error",
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Đăng nhập</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để cùng người thân chỉnh sửa chung 1 cây gia phả
        </Text>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialSignIn("Apple")}
        >
          <Ionicons
            name="logo-apple"
            size={20}
            color="#000"
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Tiếp tục với Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialSignIn("Google")}
        >
          <Ionicons
            name="logo-google"
            size={18}
            color="#4285F4"
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Tiếp tục với Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={[styles.input, error?.field === "email" && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {error?.field === "email" && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}

        <View
          style={[
            styles.passwordRow,
            error?.field === "password" && styles.inputError,
          ]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="Mật khẩu"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError(null);
            }}
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
          >
            <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>
        {error?.field === "password" && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        {error && !error.field && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}

        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgotLink}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleLogin}>
          <Text style={styles.submitText}>Đăng nhập</Text>
        </TouchableOpacity>

        {lastAuthenticatedEmail && (
          <TouchableOpacity
            style={styles.biometricBtn}
            onPress={handleBiometric}
          >
            <Text style={styles.biometricText}>
              🔐 Đăng nhập bằng Face ID / Vân tay
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.bottomLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 40 },
  heading: { fontSize: 24, fontWeight: "700", color: "#222", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 19 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 10,
  },
  socialIcon: { marginRight: 10 },
  socialText: { fontSize: 14, fontWeight: "600", color: "#222" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e5e5" },
  dividerText: { marginHorizontal: 10, fontSize: 12, color: "#999" },
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 4,
    paddingRight: 12,
    backgroundColor: "#fff",
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 14, color: "#222" },
  eyeIcon: { fontSize: 18 },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 20, marginTop: 8 },
  forgotLink: { fontSize: 13, color: "#4A90D9", fontWeight: "600" },
  submitBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  biometricBtn: { marginTop: 16, alignItems: "center", paddingVertical: 10 },
  biometricText: { color: "#4A90D9", fontWeight: "600", fontSize: 14 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  bottomText: { fontSize: 13, color: "#666" },
  bottomLink: { fontSize: 13, color: "#4A90D9", fontWeight: "700" },
});
