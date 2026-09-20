import { useCallback } from "react";
import { View, Animated, StyleProp, ViewStyle } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useFadeInAnimation } from "@utils/useFadeInAnimation";
import { useTheme } from "@context/ThemeContext";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bọc quanh nội dung 1 tab dưới cùng (Lịch/Sự kiện/Gia phả/Cài đặt) -- tự fade-in + trượt nhẹ
 * lên MỖI LẦN chuyển tới tab đó (dùng useFocusEffect, không chỉ chạy 1 lần lúc mount đầu tiên,
 * vì React Navigation giữ nguyên các tab trong bộ nhớ chứ không unmount khi chuyển qua lại).
 *
 * QUAN TRỌNG: lớp NGOÀI CÙNG (View thường, KHÔNG animate) tô sẵn màu nền đúng theme ngay lập
 * tức, không phụ thuộc animation hay bất kỳ prop nào của react-navigation (như
 * sceneContainerStyle -- không tồn tại ở mọi phiên bản). Chỉ có NỘI DUNG bên trong (Animated.View
 * lồng bên trong) mới thực sự chạy opacity/translateY. Nhờ vậy khung nền phía sau luôn đúng màu
 * theme ngay từ khung hình đầu tiên, không còn lộ trắng ra lúc opacity còn thấp giữa chừng animation.
 */
export default function FadeInView({ children, style }: Props) {
  const { colors } = useTheme();
  const { opacity, translateY, play } = useFadeInAnimation();

  useFocusEffect(
    useCallback(() => {
      play();
    }, []),
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        {children}
      </Animated.View>
    </View>
  );
}
