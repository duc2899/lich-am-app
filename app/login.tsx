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
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";

type FieldError = { field?: "email" | "password"; message: string } | null;

export default function LoginScreen() {
  const { colors } = useTheme();
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
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.heading, { color: colors.text }]}>
            Đăng nhập
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Đăng nhập để cùng người thân chỉnh sửa chung 1 cây gia phả
          </Text>

          <TouchableOpacity
            style={[styles.socialBtn, { borderColor: colors.border }]}
            onPress={() => handleSocialSignIn("Apple")}
          >
            <Ionicons
              name="logo-apple"
              size={20}
              color={colors.text}
              style={styles.socialIcon}
            />
            <Text style={[styles.socialText, { color: colors.text }]}>
              Tiếp tục với Apple
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { borderColor: colors.border }]}
            onPress={() => handleSocialSignIn("Google")}
          >
            <Ionicons
              name="logo-google"
              size={18}
              color="#4285F4"
              style={styles.socialIcon}
            />
            <Text style={[styles.socialText, { color: colors.text }]}>
              Tiếp tục với Google
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              hoặc
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
              error?.field === "email" && { borderColor: colors.danger },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
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
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error.message}
            </Text>
          )}

          <View
            style={[
              styles.passwordRow,
              { borderColor: colors.border, backgroundColor: colors.surface },
              error?.field === "password" && { borderColor: colors.danger },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              placeholder="Mật khẩu"
              placeholderTextColor={colors.textSecondary}
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
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error.message}
            </Text>
          )}
          {error && !error.field && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            style={styles.forgotWrap}
          >
            <Text style={[styles.forgotLink, { color: colors.primary }]}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.submitText}>Đăng nhập</Text>
          </TouchableOpacity>

          {lastAuthenticatedEmail && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometric}
            >
              <Text style={[styles.biometricText, { color: colors.primary }]}>
                🔐 Đăng nhập bằng Face ID / Vân tay
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              Chưa có tài khoản?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={[styles.bottomLink, { color: colors.primary }]}>
                Đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 40 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 28, lineHeight: 19 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 10,
  },
  socialIcon: { marginRight: 10 },
  socialText: { fontSize: 14, fontWeight: "600" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 14,
  },
  errorText: { fontSize: 12, marginBottom: 12, marginTop: 4 },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    paddingRight: 12,
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 14 },
  eyeIcon: { fontSize: 18 },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 20, marginTop: 8 },
  forgotLink: { fontSize: 13, fontWeight: "600" },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  biometricBtn: { marginTop: 16, alignItems: "center", paddingVertical: 10 },
  biometricText: { fontWeight: "600", fontSize: 14 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  bottomText: { fontSize: 13 },
  bottomLink: { fontSize: 13, fontWeight: "700" },
});
