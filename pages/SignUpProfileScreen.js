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
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // <-- Import Image Picker
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

export default function SignUpProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState();

  const handleComplete = () => {
    const userDetails = {
      ...route.params,
      password,
      username,
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userDetails,
      }),
    };

    setIsLoading(true)
    fetch(
      `https://rapport-backend.onrender.com/auth/register/${userDetails.role}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        navigation.navigate("LogIn");
      })
      .catch((error) => {
        alert("Registration Failed", error.message);
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false)
      })
  };

  const handleChangeProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}></View>
            <View style={styles.progressBar}></View>
            <View style={[styles.progressBar, styles.progressActive]}></View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Get Started Now</Text>
            <Text style={styles.subtitle}>
              Make a profile that's uniquely yours
            </Text>
          </View>

          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profilePicture}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangeProfilePicture}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#6c757d"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#6c757d"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#6c757d"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Complete Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator/>}

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.linkText}>Terms of Service</Text> and{"\n"}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    width: 60,
    backgroundColor: "#333",
    marginHorizontal: 4,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: "#00B4D8",
  },
  header: {
    marginBottom: 30,
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#adb5bd",
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00B4D8",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "white",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#001233",
  },
  cameraIcon: {
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    height: 65,
    marginBottom: 16,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
  },
  completeButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    width: 380,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    bottom: 25,
  },
  completeButtonText: {
    color: "#00B4D8",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    alignItems: "center",
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
