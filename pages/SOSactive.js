import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import LottieView from "lottie-react-native";

const SOSActiveScreen = () => {
  const [activated, setActivated] = useState(true);

  const handleSOSPress = () => {
    setActivated(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {activated && (
          <Text style={styles.activatedText}>Button Activated</Text>
        )}

        {/* 🔁 Lottie animation container */}
        <View style={styles.sosButtonContainer}>
          {activated && (
            <LottieView
              source={require("../assets/animations/SOS.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
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
                The alert has been sent
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
              We've gathered your current location and report details, and they have been securely sent to a pre-designated safety proxy.
              </Text>
            </View>
          </View>
        )}
      </View>
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
    paddingTop: 5,
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
  lottie: {
    width: 250,
    height: 250,
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
    position: "absolute", // sit on top of Lottie
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
    marginBottom: 4,
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
    marginTop: 8,
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
});

export default SOSActiveScreen;
