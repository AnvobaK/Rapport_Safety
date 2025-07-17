import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import HeaderWithBack from "../components/Headerwithbackbutton";

const NotificationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for the notification bell
  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
    console.log("Back button pressed");
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    console.log(`Navigating to ${tabName}`);
  };

  const handleSOSPress = () => {
    console.log("SOS button pressed");
    // Add your SOS functionality here
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button */}
        <HeaderWithBack
          onBackPress={handleBackPress}
          rightComponent={
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={4} color="#00BFFF" />
            </TouchableOpacity>
          }
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Notification Bell Animation */}
          <View style={styles.bellContainer}>
            <View style={styles.outerRing}>
              <View style={styles.middleRing}>
                <Animated.View
                  style={[
                    styles.innerCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={28}
                    color="#000"
                  />
                </Animated.View>
              </View>
            </View>
          </View>

          {/* No Notifications Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.mainMessage}>There's no notifications</Text>
            <Text style={styles.subMessage}>
              Your notifications will be{"\n"}appear on this page
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bellContainer: {
    bottom: 70,
  },
  outerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0, 191, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(0, 191, 255, 0.2)",
  },
  middleRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0, 191, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(0, 191, 255, 0.3)",
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00BFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00BFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  messageContainer: {
    alignItems: "center",
  },
  mainMessage: {
    color: "#00BFFF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  subMessage: {
    color: "#8B9DC3",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  profileButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
