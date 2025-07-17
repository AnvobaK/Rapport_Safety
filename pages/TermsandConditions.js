import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const TermsConditionsPage = () => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Data object containing all the terms and conditions content
  const termsData = {
    header: {
      title: "Terms & Conditions of Use",
      effectiveDate: "12/06/2025",
      appName: "Rapport",
      owner: "Priscilla Kwofie",
    },
    sections: [
      {
        id: 1,
        title: "Acceptance of Terms",
        content:
          "By accessing or using this app, you agree to comply with these Terms and Conditions. If you do not agree, you should not use the app.",
      },
      {
        id: 2,
        title: "Purpose of the app",
        content:
          "This app is designed to enhance community safety by allowing users to report incidents, share alerts, and receive safety-related updates. It does not function as an emergency service.",
      },
      {
        id: 3,
        title: "User Responsibilities",
        content: "As a user, you agree to:",
        subsections: [
          "Use the app only for lawful and intended purposes.",
          "Provide accurate and honest information in all reports or communications.",
          "Keep your account details secure and not share access with others.",
          "Refrain from misuse, including submitting false reports or engaging in harassment.",
        ],
        footer:
          "Violation of these terms may result in restricted access or account termination.",
      },
      {
        id: 4,
        title: "User-Generated Content",
        content:
          "Users may submit reports, messages, and other content through the app. By submitting content, you grand usa limited license to display and use it for the purposes of promoting safety and awareness. We may moderate or remove content that is misleading, harmful, or inappropriate at our sole discretion.",
      },
      {
        id: 5,
        title: "Community Guidelines",
        content: "To maintain a safe and respectful environment, users must:",
        subsections: [
          "Avoid posting offensive, threatening, or illegal content.",
          "Respect the rights and privacy of others.",
          "Use the app in a way that promotes safety and constructive engagement.",
        ],
        footer:
          "We reserve the right to take appropriate action, including removing content or suspending accounts, to enforce these guidelines.",
      },
      {
        id: 6,
        title: "Moderation & Reporting",
        subsections: [
          "Reports and submissions may be reviewed by moderators to ensure community safety and compliance.",
          "Users can report inappropriate or unsafe content.",
          "Decisions made regarding moderation are final and may not be appealed.",
        ],
      },
      {
        id: 7,
        title: "Not an Emergency Service",
        content:
          "This app is not a replacement for emergency services.In the event of a real emergency, always contact your local police, fire department, or medical services.",
      },
      {
        id: 8,
        title: "Modifications & Updates",
        content:
          "We may update these Terms periodically. You'll be notified of significant changes via in-app notice or other appropriate means. Continued use of the app constitutes acceptance of the revised terms.",
      },
      {
        id: 9,
        title: "Contact",
        content:
          "For questions, technical issues, or feedback, please contact us at:  [rapporthelp&support@gmail.com]",
      },
    ],
  };
  const navigation = useNavigation();

  const renderSection = (section) => {
    return (
      <View key={section.id} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          {section.id}. {section.title}
        </Text>
        <Text style={[styles.sectionContent, { color: theme.secondaryText }]}>
          {section.content}
        </Text>

        {section.subsections && (
          <View style={styles.subsectionContainer}>
            {section.subsections.map((subsection, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={[styles.bullet, { color: theme.secondaryText }]}>
                  •
                </Text>
                <Text
                  style={[styles.bulletText, { color: theme.secondaryText }]}
                >
                  {subsection}
                </Text>
              </View>
            ))}
          </View>
        )}

        {section.footer && (
          <Text style={[styles.sectionFooter, { color: theme.secondaryText }]}>
            {section.footer}
          </Text>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: theme.primaryBackground }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.accentText} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.primaryText}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="menu" size={24} color={theme.primaryText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {termsData.header.title}
        </Text>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Effective Date: {termsData.header.effectiveDate}
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            App Name: {termsData.header.appName}
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Owner/Operator: {termsData.header.owner}
          </Text>
        </View>

        {/* Sections */}
        {termsData.sections.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    lineHeight: 36,
    textAlign: "center",
  },
  appInfo: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 24,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 28,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  subsectionContainer: {
    marginTop: 10,
    marginLeft: 10,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  sectionFooter: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 15,
  },
});

export default TermsConditionsPage;
