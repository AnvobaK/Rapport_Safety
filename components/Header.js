import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { UserContext } from "../context/userContext"; // Import UserContext
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

export default function Header({
  username = "Welcome Back!",
  onNotificationPress,
  onMenuPress,
  navigation,
}) {
  // Use UserContext for profile image
  const { profileImage } = useContext(UserContext);
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Time-based greeting logic with animation
  const [showGreeting, setShowGreeting] = useState(true);
  const [greeting, setGreeting] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Determine greeting based on time
    const hour = new Date().getHours();
    let greet = "";
    if (hour < 12) greet = "Good morning";
    else if (hour < 18) greet = "Good afternoon";
    else greet = "Good evening";
    setGreeting(greet);
    setShowGreeting(true);
    fadeAnim.setValue(1);
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowGreeting(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else if (navigation) {
      // Navigate to NotificationsScreen
      navigation.navigate("Notifications");
    } else {
      console.log("Notification pressed - no navigation handler provided");
    }
  };

  const handleMenuPress = () => {
    navigation.navigate("settings");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.SafeArea}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require("../images/Group 39429.png")}
                style={styles.profileImage}
              />
            )}
          </View>
          <Animated.Text
            style={[
              styles.welcomeText,
              { color: theme.primaryText, opacity: fadeAnim },
            ]}
          >
            {showGreeting ? greeting : username}
          </Animated.Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationPress}
          >
            <Feather name="bell" size={24} color="#00C6FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
            <Feather name="menu" size={24} color="#00C6FF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeArea: {},
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 20,
    padding: 4, // Added padding for better touch area
  },
});
