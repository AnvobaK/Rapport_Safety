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

export default function CreateNewPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

  const handleResetPassword = () => {
    // In a real app, you would validate passwords match and update the user's password
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forgot</Text>
        <Text style={styles.headerTitle}>Your Password?</Text>
        <Text style={styles.headerSubtitle}>
          Create a new password to login
        </Text>
      </View>

      {/* Password Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.marginBottom]}
          placeholder="New Password"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
      >
        <Text style={styles.resetButtonText}>Reset Password</Text>
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
    height: 60,
    paddingHorizontal: 20,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  marginBottom: {
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: "#000",
    borderRadius: 25,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  resetButtonText: {
    color: "#00B4D8",
    fontSize: 16,
    fontWeight: "bold",
  },
});
