import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  KeyboardAvoidingView,
  KeyboardAvoidingViewComponent,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export default function SignUpFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const role = route.params?.role;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hostelName, setHostelName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [staffId, setStaffId] = useState("");
  const [indexNumber, setIndexNumber] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [showButton, setShowButton] = useState(false);
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isBottom) {
      setShowButton(true);
    }
  };

  const handleNext = () => {
    navigation.navigate("SignUpProfile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}></View>
        <View style={[styles.progressBar, styles.progressActive]}></View>
        <View style={styles.progressBar}></View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 100,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Let's</Text>
            <Text style={styles.title}>Get you started</Text>
            <Text style={styles.subtitle}>
              Fill in the forms to create your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name Row */}
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.halfInput, styles.leftInput]}
                placeholder="First Name"
                placeholderTextColor="#6c757d"
                value={firstName}
                onChangeText={setFirstName}
              />

              <TextInput
                style={[styles.input, styles.halfInput, styles.rightInput]}
                placeholder="Last Name"
                placeholderTextColor="#6c757d"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#6c757d"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Date of Birth */}
            <TextInput
              style={styles.input}
              placeholder="10/10/2025"
              placeholderTextColor="#6c757d"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            {/* Phone Number */}
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeFlag}>🇬🇭</Text>
                <Text style={styles.countryCode}>(+233)</Text>
              </View>

              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="#6c757d"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Hostel Name or Address */}
            {role === "student" ? (
              <TextInput
                style={styles.input}
                placeholder="Name of Hostel"
                placeholderTextColor="#6c757d"
                value={hostelName}
                onChangeText={setHostelName}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#6c757d"
                value={hostelName}
                onChangeText={setHostelName}
              />
            )}

            {/* College */}
            {role === "student" && (
              <TextInput
                style={styles.input}
                placeholder="College"
                placeholderTextColor="#6c757d"
                value={college}
                onChangeText={setCollege}
              />
            )}

            {/* Department (for Lecturer, TA, Student) */}
            {(role === "lecturer" || role === "ta" || role === "student") && (
              <TextInput
                style={styles.input}
                placeholder="Department"
                placeholderTextColor="#6c757d"
                value={department}
                onChangeText={setDepartment}
              />
            )}

            {/* Staff ID (for Lecturer only) */}
            {role === "lecturer" && (
              <TextInput
                style={styles.input}
                placeholder="Staff ID"
                placeholderTextColor="#6c757d"
                value={staffId}
                onChangeText={setStaffId}
              />
            )}

            {/* Index Number (for Student only) */}
            {role === "student" && (
              <TextInput
                style={styles.input}
                placeholder="Index Number"
                placeholderTextColor="#6c757d"
                value={indexNumber}
                onChangeText={setIndexNumber}
              />
            )}

            {/* Reference ID (for Student only) */}
            {role === "student" && (
              <TextInput
                style={styles.input}
                placeholder="Reference ID"
                placeholderTextColor="#6c757d"
                value={referenceId}
                onChangeText={setReferenceId}
              />
            )}
          </View>

          {/* Conditional Button */}
          {showButton && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
    paddingHorizontal: 16,
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
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#adb5bd",
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 20,
    marginVertical: 10,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  halfInput: {
    width: "48%",
  },
  leftInput: {
    marginRight: 4,
  },
  rightInput: {
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: "25%",
    marginRight: 8,
  },
  countryCodeFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    color: "white",
    fontSize: 14,
  },
  phoneInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    height: 56,
    paddingHorizontal: 20,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    flex: 1,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 150,
  },

  nextButtonText: {
    color: "#00B4D8",
    fontSize: 16,
    fontWeight: "bold",
  },
});
