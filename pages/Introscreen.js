import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const IntroScreen = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const slides = [
    {
      id: 1,
      animation: require("../assets/animations/Animation - 1750190953872.json"),
      title: "Just say the word!",
      description:
        "Trigger a discreet SOS alert with your voice — even if your hands are full or your phone is out of reach.",
    },
    {
      id: 2,
      animation: require("../assets/animations/Animation - 1750191067983.json"),
      title: "Know your surroundings",
      description:
        "Our dynamic map highlights safe zones, recent reports and high-risk areas, so you can navigate confidently.",
    },
    {
      id: 3,
      animation: require("../assets/animations/Animation - 1750191097634.json"),
      title: "Stay Informed",
      description:
        "Get instant updates about nearby safety issues, from suspicious activity to emergency situations - all verified by people around you.",
    },
    {
      id: 4,
      animation: require("../assets/animations/Animation - 1750191143239.json"),
      title: "Powered by You",
      description:
        "Every report helps prevent the next incident. Together, we make this space safer for everyone.",
    },
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      setActiveIndex(index);
    });
    return () => scrollX.removeAllListeners();
  }, []);

  const goToLogin = () => {
    navigation.navigate("Welcome");
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          const size = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [8, 10, 8],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity,
                  width: size,
                  height: size,
                  backgroundColor: index === activeIndex ? "#FFFFFF" : "#555",
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* App Title */}
      <Text style={styles.appTitle}>
        Rap<Text style={styles.portText}>port</Text>
      </Text>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={goToLogin}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Lottie Animations */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <LottieView
              source={slide.animation}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dots */}
      {renderDots()}

      {/* Text Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{slides[activeIndex].title}</Text>
        <Text style={styles.description}>
          {slides[activeIndex].description}
        </Text>
      </View>

      {/* Get Started */}
      <TouchableOpacity style={styles.getStartedButton} onPress={goToLogin}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010F25",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 80,
  },
  portText: {
    color: "#00C6FF",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#00C6FF",
    fontWeight: "600",
  },
  carousel: {
    height: height * 0.45,
    marginTop: 20,
  },
  slide: {
    width: width,
    height: height * 0.45,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: width * 0.6,
    height: height * 0.4,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  dot: {
    borderRadius: 5,
    marginHorizontal: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00C6FF",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: "#000000",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 30,
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  getStartedText: {
    color: "#00C6FF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default IntroScreen;
