import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export default function BottomNavigation({ onTabPress, activeTab = "home" }) {
  const route = useRoute();
  const currentRoute = route.name;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleTabPress = (tabName) => {
    if (currentRoute === tabName) {
      // Already on tab, trigger scroll-to-top
      navigation.setParams({ scrollToTop: true });
    } else {
      navigation.navigate(tabName, { scrollToTop: false });
    }
  };

  // Function to check if community tab should be active
  const isCommunityActive = () => {
    const communityRoutes = ["CommunityRules", "community"];
    return communityRoutes.includes(currentRoute);
  };

  // Function to check if location tab should be active
  const isLocationActive = () => {
    const locationRoutes = ["location", "Location", "LocationScreen"];
    return locationRoutes.includes(currentRoute);
  };

  // Function to check if chat tab should be active
  const isChatActive = () => {
    const chatRoutes = ["chat", "Chat", "ChatScreen", "Contact"];
    return chatRoutes.includes(currentRoute);
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {/* Main navigation tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("Dashboard")}
        >
          <MaterialCommunityIcons
            name="view-grid"
            size={24}
            color={currentRoute === "Dashboard" ? "#00BFFF" : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("location")}
        >
          <Ionicons
            name="location-outline"
            size={24}
            color={isLocationActive() ? "#00BFFF" : "#6B7280"}
          />
        </TouchableOpacity>

        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => handleTabPress("sos")}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("CommunityRules")}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color={isCommunityActive() ? "#00BFFF" : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("chat")}
        >
          <Feather
            name="message-square"
            size={24}
            color={isChatActive() ? "#00BFFF" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0E1A",
    width: "100%",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flex: 1,
  },
  sosButton: {
    backgroundColor: "#F23F42",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
    shadowColor: "#F05252",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  sosText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
