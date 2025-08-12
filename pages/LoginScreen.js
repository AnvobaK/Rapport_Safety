import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = () => {
    console.log("Login with:", username, password);

    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        "usernameOrEmail": username,
        "password": password
      })
    }

    setIsLoading(true)
    fetch(
      `https://rapport-backend.onrender.com/auth/login`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        navigation.navigate("MainTabNavigator");
        // handleDashboard()
      })
      .catch((error) => {
        alert("Login Failed", error.message);
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false)
      })
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordEmail");
  };
  const handleNext = () => {
    navigation.navigate("SelectRole");
  };
  // const handleDashboard = () => {
  //   navigation.navigate("MainTabs");
  // };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Text style={styles.logo}>
            Rap<Text style={styles.logoPort}>port</Text>
          </Text>

          {/* Heading */}
          <Text style={styles.heading}>Sign in to your{"\n"}Account</Text>
          <Text style={styles.subHeading}>Let’s log you back in</Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username / Email"
              placeholderTextColor="#6c757d"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6c757d"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator/>}
          </View>

          {/* Sign Up */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={handleNext}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010F25",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
    marginBottom: 30,
  },
  logoPort: {
    color: "#00C6FF",
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 45,
  },
  subHeading: {
    fontSize: 15,
    color: "#adb5bd",
    textAlign: "center",
    marginBottom: 28,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#0F1B2F",
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 20,

    marginBottom: 25,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  forgotPassword: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#00C6FF",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#00C6FF",
    fontSize: 20,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  signUpText: {
    color: "#fff",
    fontSize: 14,
  },
  signUpLink: {
    color: "#00C6FF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
