import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

export default function SplashScreen() {
  const navigation = useNavigation();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(1.5);

  const navigateToIntro = () => {
    navigation.replace("Intro"); // Navigate to IntroScreen after splash
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    setTimeout(() => {
      runOnJS(navigateToIntro)(); // Run navigation after 2 seconds
    }, 2000);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.textLeft, animatedStyle]}>
          Rap
        </Animated.Text>
        <Animated.Text style={[styles.textRight, animatedStyle]}>
          port
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textLeft: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  textRight: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00B4D8",
  },
});
