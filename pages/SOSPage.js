import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import LottieView from "lottie-react-native";

const SOSScreen = () => {
  const [activated, setActivated] = useState(true);
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);
  const navigation = useNavigation();

  const handleSOSPress = () => {
    setActivated(true);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <View style={styles.content}>
        {activated && (
          <Text style={[styles.activatedText, { color: theme.error }]}>
            Button Activated
          </Text>
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
            style={[styles.sosButton, { backgroundColor: theme.error }]}
            onPress={handleSOSPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.sosText, { color: theme.primaryBackground }]}>
              SOS
            </Text>
          </TouchableOpacity>
        </View>

        {activated && (
          <View
            style={[
              styles.safeWordContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.safeWordHeader}>
              <Ionicons name="mic" size={20} color={theme.accentIcon} />
              <Text
                style={[styles.safeWordTitle, { color: theme.primaryText }]}
              >
                Your Safe Word
              </Text>
            </View>

            <View
              style={[
                styles.safeWordBox,
                { backgroundColor: theme.secondaryBackground },
              ]}
            >
              <Text style={[styles.safeWordText, { color: theme.primaryText }]}>
                Your safe word is{" "}
                <Text
                  style={[styles.blueberryText, { color: theme.accentText }]}
                >
                  Blueberry
                </Text>
              </Text>
            </View>

            <View style={styles.warningContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.error} />
              <Text
                style={[styles.warningText, { color: theme.secondaryText }]}
              >
                When this word is recorded, a message containing your general
                details will be sent to security services.
              </Text>
            </View>
          </View>
        )}

        {activated && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Entypo name="cross" size={24} color={theme.error} />
            <Text style={[styles.cancelText, { color: theme.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    position: "absolute", // ensure button sits on top of Lottie
  },
  sosText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  lottie: {
    width: 250,
    height: 250,
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
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  safeWordBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  safeWordText: {
    fontSize: 14,
  },
  blueberryText: {
    fontWeight: "500",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default SOSScreen;
