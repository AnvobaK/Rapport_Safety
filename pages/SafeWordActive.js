import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomNavigation from "../components/BottomNavigation";
import { PorcupineManager } from "@picovoice/porcupine-react-native";

const KEYWORD_PATH = "assets/keywords/Blueberry_en_android_v3_0_0.ppn";
const ACCESS_KEY = "SWb1iriZG9JvmlQTCJGbaK5cvrkdop15NBsutNJylFzYjgAdpDiDZg==";

const SOSActiveScreen = () => {
  const [activated, setActivated] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const porcupineManagerRef = useRef(null);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs microphone access to detect wake words",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error("Permission error:", err);
        return false;
      }
    }
    return true; // For iOS, you'll need additional handling
  };

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
      // Stop animations and reset
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      // Stop all animations
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
    }
  }, [activated]);

  useEffect(() => {
    initializeWakeWord();

    return () => {
      // Cleanup when component unmounts
      if (porcupineManagerRef.current) {
        porcupineManagerRef.current.stop();
      }
    };
  }, []);

  const initializeWakeWord = async () => {
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Microphone access is needed for wake word detection"
        );
        return;
      }

      const manager = await PorcupineManager.fromKeywordPaths(
        ACCESS_KEY,
        [KEYWORD_PATH],
        wakeWordDetected,
        (error) => {
          console.error("Porcupine error:", error);
        }
      );

      porcupineManagerRef.current = manager;
      await manager.start();
      setIsListening(true);
      console.log("Porcupine started successfully");
    } catch (error) {
      console.error("Failed to initialize Porcupine:", error);
      Alert.alert("Error", "Could not start wake word detection");
    }
  };

  const wakeWordDetected = (keywordIndex) => {
    console.log(`Wake word detected: ${keywordIndex}`);
    setActivated(true); // Activate SOS UI when wake word is detected

    // Optional: Show alert or feedback
    Alert.alert("Wake Word Detected", "SOS activated!");
  };

  // Convert rotation value to degrees
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const navigation = useNavigation();

  const handleSOSPress = () => {
    setActivated(true);
  };

  const handleCancelSOS = () => {
    setActivated(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Wake Word: {isListening ? "Listening..." : "Disabled"}
          </Text>
        </View>

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

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSOS}
              >
                <Text style={styles.cancelText}>Cancel SOS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    statusContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  cancelButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(242, 63, 66, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#F23F42',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
