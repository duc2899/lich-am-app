import { useState, useMemo } from "react";
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
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";

type FieldError = {
  field?: "email" | "password" | "terms";
  message: string;
} | null;

function getPasswordStrength(password: string): {
  label: string;
  score: number;
  color: string;
} {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length === 0) return { label: "", score: 0, color: "#ddd" };
  if (score <= 1) return { label: "Yếu", score, color: "#D9364A" };
  if (score <= 3) return { label: "Trung bình", score, color: "#E0A800" };
  return { label: "Mạnh", score, color: "#2E8B57" };
}

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<FieldError>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSocialSignUp = (provider: string) => {
    showToast(
      `Đăng ký bằng ${provider} cần thiết lập OAuth thật — chưa khả dụng trong bản demo này.`,
      "error",
    );
  };

  const handleRegister = () => {
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError({ field: "email", message: "Email không hợp lệ" });
      return;
    }
    if (!hasMinLength) {
      setError({ field: "password", message: "Mật khẩu cần ít nhất 6 ký tự" });
      return;
    }
    if (!agreedTerms) {
      setError({
        field: "terms",
        message: "Vui lòng đồng ý với Điều khoản và Chính sách bảo mật",
      });
      return;
    }

    const result = register(email.trim(), password, marketingOptIn);
    if (!result.success) {
      setError({ field: "email", message: result.error ?? "Đăng ký thất bại" });
      return;
    }

    router.replace({ pathname: "/welcome", params: { email: email.trim() } });
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
            Tạo tài khoản
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Để lưu và chia sẻ gia phả với người thân
          </Text>

          <TouchableOpacity
            style={[styles.socialBtn, { borderColor: colors.border }]}
            onPress={() => handleSocialSignUp("Apple")}
          >
            <Ionicons
              name="logo-apple"
              size={20}
              color={colors.text}
              style={styles.socialIcon}
            />
            <Text style={[styles.socialText, { color: colors.text }]}>
              Đăng ký với Apple
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { borderColor: colors.border }]}
            onPress={() => handleSocialSignUp("Google")}
          >
            <Ionicons
              name="logo-google"
              size={18}
              color="#4285F4"
              style={styles.socialIcon}
            />
            <Text style={[styles.socialText, { color: colors.text }]}>
              Đăng ký với Google
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              hoặc dùng email
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
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
            >
              <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View
                style={[
                  styles.strengthBarTrack,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${Math.min((strength.score / 5) * 100, 100)}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          <View style={styles.requirements}>
            <Text
              style={[
                styles.reqItem,
                { color: colors.textSecondary },
                hasMinLength && { color: colors.success },
              ]}
            >
              {hasMinLength ? "✓" : "○"} Tối thiểu 6 ký tự
            </Text>
            <Text
              style={[
                styles.reqItem,
                { color: colors.textSecondary },
                hasUppercase && { color: colors.success },
              ]}
            >
              {hasUppercase ? "✓" : "○"} Có chữ hoa (khuyến nghị)
            </Text>
            <Text
              style={[
                styles.reqItem,
                { color: colors.textSecondary },
                hasNumber && { color: colors.success },
              ]}
            >
              {hasNumber ? "✓" : "○"} Có chữ số (khuyến nghị)
            </Text>
          </View>
          {error?.field === "password" && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error.message}
            </Text>
          )}

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              setAgreedTerms(!agreedTerms);
              setError(null);
            }}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.border },
                agreedTerms && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              {agreedTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Tôi đồng ý với{" "}
              <Text
                style={[styles.linkText, { color: colors.primary }]}
                onPress={() => {}}
              >
                Điều khoản sử dụng
              </Text>{" "}
              và{" "}
              <Text
                style={[styles.linkText, { color: colors.primary }]}
                onPress={() => {}}
              >
                Chính sách bảo mật
              </Text>
            </Text>
          </TouchableOpacity>
          {error?.field === "terms" && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error.message}
            </Text>
          )}

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setMarketingOptIn(!marketingOptIn)}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.border },
                marketingOptIn && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              {marketingOptIn && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Gửi cho tôi tin tức và ưu đãi qua email (không bắt buộc)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
          >
            <Text style={styles.submitText}>Đăng ký</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              Đã có tài khoản?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.bottomLink, { color: colors.primary }]}>
                Đăng nhập
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
  subtitle: { fontSize: 13, marginBottom: 24 },
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
    marginVertical: 18,
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
    marginBottom: 8,
    paddingRight: 12,
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 14 },
  eyeIcon: { fontSize: 18 },
  strengthWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  strengthBarTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  strengthBarFill: { height: "100%", borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: "700", width: 70 },
  requirements: { marginBottom: 8 },
  reqItem: { fontSize: 12, marginBottom: 3 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  checkboxLabel: { flex: 1, fontSize: 13, lineHeight: 19 },
  linkText: { fontWeight: "600" },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  bottomText: { fontSize: 13 },
  bottomLink: { fontSize: 13, fontWeight: "700" },
});
