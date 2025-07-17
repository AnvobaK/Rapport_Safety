import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const ContactsScreen = ({ navigation }) => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const [searchText, setSearchText] = useState("");

  // Sample contact data - replace with your actual data
  const contacts = [
    {
      id: "1",
      name: "Amber Bird",
      avatar: "https://i.pravatar.cc/100?img=1",
      status: "Online",
      lastSeen: "2 minutes ago",
    },
    {
      id: "2",
      name: "Annabel Mayor",
      avatar: "https://i.pravatar.cc/100?img=2",
      status: "Last seen 1 hour ago",
      lastSeen: "1 hour ago",
    },
    {
      id: "3",
      name: "Arnold Gold",
      avatar: "https://i.pravatar.cc/100?img=3",
      status: "Online",
      lastSeen: "5 minutes ago",
    },
    {
      id: "4",
      name: "Barney Baines",
      avatar: "https://i.pravatar.cc/100?img=4",
      status: "Last seen 30 minutes ago",
      lastSeen: "30 minutes ago",
    },
    {
      id: "5",
      name: "Betty Booze",
      avatar: "https://i.pravatar.cc/100?img=5",
      status: "Online",
      lastSeen: "1 minute ago",
    },
    {
      id: "6",
      name: "Bill Rich",
      avatar: "https://i.pravatar.cc/100?img=6",
      status: "Last seen 2 hours ago",
      lastSeen: "2 hours ago",
    },
    {
      id: "7",
      name: "Brooke Davis",
      avatar: "https://i.pravatar.cc/100?img=7",
      status: "Online",
      lastSeen: "Just now",
    },
    {
      id: "8",
      name: "Brooke Dr",
      avatar: "https://i.pravatar.cc/100?img=8",
      status: "Last seen yesterday",
      lastSeen: "Yesterday",
    },
  ];

  const handleBack = () => {};

  const handleNewContact = () => {
    console.log("New Contact pressed");
  };

  const handleNewGroup = () => {
    navigation.navigate("CreateGroupScreen");
  };

  const handleContactPress = (contact) => {
    console.log("Contact pressed:", contact.name);
    // Navigate to chat screen with selected contact
    navigation.navigate("ChatScreen", { contact });
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.status === "Online" && (
          <View
            style={[
              styles.onlineIndicator,
              { borderColor: theme.primaryBackground },
            ]}
          />
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: theme.primaryText }]}>
          {item.name}
        </Text>
        <Text style={[styles.contactStatus, { color: theme.secondaryText }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderActionItem = ({ icon, title, onPress, iconBg }) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <Text style={[styles.actionTitle, { color: theme.primaryText }]}>
        {title}
      </Text>
    </TouchableOpacity>
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
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.secondaryBackground },
          ]}
        >
          <Ionicons name="search" size={24} color={theme.accentText} />
          <TextInput
            style={[styles.searchInput, { color: theme.primaryText }]}
            placeholder="Search for users"
            placeholderTextColor={theme.secondaryText}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Action Items */}
      <View style={styles.actionsContainer}>
        {renderActionItem({
          icon: <Ionicons name="people-outline" size={20} color="#fff" />,
          title: "New Group",
          onPress: handleNewGroup,
          iconBg: theme.accentText,
        })}
      </View>

      {/* Members Section */}
      <View style={styles.membersContainer}>
        <Text style={[styles.membersTitle, { color: theme.accentText }]}>
          Members
        </Text>
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactsList}
        />
      </View>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  iconText: {
    fontSize: 18,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 12,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actionIconText: {
    fontSize: 18,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  membersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  contactsList: {
    paddingBottom: 100, // Space for bottom navigation
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ade80",
    borderWidth: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 14,
  },
});

export default ContactsScreen;
