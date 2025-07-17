import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/userContext";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

// Logout Overlay Component
const LogoutOverlay = ({
  visible,
  onClose,
  onConfirm,
  title = "Log out",
  message = "Are you sure you want to log out? You'll need to login again to use the app.",
  theme,
}) => {
  const handleCancel = () => {
    onClose();
  };

  const handleLogout = () => {
    onClose();
    navigation.navigate("LogIn");
  };
  const navigation = useNavigation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          overlayStyles.modalOverlay,
          { backgroundColor: theme.overlayBackground },
        ]}
      >
        <View
          style={[
            overlayStyles.modalContainer,
            { backgroundColor: theme.modalBackground },
          ]}
        >
          <Text style={[overlayStyles.modalTitle, { color: theme.error }]}>
            {title}
          </Text>
          <Text
            style={[overlayStyles.modalMessage, { color: theme.secondaryText }]}
          >
            {message}
          </Text>

          <View style={overlayStyles.modalButtons}>
            <TouchableOpacity
              style={[
                overlayStyles.cancelButton,
                { borderColor: theme.accentText },
              ]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  overlayStyles.cancelButtonText,
                  { color: theme.accentText },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                overlayStyles.logoutButton,
                { backgroundColor: theme.accentText },
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  overlayStyles.logoutButtonText,
                  { color: theme.primaryBackground },
                ]}
              >
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DeleteOverlay = ({
  visible,
  onClose,
  onConfirm,
  title = "Delete Account",
  message = "Are you sure you want to permanently delete this account? This action cannot be undone.",
  theme,
}) => {
  const handleCancel = () => {
    onClose();
  };

  const handleLogout = () => {
    onClose();
    navigation.navigate("Welcome");
  };
  const navigation = useNavigation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          overlayStyles.modalOverlay,
          { backgroundColor: theme.overlayBackground },
        ]}
      >
        <View
          style={[
            overlayStyles.modalContainer,
            { backgroundColor: theme.modalBackground },
          ]}
        >
          <Text style={[overlayStyles.modalTitle, { color: theme.error }]}>
            {title}
          </Text>
          <Text
            style={[overlayStyles.modalMessage, { color: theme.secondaryText }]}
          >
            {message}
          </Text>

          <View style={overlayStyles.modalButtons}>
            <TouchableOpacity
              style={[
                overlayStyles.cancelButton,
                { borderColor: theme.accentText },
              ]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  overlayStyles.cancelButtonText,
                  { color: theme.accentText },
                ]}
              >
                No,cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                overlayStyles.logoutButton,
                { backgroundColor: theme.accentText },
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  overlayStyles.logoutButtonText,
                  { color: theme.primaryBackground },
                ]}
              >
                Yes, delete it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SettingsScreen = () => {
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigation = useNavigation();

  // Get theme and preferences from context
  const { isDarkMode, setDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Get profile data from context
  const { profileImage, profileData } = useContext(UserContext);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
    // Clear user data, navigate to login screen, etc.
    // navigation.navigate("Login");
  };

  const handleNightModeToggle = (value) => {
    setDarkMode(value);
  };

  const SettingsItem = ({
    icon,
    iconColor = "#00A3FF",
    title,
    subtitle,
    hasToggle = false,
    toggleValue = false,
    onToggleChange = null,
    hasArrow = true,
    onPress = null,
  }) => (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: theme.primaryBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={20} color="black" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsTitle, { color: theme.primaryText }]}>
            {title}
          </Text>
          <Text
            style={[styles.settingsSubtitle, { color: theme.secondaryText }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.settingsItemRight}>
        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{
              false: theme.switchTrackFalse,
              true: theme.switchTrackTrue,
            }}
            thumbColor={theme.switchThumb}
            style={styles.switch}
          />
        ) : hasArrow ? (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.secondaryIcon}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.accentIcon} />
        </TouchableOpacity>
        <Text style={[styles.middleText, { color: theme.primaryText }]}>
          Settings
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.accentIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="menu" size={24} color={theme.accentIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section - Now uses context data */}
        <TouchableOpacity
          style={[
            styles.profileSection,
            { backgroundColor: theme.cardBackground },
          ]}
          onPress={() => navigation.navigate("editprofile")}
        >
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../images/Group 39429.png")
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.primaryText }]}>
              {profileData.firstName} {profileData.lastName}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>
              {profileData.email}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.secondaryIcon}
          />
        </TouchableOpacity>

        {/* Settings Items */}
        <View style={styles.settingsContainer}>
          <View
            style={[
              styles.firstContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <SettingsItem
              icon="eye-off"
              iconColor="#00C6FF"
              title="Anonymous"
              subtitle="Stay hidden or seen"
              hasToggle={true}
              toggleValue={anonymousMode}
              onToggleChange={setAnonymousMode}
              hasArrow={false}
            />

            <SettingsItem
              icon="moon"
              iconColor="#00C6FF"
              title="Night Mode"
              subtitle="Enable dark or light mode"
              hasToggle={true}
              toggleValue={isDarkMode}
              onToggleChange={handleNightModeToggle}
              hasArrow={false}
            />
          </View>
          <View
            style={[
              styles.secondContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <SettingsItem
              icon="notifications"
              iconColor="#00C6FF"
              title="Notifications"
              subtitle="Permissions, lock screen"
              hasToggle={true}
              toggleValue={notifications}
              onToggleChange={setNotifications}
              hasArrow={false}
            />

            <SettingsItem
              icon="shield-checkmark"
              iconColor="#00C6FF"
              title="Privacy Policy"
              subtitle="Privacy Policies"
              hasToggle={false}
              onPress={() => navigation.navigate("privacy")}
            />

            <SettingsItem
              icon="document-text"
              iconColor="#00C6FF"
              title="Terms & Conditions"
              subtitle="Terms and conditions"
              hasToggle={false}
              onPress={() => navigation.navigate("terms")}
            />

            <SettingsItem
              icon="help-circle"
              iconColor="#00C6FF"
              title="Help & Support"
              subtitle="Help center, contact us"
              hasToggle={false}
              onPress={() => navigation.navigate("helpandsupport")}
            />
          </View>
        </View>

        <View
          style={[
            styles.thirdContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <SettingsItem
            icon="power"
            iconColor="#00C6FF"
            title="Logout"
            subtitle="Help center, contact us"
            hasArrow={false}
            onPress={() => setShowLogoutModal(true)}
          />

          <SettingsItem
            icon="trash"
            iconColor="#00C6FF"
            title="Delete Account"
            subtitle="Permanently delete your account"
            hasArrow={false}
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      {/* Logout Overlay */}
      <LogoutOverlay
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        theme={theme}
      />
      {/* Delete Overlay */}
      <DeleteOverlay
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleLogout}
        theme={theme}
      />
    </View>
  );
};

// Overlay styles
const overlayStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  modalContainer: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
    maxWidth: 360,
    height: 240, // <-- Set a fixed height
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  firstContainer: {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  secondContainer: {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  thirdContainer: {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 14,
  },
  settingsItemRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  bottomActions: {
    marginBottom: 40,
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  deleteItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  middleText: {
    fontSize: 20,
    fontWeight: "bold",
    left: 30,
  },
});

export default SettingsScreen;
