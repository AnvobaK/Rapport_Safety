import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/userContext";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const EditProfileScreen = () => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();

  // Use UserContext for both profile image and data
  const {
    profileImage,
    setProfileImage,
    profileData,
    updateProfileData,
    updateProfileField,
  } = useContext(UserContext);

  // Initialize form data with context data
  const [formData, setFormData] = useState(profileData);

  // Update formData when profileData changes
  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Update the global context with new data
    updateProfileData(formData);

    // Show success message
    Alert.alert("Success", "Profile updated successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Update the global profile image state
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100} // adjust as needed for iOS/Android nav bar
      ></KeyboardAvoidingView>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackground}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.accentText} />
          </TouchableOpacity>
          <Text style={[styles.middleText, { color: theme.primaryText }]}>
            Edit Profile
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleSave}>
              <Text style={[styles.saveButton, { color: theme.accentText }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../images/Group 39429.png") // fallback image
              }
              style={styles.avatarImage}
            />
            <TouchableOpacity
              style={[
                styles.editIcon,
                {
                  backgroundColor: theme.accentText,
                  borderColor: theme.primaryBackground,
                },
              ]}
              onPress={pickImage}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: theme.primaryText }]}>
            {formData.firstName} {formData.lastName}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>
            {formData.email}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Name Fields */}
          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
                placeholder="First Name"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
            <View style={styles.nameInput}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
                placeholder="Last Name"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.secondaryIcon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIconText,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Email"
                placeholderTextColor={theme.secondaryText}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Birth Date */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.secondaryIcon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIconText,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.birthDate}
                onChangeText={(text) => handleInputChange("birthDate", text)}
                placeholder="Birth Date"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.phoneContainer}>
            <View
              style={[
                styles.countryCode,
                {
                  backgroundColor: theme.secondaryBackground,
                  borderColor: theme.primaryBorder,
                },
              ]}
            >
              <Text style={styles.flag}>🇬🇭</Text>
              <Text
                style={[styles.countryCodeText, { color: theme.secondaryText }]}
              >
                (+233)
              </Text>
            </View>
            <View style={styles.phoneInputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={theme.secondaryIcon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIconText,
                  styles.phoneInput,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="Phone Number"
                placeholderTextColor={theme.secondaryText}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.secondaryIcon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIconText,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.address}
                onChangeText={(text) => handleInputChange("address", text)}
                placeholder="Address"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </View>

          {/* Institution */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="school-outline"
                size={20}
                color={theme.secondaryIcon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIconText,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.institution}
                onChangeText={(text) => handleInputChange("institution", text)}
                placeholder="Institution"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </View>

          {/* Index Number */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <AntDesign
                name="idcard"
                size={20}
                color={theme.secondaryIcon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIconText,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.primaryBorder,
                    color: theme.primaryText,
                  },
                ]}
                value={formData.indexNumber}
                onChangeText={(text) => handleInputChange("indexNumber", text)}
                placeholder="Index Number"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <KeyboardAvoidingView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    fontSize: 20,
  },
  headerIcon: {
    marginLeft: 15,
    padding: 5,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 48,
  },
  avatarContainer: {
    marginBottom: 16,
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 20,
    gap: 28,
  },
  nameRow: {
    flexDirection: "row",
    gap: 16,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 19,
    fontSize: 16,
  },
  inputWithIcon: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 19,
    zIndex: 1,
  },
  inputWithIconText: {
    paddingLeft: 44,
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 8,
  },
  countryCode: {
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 14,
  },
  phoneInputContainer: {
    flex: 1,
    position: "relative",
  },
  phoneInput: {
    flex: 1,
  },
  middleText: {
    fontSize: 20,
    fontWeight: "bold",
    left: 22,
  },
});

export default EditProfileScreen;
