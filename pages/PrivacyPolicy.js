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

const PrivacyPolicyPage = () => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Data object containing all the terms and conditions content
  const termsData = {
    header: {
      title: "Privacy Policy",
      effectiveDate: "12/06/2025",
      appName: "Rapport",
      owner: "Priscilla Kwofie",
    },
    sections: [
      {
        id: 1,
        title: "Introduction",
        content:
          "We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that information.",
      },
      {
        id: 2,
        title: "What information we collect",
        content:
          "We may collect the following information when you use the app: ",
        subsections: [
          "Account Information: Name, email address, phone number (if required for account setup).",
          "Location Data: Your real-time or recent location to enable location-based alerts and reporting features (only if you give permission).",
          "Reports and Submissions: Text, audio, or media you submit when reporting an incident or sharing community information.",
          "Device Information: Basic technical data like device type, operating system, and app version (for diagnostics and performance).",
          "Usage Data: Interactions with features, screen visits, and report history (to improve the user experience",
        ],
      },
      {
        id: 3,
        title: "How we use your information",
        content: "We use your data to:",
        subsections: [
          "Operate and improve app functionality.",
          "Provide you with safety alerts and incident reports relevant to your location.",
          "Facilitate communication within the community (e.g., messages, tips, reports).",
          "Send important updates, such as community notices or feature changes.",
          "Respond to user inquiries and technical issues.",
        ],
        footer: "We do not sell your data to third parties",
      },
      {
        id: 4,
        title: "How we share information",
        content: "We may share limited information: ",
        subsections: [
          "With moderators for reviewing and managing content.",
          "With emergency responders only when you explicitly consent to share details for your safety.",
          "With service providers who help us operate the app (e.g., cloud hosting, analytics) under strict confidentiality.",
        ],
        footer:
          "We will never share your personal data for advertising or marketing purposes",
      },
      {
        id: 5,
        title: "Data Security",
        content:
          "We implement industry-standard safeguards to protect your data, including:",
        subsections: [
          "Encrypted communication (HTTPS)",
          "Secure authentication methods",
          "Regular audits and vulnerability testing",
        ],
        footer:
          "Despite our efforts, no system can be 100% secure. Use the app responsibly and avoid sharing sensitive personal data unnecessarily.",
      },
      {
        id: 6,
        title: "Your Rights",
        subsections: [
          "Depending on your location, you may have the right to:",
          "Access the data we hold about you",
          "Correct inaccurate data",
          "Request deletion of your account and associated data",
          "Withdraw consent (for features like location tracking)",
          "To make a request, contact us at [Insert Contact Email].",
        ],
      },
      {
        id: 7,
        title: "Data Retention",
        content:
          "This app is not intended for use by children under the age of 13 (or applicable age in your region) without parental or guardian consent. We do not knowingly collect data from minors without such consent.",
      },
      {
        id: 8,
        title: "Children's Privacy",
        content:
          "This app is not intended for use by children under the age of 13 (or applicable age in your region) without parental or guardian consent. We do not knowingly collect data from minors without such consent.",
      },
      {
        id: 9,
        title: "Changes to this Policy",
        content:
          "We may update this policy occasionally. You will be notified via in-app notice or email if there are significant changes. Continued use of the app implies acceptance of the latest version.",
      },
      {
        id: 10,
        title: "Contact Us",
        content:
          "If you have questions, feedback, or privacy-related requests, please contact: 📧 [rapportprivacy&concerns@gmail.com]",
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

export default PrivacyPolicyPage;
