import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import SLIDES from "../constants/welcome";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  onFinish: () => void;
};

export default function OnboardingScreen({ onFinish }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLastSlide = activeSlide === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveSlide(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      onFinish();
      return;
    }
    scrollRef.current?.scrollTo({
      x: (activeSlide + 1) * SCREEN_WIDTH,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Image
              source={slide.image}
              style={styles.slideImage}
              resizeMode="contain"
            />
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomArea}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeSlide === i && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {isLastSlide ? "Bắt đầu" : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 30,
  },
  skipBtn: { position: "absolute", top: 50, right: 20, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, color: "#999", fontWeight: "600" },

  // Carousel giờ giãn chiếm hết khoảng trống còn lại giữa nút Bỏ qua (trên) và khu vực dots/CTA (dưới)
  carousel: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  slideImage: { width: 260, height: 260, marginBottom: 24 },
  slideTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },
  slideDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
  },

  // Khu vực dots + nút CTA neo cố định gần đáy, không bị đẩy dồn lên trên nữa
  bottomArea: { paddingBottom: 10 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#ddd" },
  dotActive: { backgroundColor: "#4A90D9", width: 20 },

  nextBtn: {
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 24,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
