import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
} from "react-native";
import BottomNavigation from "../components/BottomNavigation";
import { useNavigation } from "@react-navigation/native";

const SOSActiveScreen = () => {
  const [activated, setActivated] = useState(true);
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  // Start animations when activated
  useEffect(() => {
    if (activated) {
      // Create pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [activated]);

  // Convert rotation value to degrees
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const navigation = useNavigation();

  const handleSOSPress = () => {
    setActivated(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Main content area */}
        <View style={styles.content}>
          {activated && (
            <Text style={styles.activatedText}>Button Activated</Text>
          )}

          {/* SOS Button with animations */}
          <View style={styles.sosButtonContainer}>
            {activated && (
              <>
                <Animated.View
                  style={[
                    styles.outerRing3,
                    {
                      transform: [{ scale: pulseAnim }, { rotate: spin }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.outerRing2,
                    {
                      transform: [{ scale: pulseAnim }, { rotate: spin }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.outerRing1,
                    {
                      transform: [{ scale: pulseAnim }, { rotate: spin }],
                    },
                  ]}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.sosButton}
              onPress={handleSOSPress}
              activeOpacity={0.8}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>

          {activated && (
            <View style={styles.safeWordContainer}>
              <View style={styles.safeWordHeader}>
                <Text style={styles.safeWordTitle}>
                  Your safe word has been detected
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  We've gathered your current location and{"\n"}report details,
                  and the have been {"\n"}securely sent to a pre-designated
                  safety {"\n"}proxy.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001133",
    position: "relative",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  activatedText: {
    color: "#F23F42",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  sosButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 250,
    width: 250,
  },
  outerRing3: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "	rgba(242, 63, 66, 0.2)",
  },
  outerRing2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(242, 63, 66, 0.4)",
  },
  outerRing1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(242, 63, 66, 0.6)",
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F23F42",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  sosText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  safeWordContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    marginTop: 40,
  },
  safeWordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  safeWordTitle: {
    color: "#98C84A",
    fontSize: 20,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
    textAlign: "center",
    top: 30,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  cancelText: {
    color: "#F23F42",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
});

export default SOSActiveScreen;
