import { useEffect } from "react";
import { View, Animated, StyleProp, ViewStyle } from "react-native";
import { useFadeInAnimation } from "@utils/useFadeInAnimation";
import { useTheme } from "@context/ThemeContext";

type Props = {
  trigger: unknown; // đổi giá trị này (vd tên tab con đang chọn) để chạy lại animation
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bọc quanh nội dung tab con (Thống kê/Sơ đồ/Trưng bày/Danh xưng trong Gia phả) -- không dùng
 * useFocusEffect vì đây không phải chuyển màn hình thật (route) mà chỉ đổi state cục bộ, nên
 * chạy lại animation mỗi khi `trigger` (thường là key của tab con đang chọn) đổi giá trị.
 *
 * Cùng cấu trúc "nền đặc không animate + nội dung animate riêng" như FadeInView, để tránh
 * lộ màu nền sai (trắng mặc định) trong lúc opacity đang chạy giữa chừng.
 */
export default function FadeSwitchView({ trigger, children, style }: Props) {
  const { colors } = useTheme();
  const { opacity, translateY, play } = useFadeInAnimation();

  useEffect(() => {
    play();
  }, [trigger]);

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        {children}
      </Animated.View>
    </View>
  );
}
