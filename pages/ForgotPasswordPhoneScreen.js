import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPasswordPhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();

  const handleResetPassword = () => {
    // In a real app, you would validate the phone number and send a reset code
    navigation.navigate("VerifyCode");
  };

  const handleUseEmail = () => {
    navigation.navigate("ForgotPasswordEmail");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forgot</Text>
        <Text style={styles.headerTitle}>Your Password?</Text>
        <Text style={styles.headerSubtitle}>
          Enter your number to get a reset code
        </Text>
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <View style={styles.phoneInputWrapper}>
          <TouchableOpacity style={styles.countryCodeButton}>
            <Image
              source={{
                uri: "https://api.a0.dev/assets/image?text=Ghana%20flag&aspect=1:1&seed=123",
              }}
              style={styles.flagIcon}
            />
            <Text style={styles.countryCodeText}>(+233)</Text>
            <Text style={styles.chevronDown}>▼</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.phoneInput}
            placeholder="Phone number"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
      >
        <Text style={styles.resetButtonText}>Reset Password</Text>
      </TouchableOpacity>

      {/* Use Email Link */}
      <TouchableOpacity style={styles.emailLink} onPress={handleUseEmail}>
        <Text style={styles.emailLinkText}>Use email instead</Text>
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
  phoneInputWrapper: {
    flexDirection: "row",
    height: 56,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 15,
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.1)",
  },
  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 5,
    borderRadius: 2,
  },
  countryCodeText: {
    color: "white",
    marginRight: 5,
  },
  chevronDown: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 15,
    color: "white",
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
  emailLink: {
    alignItems: "center",
  },
  emailLinkText: {
    color: "#00B4D8",
    fontSize: 16,
  },
});
