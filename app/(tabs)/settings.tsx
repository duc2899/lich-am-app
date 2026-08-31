import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import SettingsSection from "../../components/SettingsSection";
import SettingsRow from "../../components/SettingsRow";
import ToggleButton from "../../components/ToggleButton";
import { useFamilyStore } from "../../store/familyStore";
import { useEventStore } from "../../store/eventStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import { useTheme, ThemeMode } from "../../context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const clearFamilyData = useFamilyStore((s) => s.clearAll);
  const clearAllEvents = useEventStore((s) => s.clearAllEvents);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore(
    (s) => s.setNotificationsEnabled,
  );
  const showToast = useToastStore((s) => s.showToast);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const { mode, setMode, colors } = useTheme();

  const appVersion = Constants.expoConfig?.version ?? "—";

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất?", "", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout();
          showToast("Đã đăng xuất");
        },
      },
    ]);
  };

  const handleClearFamilyData = () => {
    Alert.alert(
      "Xoá toàn bộ gia phả?",
      "Toàn bộ người và quan hệ trong gia phả sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
            clearFamilyData();
            showToast("Đã xoá toàn bộ gia phả");
          },
        },
      ],
    );
  };

  const handleClearEvents = () => {
    Alert.alert(
      "Xoá toàn bộ sự kiện?",
      "Toàn bộ ngày giỗ, sinh nhật, sự kiện đã lưu sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
            clearAllEvents();
            showToast("Đã xoá toàn bộ sự kiện");
          },
        },
      ],
    );
  };

  const handleFeedback = () => {
    Linking.openURL(
      "mailto:feedback@example.com?subject=Góp ý app Lịch Âm",
    ).catch(() => {
      showToast("Không mở được ứng dụng email trên thiết bị này", "error");
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Hồ sơ: ưu tiên hiển thị thông tin tài khoản đăng nhập (tên, email).
          Nếu chưa đăng nhập, hiện trạng thái trống + nút dẫn tới màn Đăng nhập. */}
      <SettingsSection title="Hồ sơ">
        <View style={styles.profileRow}>
          <View style={[styles.avatar, !currentUser && styles.avatarEmpty]}>
            <Text style={styles.avatarText}>
              {currentUser ? currentUser.name.charAt(0) : "?"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {currentUser ? currentUser.name : "Chưa đăng nhập"}
            </Text>
            <Text style={[styles.profileSub, { color: colors.textSecondary }]}>
              {currentUser
                ? currentUser.email
                : "Đăng nhập để đồng bộ và chia sẻ gia phả"}
            </Text>
          </View>
        </View>

        {currentUser ? (
          <SettingsRow
            icon="🚪"
            label="Đăng xuất"
            type="destructive"
            onPress={handleLogout}
            isLast
          />
        ) : (
          <SettingsRow
            icon="🔑"
            label="Đăng nhập / Đăng ký"
            onPress={() => router.push("/login")}
            isLast
          />
        )}
      </SettingsSection>

      <SettingsSection title="Giao diện">
        <View style={styles.themeRow}>
          <ToggleButton
            active={mode === "light"}
            label="☀️ Sáng"
            onPress={() => handleSetMode("light")}
          />
          <ToggleButton
            active={mode === "dark"}
            label="🌙 Tối"
            onPress={() => handleSetMode("dark")}
          />
          <ToggleButton
            active={mode === "system"}
            label="⚙️ Hệ thống"
            onPress={() => handleSetMode("system")}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Thông báo">
        <SettingsRow
          icon="🔔"
          label="Cho phép thông báo"
          type="toggle"
          toggled={notificationsEnabled}
          onToggle={setNotificationsEnabled}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Hỗ trợ">
        <SettingsRow
          icon="❓"
          label="Trợ giúp & Câu hỏi thường gặp"
          onPress={() => {}}
        />
        <SettingsRow
          icon="✉️"
          label="Gửi phản hồi"
          onPress={handleFeedback}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Pháp lý">
        <SettingsRow icon="📄" label="Chính sách bảo mật" onPress={() => {}} />
        <SettingsRow
          icon="📄"
          label="Điều khoản sử dụng"
          onPress={() => {}}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Vùng nguy hiểm">
        <SettingsRow
          icon="🗑️"
          label="Xoá toàn bộ gia phả"
          type="destructive"
          onPress={handleClearFamilyData}
        />
        <SettingsRow
          icon="🗑️"
          label="Xoá toàn bộ sự kiện"
          type="destructive"
          onPress={handleClearEvents}
          isLast
        />
      </SettingsSection>

      <Text style={[styles.version, { color: colors.textSecondary }]}>
        Phiên bản {appVersion}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  themeRow: { flexDirection: "row", gap: 8, padding: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarEmpty: { backgroundColor: "#B0B0B0" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileSub: { fontSize: 12, marginTop: 3 },
  version: { textAlign: "center", fontSize: 12, marginTop: 4 },
});
