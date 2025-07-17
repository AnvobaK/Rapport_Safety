import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import HeaderWithBack from "../components/Headerwithbackbutton";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Notifications = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "Ropoort",
      title:
        "New Feature: You can now submit reports anonymously. Try it in the app!",
      time: "30m ago",
      icon: "document-text-outline",
    },
    {
      id: 2,
      type: "Community",
      title:
        "Jenna just thanked you for your last report 👏 — your voice matters.",
      time: "30m ago",
      icon: "heart-outline",
    },
    {
      id: 3,
      type: "Community",
      title:
        "Maya just shared something: 'Saw something sketchy near North Gate ar...'",
      time: "30m ago",
      icon: "chatbubble-outline",
    },
    {
      id: 4,
      type: "Community",
      title:
        "New chat going on: 'Safe routes after dark—got tips or concerns? Jump in!'",
      time: "30m ago",
      icon: "chatbubbles-outline",
    },
    {
      id: 5,
      type: "News Reports",
      title:
        "Heads up: Multiple people reported harassment near West Park tonight. Tr...",
      time: "30m ago",
      icon: "warning-outline",
    },
    {
      id: 6,
      type: "Community",
      title:
        "New chat going on: 'Safe routes after dark—got tips or concerns? Jump in!'",
      time: "30m ago",
      icon: "chatbubbles-outline",
    },
    {
      id: 7,
      type: "News Reports",
      title:
        "Severe weather alert 🚨 — stay inside and take cover if you're nearby.",
      time: "30m ago",
      icon: "thunderstorm-outline",
    },
  ]);

  const [isClearing, setIsClearing] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Animation values for each notification card
  const cardAnimations = useRef(
    notifications.map(() => new Animated.Value(0))
  ).current;

  // Empty state animations
  const [pulseAnim] = useState(new Animated.Value(1));
  const emptyOpacity = useRef(new Animated.Value(0)).current;
  const emptyTranslateY = useRef(new Animated.Value(50)).current;

  // Initialize card animations
  React.useEffect(() => {
    if (!showEmpty) {
      // Stagger the card entrance animations
      Animated.stagger(
        100,
        cardAnimations.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [showEmpty]);

  // Empty state pulse animation
  React.useEffect(() => {
    if (showEmpty) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [showEmpty]);

  const handleClearAll = () => {
    if (isClearing) return;

    setIsClearing(true);

    // Animate cards out with stagger effect
    Animated.stagger(
      80,
      cardAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: -1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start(() => {
      // After cards are gone, show empty state
      setNotifications([]);
      setShowEmpty(true);

      // Animate empty state in
      Animated.parallel([
        Animated.timing(emptyOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(emptyTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsClearing(false);
      });
    });
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
    console.log("Back button pressed");
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    console.log(`Navigating to ${tabName}`);
  };

  const handleSOSPress = () => {
    console.log("SOS button pressed");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Ropoort":
        return "document-text-outline";
      case "Community":
        return "people-outline";
      case "News Reports":
        return "newspaper-outline";
      default:
        return "notifications-outline";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Ropoort":
        return theme.accentText;
      case "Community":
        return theme.accentText;
      case "News Reports":
        return theme.accentText;
      default:
        return theme.accentText;
    }
  };

  const renderNotificationCard = (notification, index) => {
    const animValue = cardAnimations[index];

    return (
      <Animated.View
        key={notification.id}
        style={[
          styles.notificationCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.primaryBorder,
          },
          {
            opacity: animValue.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0, 0, 1],
            }),
            transform: [
              {
                translateX: animValue.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-screenWidth, 0, 0],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0.8, 1, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.accentText },
            ]}
          >
            <Text style={[styles.iconText, { color: theme.primaryBackground }]}>
              R
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.typeText,
                { color: getTypeColor(notification.type) },
              ]}
            >
              From {notification.type}
            </Text>
            <Text style={[styles.titleText, { color: theme.primaryText }]}>
              {notification.title}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: theme.secondaryText }]}>
            {notification.time}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: emptyOpacity,
          transform: [{ translateY: emptyTranslateY }],
        },
      ]}
    >
      {/* Notification Bell Animation */}
      <View style={styles.bellContainer}>
        <View
          style={[
            styles.outerRing,
            {
              backgroundColor: `rgba(0, 198, 255, 0.1)`,
              borderColor: `rgba(0, 198, 255, 0.2)`,
            },
          ]}
        >
          <View
            style={[
              styles.middleRing,
              {
                backgroundColor: `rgba(0, 198, 255, 0.15)`,
                borderColor: `rgba(0, 198, 255, 0.3)`,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.innerCircle,
                {
                  backgroundColor: theme.accentText,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color={theme.primaryBackground}
              />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* No Notifications Message */}
      <View style={styles.messageContainer}>
        <Text style={[styles.mainMessage, { color: theme.accentText }]}>
          There's no notifications
        </Text>
        <Text style={[styles.subMessage, { color: theme.secondaryText }]}>
          Your notifications will be{"\n"}appear on this page
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.primaryBackground }]}
    >
      <View
        style={[styles.container, { backgroundColor: theme.primaryBackground }]}
      >
        {/* Header */}
        <HeaderWithBack
          onBackPress={handleBackPress}
          rightComponent={
            <TouchableOpacity style={styles.profileButton}>
              <Feather name="menu" size={24} color={theme.accentIcon} />
            </TouchableOpacity>
          }
        />

        {/* Clear All Button */}
        {!showEmpty && (
          <View style={styles.clearButtonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              disabled={isClearing}
            >
              <Text
                style={[styles.clearButtonText, { color: theme.accentText }]}
              >
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {showEmpty ? (
            renderEmptyState()
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {notifications.map((notification, index) =>
                renderNotificationCard(notification, index)
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  clearButtonContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty state styles (from your original code)
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bellContainer: {
    marginBottom: 70,
  },
  outerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  middleRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  messageContainer: {
    alignItems: "center",
  },
  mainMessage: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  subMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});
