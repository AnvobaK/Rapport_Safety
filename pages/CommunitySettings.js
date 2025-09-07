import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import HeaderWithBack from "../components/Headerwithbackbutton";

const { width } = Dimensions.get("window");

const CommunitySettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [anonymousEnabled, setAnonymousEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("Media");

  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const tabs = ["Media", "Posts", "Links", "Comments", "Threads", "Files"];

  // Sample media data - in real app, these would be actual images
  const mediaItems = [
    { id: 1, type: "image", color: "#666" },
    { id: 2, type: "image", color: "#0066cc" },
    { id: 3, type: "image", color: "#333" },
    { id: 4, type: "image", color: "#444" },
    { id: 5, type: "emoji", emoji: "🧑‍💻" },
    { id: 6, type: "image", color: "#0066ff" },
    { id: 7, type: "emoji", emoji: "👨‍💻" },
    { id: 8, type: "image", color: "#555" },
    { id: 9, type: "image", color: "#333" },
    { id: 10, type: "image", color: "#0066cc" },
    { id: 11, type: "image", color: "#444" },
    { id: 12, type: "image", color: "#0088ff" },
    { id: 13, type: "image", color: "#666" },
    { id: 14, type: "image", color: "#333" },
  ];

  const renderMediaItem = (item, index) => {
    const itemWidth = (width - 60) / 3; // 3 columns with margins

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.mediaItem,
          {
            width: itemWidth,
            height: itemWidth,
            backgroundColor: item.color || theme.secondaryBackground,
          },
        ]}
      >
        {item.type === "emoji" ? (
          <Text style={styles.emojiText}>{item.emoji}</Text>
        ) : (
          <View style={styles.placeholderContent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.primaryBackground,
      }}
    >
      {/* Header */}
      <HeaderWithBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Community Info */}
        <View style={styles.communitySection}>
          <View style={styles.communityHeader}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: theme.shadowColor,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={styles.communityInfo}>
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 2,
                  color: theme.primaryText,
                }}
              >
                Rapport Community
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.accentText,
                }}
              >
                5,501 Members
              </Text>
            </View>
          </View>

          <Text
            style={{ color: theme.primaryText, fontSize: 14, marginBottom: 20 }}
          >
            A channel to support safety
          </Text>

          <View style={styles.inviteSection}>
            <Text
              style={{
                fontSize: 14,
                textDecorationLine: "underline",
                color: theme.accentText,
              }}
            >
              rapport@rapportcommunity.net
            </Text>
            <TouchableOpacity style={styles.qrButton}>
              <MaterialIcons name="qr-code" size={24} color="#00C6FF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inviteText}>Invite link</Text>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#00C6FF" }]}
              >
                <Ionicons name="notifications" size={20} color="white" />
              </View>
              <View>
                <Text
                  style={{
                    color: theme.primaryText,
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 2,
                  }}
                >
                  Notifications
                </Text>
                <Text style={styles.settingSubtitle}>
                  Permission & lock screen
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#555", true: "#00C6FF" }}
              thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#00C6FF" }]}
              >
                <Ionicons name="eye-off" size={20} color="white" />
              </View>
              <View>
                <Text
                  style={{
                    color: theme.primaryText,
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 2,
                  }}
                >
                  Anonymous
                </Text>
                <Text style={styles.settingSubtitle}>Story Author or seen</Text>
              </View>
            </View>
            <Switch
              value={anonymousEnabled}
              onValueChange={setAnonymousEnabled}
              trackColor={{ false: "#555", true: "#00bcd4" }}
              thumbColor={anonymousEnabled ? "#ffffff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Media Grid */}
        <View style={styles.mediaGrid}>
          {mediaItems.map((item, index) => renderMediaItem(item, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  menuButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  communitySection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00bcd4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  communityInfo: {
    flex: 1,
  },
  communityDescription: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 20,
  },
  inviteSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  qrButton: {
    padding: 5,
  },
  inviteText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsScroll: {
    paddingLeft: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#00C6FF",
  },
  tabText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#00C6FF",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  mediaItem: {
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContent: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 40,
  },
});

export default CommunitySettingsScreen;
