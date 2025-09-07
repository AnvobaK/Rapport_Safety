import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import { useUserPreferences } from "../context/UserPreferencesContext";

const CommunityRulesScreen = ({ route }) => {
  const scrollRef = useRef();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { setAgreedToCommunityRules } = useUserPreferences();

  useEffect(() => {
    if (route.params?.scrollToTop && isFocused) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [route.params, isFocused]);

  const handleAccept = async () => {
    setIsLoading(true);

    // Simulate loading time
    setTimeout(async () => {
      await setAgreedToCommunityRules(true);
      setIsLoading(false);
      navigation.replace("CommunityPage");
    }, 1500); // 1.5 seconds loading time
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#00C6FF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>R</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Rapport</Text>
          <Text style={styles.welcomeDescription}>
            This is the beginning of this channel. Here are rules to help you
            get started. For more, check out our{" "}
            <Text style={styles.link}>Rapport Community Guide</Text>
          </Text>
        </View>

        {/* Rules Section */}
        <View style={styles.rulesContainer}>
          {/* Rule 1 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>1.</Text>
              <Text style={styles.ruleTitle}>Be Respectful and Kind</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Treat everyone with respect. Harassment, hate speech, or abusive
              behavior will not be tolerated.
            </Text>
          </View>

          {/* Rule 2 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>2.</Text>
              <Text style={styles.ruleTitle}>Stay on Topic</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Keep discussions focused on safety, local alerts, community
              concerns, and app-related feedback.
            </Text>
          </View>

          {/* Rule 3 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>3.</Text>
              <Text style={styles.ruleTitle}>No False Reports or Panic</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Do not post unverified threats, rumors, or fake alerts. Accuracy
              matters in safety.
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>4.</Text>
              <Text style={styles.ruleTitle}>Protect Privacy</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Never share private information (yours or others') like phone
              numbers, addresses, or personal identities.
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>5.</Text>
              <Text style={styles.ruleTitle}>No spam or self promotion</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Avoid irrelevant links, reptitive messages, or promoting unrelated
              services/products.
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>6.</Text>
              <Text style={styles.ruleTitle}>Report Issues Responsibly</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Use the proper in-app tools or alert moderators when reporting
              incidents. Don't flood the chat.
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>7.</Text>
              <Text style={styles.ruleTitle}>
                Use Clear & Respectful Language
              </Text>
            </View>
            <Text style={styles.ruleDescription}>
              Avoid ALL CAPS, profanity, or inflammatory remarks. We're here to
              help, not provoke.
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>8.</Text>
              <Text style={styles.ruleTitle}>Follow Moderator Guidance</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Moderators are here to maintain safety and order. Their decisions
              are final.
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>9.</Text>
              <Text style={styles.ruleTitle}>
                Do not post violence and Graphic Content
              </Text>
            </View>
            <Text style={styles.ruleDescription}>
              Keep the space safe for everyone. If necessary, report such
              content through private channels. .
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleNumber}>10.</Text>
              <Text style={styles.ruleTitle}>Think before you share</Text>
            </View>
            <Text style={styles.ruleDescription}>
              Is it helpful, respectful, and true? If not, don't post it.
            </Text>
          </View>
        </View>

        {/* Accept Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.acceptButtonText}>I Agree to the Rules</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C6FF" />
            <Text style={styles.loadingText}>Setting up your community...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1426",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  resetButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "flex-start",
    marginBottom: 30,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: "#00C6FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#0B1426",
    fontSize: 24,
    fontWeight: "bold",
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  welcomeDescription: {
    color: "#8B9DC3",
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    color: "#00C6FF",
  },
  rulesContainer: {
    gap: 20,
    paddingBottom: 100,
  },
  ruleCard: {
    backgroundColor: "#0F1B2F",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#70B0FF",
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ruleNumber: {
    color: "#00C6FF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    marginTop: 2,
  },
  ruleTitle: {
    color: "#00C6FF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  ruleDescription: {
    color: "#DBDEE1",
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 24,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#0B1426",
    borderTopWidth: 1,
    borderTopColor: "#1A2942",
  },
  navButton: {
    padding: 8,
  },
  navSpacer: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#00C6FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#0F1B2F",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
export default CommunityRulesScreen;
