import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleSignIn = () => {
    navigation.navigate("LogIn");
  };

  const handleSignUp = () => {
    navigation.navigate("SelectRole");
  };

  const handleTermsOfService = () => {
    // Open terms of service link
    Linking.openURL("https://example.com/terms");
  };

  const handlePrivacyPolicy = () => {
    // Open privacy policy link
    Linking.openURL("https://example.com/privacy");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../assets/gradient-technology-background 1.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextRap}>
            Rap<Text style={styles.logoTextPort}>port</Text>
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Your {"\n"}Silent Guardian</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text style={styles.linkText} onPress={handleTermsOfService}>
              Terms of Service
            </Text>{" "}
            and {"\n"}
            <Text style={styles.linkText} onPress={handlePrivacyPolicy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    height,
    opacity: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  logoContainer: {
    position: "absolute",
    top: 440,
    left: 24,
  },
  logoTextRap: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  logoTextPort: {
    color: "#00B4D8",
  },
  contentContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: -25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 12,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "#00B4D8",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 12,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    alignItems: "left",
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "left",
  },
  linkText: {
    color: "#00B4D8",
    textDecorationLine: "underline",
  },
});
