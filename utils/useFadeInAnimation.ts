import { useRef } from "react";
import { Animated } from "react-native";

/**
 * Trả về 2 Animated.Value (opacity + translateY) và hàm play() để chạy lại animation từ đầu.
 * Dùng chung cho FadeInView (chuyển tab dưới cùng) và FadeSwitchView (chuyển tab con).
 */
export function useFadeInAnimation(duration: number = 250) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(8)).current;

    const play = () => {
        opacity.setValue(0);
        translateY.setValue(8);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
        ]).start();
    };

    return { opacity, translateY, play };
}