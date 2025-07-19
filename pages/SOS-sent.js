import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const SOSsent = () => {
  const [activated, setActivated] = useState(true);
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <View
        style={[styles.container, { backgroundColor: theme.primaryBackground }]}
      >
        {/* Main content area */}
        <View style={styles.content}>
          {activated && (
            <Text style={[styles.activatedText, { color: theme.error }]}>
              Button Activated
            </Text>
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
                      backgroundColor: `rgba(239, 68, 68, 0.2)`,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.outerRing2,
                    {
                      transform: [{ scale: pulseAnim }, { rotate: spin }],
                      backgroundColor: `rgba(239, 68, 68, 0.4)`,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.outerRing1,
                    {
                      transform: [{ scale: pulseAnim }, { rotate: spin }],
                      backgroundColor: `rgba(239, 68, 68, 0.6)`,
                    },
                  ]}
                />
              </>
            )}
            <TouchableOpacity
              style={[styles.sosButton, { backgroundColor: theme.error }]}
              onPress={handleSOSPress}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.sosText, { color: theme.primaryBackground }]}
              >
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
                <Text
                  style={[styles.safeWordText, { color: theme.primaryText }]}
                >
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
  outerRing3: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  outerRing2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  outerRing1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
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
  },
  sosText: {
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

export default SOSsent;
