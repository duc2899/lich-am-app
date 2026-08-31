import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function AppSplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Svg width={120} height={120} viewBox="0 0 1024 1024">
          <Circle cx={512} cy={512} r={440} fill="#FBF3E3" />
          <Path
            d="M512,72 A440,440 0 0,1 512,952 A220,220 0 0,1 512,512 A220,220 0 0,0 512,72 Z"
            fill="#7A2E2E"
          />
          <Circle cx={512} cy={292} r={62} fill="#7A2E2E" />
          <Circle cx={512} cy={732} r={62} fill="#FBF3E3" />
          <Circle
            cx={512}
            cy={512}
            r={440}
            fill="none"
            stroke="#D9A441"
            strokeWidth={16}
          />
        </Svg>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity }]}>Lịch Âm</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity }]}>
        Lịch âm dương · Gia phả
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7A2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: "700",
    color: "#FBF3E3",
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#D9A441",
  },
});
