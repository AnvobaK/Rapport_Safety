import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const FAQScreen = () => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState({});
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("FAQs");
  const [activeCategory, setActiveCategory] = useState("General");

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const faqData = {
    General: [
      {
        question: "What is this app used for?",
        answer:
          "This app helps users report safety incidents, receive local alerts, and stay connected with their community for real-time safety updates.",
        expanded: true,
      },
      {
        question: "Is the app free to use?",
        answer:
          "Yes, this safety app is completely free to download and use. All core safety features are available at no cost.",
      },
      {
        question: "Can I report anonymously?",
        answer:
          "Yes, you can choose to report incidents anonymously. Your privacy and safety are our top priorities.",
      },
      {
        question: "Who can see my reports?",
        answer:
          "Your reports are shared with local authorities and community safety coordinators. Personal information is kept confidential unless you choose to share it.",
      },
      {
        question: "How accurate are the safety alerts?",
        answer:
          "Our safety alerts are verified by local authorities and community moderators. We prioritize accuracy and real-time updates to keep you informed.",
      },
    ],
    Account: [
      {
        question: "How do I create an account?",
        answer:
          "You can create an account by downloading the app and following the registration process. You'll need to provide a valid email address and create a secure password.",
      },
      {
        question: "Can I change my username?",
        answer:
          "Yes, you can change your username in the app settings under 'Profile Settings'. Your username must be unique and follow our community guidelines.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "If you forgot your password, tap 'Forgot Password' on the login screen. We'll send a reset link to your registered email address.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account permanently from the app settings. Please note that this action cannot be undone and all your data will be removed.",
      },
      {
        question: "How do I update my profile information?",
        answer:
          "Go to 'Profile Settings' in the app menu to update your personal information, contact details, and notification preferences.",
      },
    ],
    Service: [
      {
        question: "What types of incidents can I report?",
        answer:
          "You can report various safety incidents including accidents, suspicious activities, emergencies, infrastructure issues, and community safety concerns.",
      },
      {
        question: "How fast are emergency services notified?",
        answer:
          "Emergency reports are immediately forwarded to relevant authorities. For life-threatening emergencies, always call your local emergency number directly.",
      },
      {
        question: "Can I track the status of my report?",
        answer:
          "Yes, you can view the status of your reports in the 'My Reports' section. You'll receive updates when authorities review or act on your report.",
      },
      {
        question: "What happens after I submit a report?",
        answer:
          "Your report is immediately sent to local authorities and relevant community safety coordinators. You'll receive confirmation and status updates via the app.",
      },
      {
        question: "Can I add photos or videos to my report?",
        answer:
          "Yes, you can attach photos and videos to provide more context to your safety reports. This helps authorities better understand the situation.",
      },
    ],
    Payment: [
      {
        question: "Is there a premium version of the app?",
        answer:
          "Currently, all safety features are completely free. We may introduce premium features in the future, but core safety reporting will always remain free.",
      },
      {
        question: "Are there any hidden costs?",
        answer:
          "No, there are no hidden costs. The app is free to download and use. Standard data charges from your mobile carrier may apply.",
      },
      {
        question: "Do you sell my data?",
        answer:
          "We never sell your personal data. Your privacy is protected, and we only share incident reports with relevant authorities as needed for safety purposes.",
      },
      {
        question: "How is the app funded?",
        answer:
          "The app is funded through partnerships with local governments and community safety organizations committed to public safety.",
      },
    ],
  };

  const contactInfo = [
    {
      type: "Emergency Hotline",
      contact: "+1-911-SAFETY",
      icon: "call",
      action: () => handleCall("+19115233889"),
    },
    {
      type: "General Support",
      contact: "support@safetyapp.com",
      icon: "mail",
      action: () => handleEmail("support@safetyapp.com"),
    },
    {
      type: "Technical Issues",
      contact: "tech@safetyapp.com",
      icon: "mail",
      action: () => handleEmail("tech@safetyapp.com"),
    },
    {
      type: "Community Relations",
      contact: "+1-555-COMMUNITY",
      icon: "call",
      action: () => handleCall("+15552666864"),
    },
  ];

  const getCurrentData = () => {
    if (activeTab === "FAQs") {
      return faqData[activeCategory] || [];
    }
    return [];
  };

  const filteredData = getCurrentData().filter(
    (item) =>
      item.question.toLowerCase().includes(searchText.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderFAQs = () => (
    <>
      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        {Object.keys(faqData).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { borderColor: theme.secondaryBorder },
              activeCategory === category && { borderColor: theme.accentText },
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: theme.secondaryText },
                activeCategory === category && { color: theme.accentText },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.secondaryBackground },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.secondaryIcon}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.primaryText }]}
          placeholder="Search FAQs"
          placeholderTextColor={theme.secondaryText}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color={theme.secondaryIcon} />
        </TouchableOpacity>
      </View>

      {/* FAQ List */}
      <ScrollView
        style={styles.faqContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredData.map((item, index) => (
          <View
            key={index}
            style={[
              styles.faqItem,
              { backgroundColor: theme.secondaryBackground },
            ]}
          >
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleExpanded(index)}
            >
              <Text style={[styles.questionText, { color: theme.accentText }]}>
                {item.question}
              </Text>
              <Ionicons
                name={
                  expandedItems[index] || item.expanded
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={20}
                color={theme.secondaryIcon}
              />
            </TouchableOpacity>

            {(expandedItems[index] ||
              (item.expanded && expandedItems[index] !== false)) && (
              <View style={styles.answerContainer}>
                <Text
                  style={[styles.answerText, { color: theme.secondaryText }]}
                >
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        ))}
        {filteredData.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={theme.secondaryIcon} />
            <Text
              style={[styles.noResultsText, { color: theme.secondaryText }]}
            >
              No FAQs found
            </Text>
            <Text
              style={[styles.noResultsSubtext, { color: theme.secondaryText }]}
            >
              Try adjusting your search terms
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );

  const renderContact = () => (
    <>
      {/* Contact Header */}
      <View style={styles.contactHeader}>
        <Text style={[styles.contactTitle, { color: theme.accentText }]}>
          Get in Touch
        </Text>
        <Text style={[styles.contactSubtitle, { color: theme.secondaryText }]}>
          We're here to help with any questions or concerns
        </Text>
      </View>

      {/* Contact Methods */}
      <ScrollView
        style={styles.contactContainer}
        showsVerticalScrollIndicator={false}
      >
        {contactInfo.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.contactItem,
              { backgroundColor: theme.secondaryBackground },
            ]}
            onPress={contact.action}
          >
            <View
              style={[
                styles.contactIconContainer,
                { backgroundColor: theme.primaryBorder },
              ]}
            >
              <Ionicons
                name={contact.icon}
                size={24}
                color={theme.accentText}
              />
            </View>
            <View style={styles.contactDetails}>
              <Text style={[styles.contactType, { color: theme.accentText }]}>
                {contact.type}
              </Text>
              <Text
                style={[styles.contactMethod, { color: theme.secondaryText }]}
              >
                {contact.contact}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.secondaryIcon}
            />
          </TouchableOpacity>
        ))}

        {/* Additional Contact Information */}
        <View
          style={[
            styles.additionalInfo,
            { backgroundColor: theme.secondaryBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.accentText }]}>
            Office Hours
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Monday - Friday: 8:00 AM - 6:00 PM
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Saturday: 9:00 AM - 4:00 PM
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Sunday: Emergency only
          </Text>
        </View>

        <View
          style={[
            styles.additionalInfo,
            { backgroundColor: theme.secondaryBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.accentText }]}>
            Response Time
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Emergency reports: Immediate
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            General inquiries: Within 24 hours
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Technical issues: Within 48 hours
          </Text>
        </View>

        <View
          style={[
            styles.additionalInfo,
            { backgroundColor: theme.secondaryBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.accentText }]}>
            Follow Us
          </Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: theme.primaryBorder },
              ]}
            >
              <Ionicons
                name="logo-twitter"
                size={24}
                color={theme.accentText}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: theme.primaryBorder },
              ]}
            >
              <Ionicons
                name="logo-facebook"
                size={24}
                color={theme.accentText}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: theme.primaryBorder },
              ]}
            >
              <Ionicons
                name="logo-instagram"
                size={24}
                color={theme.accentText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView
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
          <Ionicons name="arrow-back" size={24} color={theme.accentText} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.primaryText}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu" size={24} color={theme.accentText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "FAQs" && { borderBottomColor: theme.accentText },
          ]}
          onPress={() => setActiveTab("FAQs")}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.secondaryText },
              activeTab === "FAQs" && { color: theme.accentText },
            ]}
          >
            FAQs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "Contact" && { borderBottomColor: theme.accentText },
          ]}
          onPress={() => setActiveTab("Contact")}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.secondaryText },
              activeTab === "Contact" && { color: theme.accentText },
            ]}
          >
            Contact
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Content */}
      {activeTab === "FAQs" ? renderFAQs() : renderContact()}
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
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    marginRight: 30,
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  categoryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 5,
  },
  faqContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  faqItem: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 15,
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  // Contact Styles
  contactHeader: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  contactContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  contactDetails: {
    flex: 1,
  },
  contactType: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  contactMethod: {
    fontSize: 14,
  },
  additionalInfo: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  socialContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FAQScreen;
