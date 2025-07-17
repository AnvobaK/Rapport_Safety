import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const notifications = [
  {
    id: 2,
    source: "From Community",
    message:
      "Jenna just thanked you for your last report 💜 — your voice matters.",
    time: "30m ago",
  },
];

const Dashboard = ({ navigation }) => {
  const {
    hasAgreedToCommunityRules,
    resetCommunityRulesAgreement,
    isDarkMode,
  } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const handleNotificationPress = () => {
    navigation.navigate("Notificationswithmessages");
  };

  const handleMenuPress = () => {
    console.log("Menu pressed");
  };

  const Voicerecorder = () => {
    navigation.navigate("Recording");
  };

  const ReportPage = () => {
    navigation.navigate("ReportPage");
  };

  const handleCommunityPress = () => {
    if (hasAgreedToCommunityRules) {
      navigation.navigate("Community");
    } else {
      navigation.navigate("CommunityRulesScreen");
    }
  };

  const handleCommunityLongPress = () => {
    // Reset community rules agreement for testing
    resetCommunityRulesAgreement();
    alert("Community rules agreement reset! You can now test the flow again.");
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.primaryBackground }]}
    >
      <View
        style={[
          styles.mainWrapper,
          { backgroundColor: theme.primaryBackground },
        ]}
      >
        <Header
          navigation={navigation}
          onNotificationPress={handleNotificationPress}
          onMenuPress={handleMenuPress}
        />

        <View style={styles.contentArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Community Gradient Card */}
            <LinearGradient
              colors={["#7be0ff", "#d28eff"]}
              style={styles.communityCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.communityTitle}>Check out our community</Text>
              <Text style={styles.communitySubtitle}>
                chat with other people in your vicinity
              </Text>
              <TouchableOpacity
                style={styles.seeMoreBtn}
                onPress={handleCommunityPress}
                onLongPress={handleCommunityLongPress}
              >
                <Text style={styles.seeMoreText}>See more</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={ReportPage}
              >
                <View style={styles.textContainer}>
                  <Text
                    style={[styles.actionTitle, { color: theme.primaryText }]}
                  >
                    Write Report
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtitle,
                      { color: theme.secondaryText },
                    ]}
                  >
                    Write. Report. Stay safe.
                  </Text>
                </View>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.accentText },
                  ]}
                >
                  <Ionicons name="create-outline" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={Voicerecorder}
              >
                <View style={styles.textContainer}>
                  <Text
                    style={[styles.actionTitle, { color: theme.primaryText }]}
                  >
                    Quick Record
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtitle,
                      { color: theme.secondaryText },
                    ]}
                  >
                    See it, record it, report it.
                  </Text>
                </View>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.accentText },
                  ]}
                >
                  <Ionicons name="mic-outline" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Notifications */}
            <View style={styles.notificationHeader}>
              <Text
                style={[styles.notificationTitle, { color: theme.primaryText }]}
              >
                Notifications
              </Text>
              <TouchableOpacity
                style={styles.seeAllContainer}
                onPress={handleNotificationPress}
              >
                <Text style={[styles.seeAll, { color: theme.accentText }]}>
                  See all
                </Text>
                <Ionicons
                  name="arrow-forward-sharp"
                  size={15}
                  color={theme.accentText}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>

            {notifications.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <View style={styles.notificationTextWrapper}>
                  <Text
                    style={[
                      styles.notificationSource,
                      { color: theme.accentText },
                    ]}
                  >
                    {item.source}
                  </Text>
                  <Text
                    style={[
                      styles.notificationText,
                      { color: theme.primaryText },
                    ]}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={[
                      styles.notificationTime,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.notificationImage}
                />
              </View>
            ))}

            {/* Spacer to avoid overlap with bottom nav */}
            <View style={{ height: 80 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  communityCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  communityTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  communitySubtitle: {
    color: "#333",
    fontSize: 14,
    marginBottom: 12,
  },
  seeMoreBtn: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  seeMoreText: {
    color: "#fff",
    fontWeight: "500",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeAllContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAll: {
    fontWeight: "500",
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationSource: {
    fontSize: 13,
    marginBottom: 6,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
});
