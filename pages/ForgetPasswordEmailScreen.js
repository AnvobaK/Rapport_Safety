import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPasswordEmailScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const handleResetPassword = () => {
    // In a real app, you would validate the email and send a reset code
    navigation.navigate("VerifyCode");
  };

  const handleUsePhoneNumber = () => {
    navigation.navigate("ForgotPasswordPhone");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forgot</Text>
        <Text style={styles.headerTitle}>Your Password?</Text>
        <Text style={styles.headerSubtitle}>
          Enter your email to get a reset code
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="selineniel@gmail.com"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
      >
        <Text style={styles.resetButtonText}>Reset Password</Text>
      </TouchableOpacity>

      {/* Use Phone Number Link */}
      <TouchableOpacity
        style={styles.phoneNumberLink}
        onPress={handleUsePhoneNumber}
      >
        <Text style={styles.phoneNumberLinkText}>Use phone number instead</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    lineHeight: 40,
    top: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#adb5bd",
    marginTop: 70,
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    height: 56,
    paddingHorizontal: 20,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  resetButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  resetButtonText: {
    color: "#00B4D8",
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneNumberLink: {
    alignItems: "center",
  },
  phoneNumberLinkText: {
    color: "#00B4D8",
    fontSize: 16,
  },
});
