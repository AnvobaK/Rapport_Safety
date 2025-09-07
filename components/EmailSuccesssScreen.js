import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function EmailSuccessScreen() {
  const navigation = useNavigation();

  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Email successfully sent!</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset code to the email address you provided.
            Please check your inbox.
          </Text>
        </View>

        {/* Go to Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4CD964", // Green color for success
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#adb5bd",
    textAlign: "center",
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: "#00B4D8",
    borderRadius: 25,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
