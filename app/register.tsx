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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>
          Để lưu và chia sẻ gia phả với người thân
        </Text>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialSignUp("Apple")}
        >
          <Ionicons
            name="logo-apple"
            size={20}
            color="#000"
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Đăng ký với Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialSignUp("Google")}
        >
          <Ionicons
            name="logo-google"
            size={18}
            color="#4285F4"
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Đăng ký với Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc dùng email</Text>
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
            <View style={styles.strengthBarTrack}>
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
          <Text style={[styles.reqItem, hasMinLength && styles.reqMet]}>
            {hasMinLength ? "✓" : "○"} Tối thiểu 6 ký tự
          </Text>
          <Text style={[styles.reqItem, hasUppercase && styles.reqMet]}>
            {hasUppercase ? "✓" : "○"} Có chữ hoa (khuyến nghị)
          </Text>
          <Text style={[styles.reqItem, hasNumber && styles.reqMet]}>
            {hasNumber ? "✓" : "○"} Có chữ số (khuyến nghị)
          </Text>
        </View>
        {error?.field === "password" && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            setAgreedTerms(!agreedTerms);
            setError(null);
          }}
        >
          <View
            style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}
          >
            {agreedTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Tôi đồng ý với{" "}
            <Text style={styles.linkText} onPress={() => {}}>
              Điều khoản sử dụng
            </Text>{" "}
            và{" "}
            <Text style={styles.linkText} onPress={() => {}}>
              Chính sách bảo mật
            </Text>
          </Text>
        </TouchableOpacity>
        {error?.field === "terms" && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setMarketingOptIn(!marketingOptIn)}
        >
          <View
            style={[styles.checkbox, marketingOptIn && styles.checkboxChecked]}
          >
            {marketingOptIn && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Gửi cho tôi tin tức và ưu đãi qua email (không bắt buộc)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
          <Text style={styles.submitText}>Đăng ký</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.bottomLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 40 },
  heading: { fontSize: 24, fontWeight: "700", color: "#222", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 24 },
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
    marginVertical: 18,
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
    marginBottom: 8,
    paddingRight: 12,
    backgroundColor: "#fff",
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 14, color: "#222" },
  eyeIcon: { fontSize: 18 },
  strengthWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  strengthBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  strengthBarFill: { height: "100%", borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: "700", width: 70 },
  requirements: { marginBottom: 8 },
  reqItem: { fontSize: 12, color: "#999", marginBottom: 3 },
  reqMet: { color: "#2E8B57" },
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
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  checkboxLabel: { flex: 1, fontSize: 13, color: "#444", lineHeight: 19 },
  linkText: { color: "#4A90D9", fontWeight: "600" },
  submitBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  bottomText: { fontSize: 13, color: "#666" },
  bottomLink: { fontSize: 13, color: "#4A90D9", fontWeight: "700" },
});
