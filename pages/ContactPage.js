import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const ContactsScreen = ({ navigation }) => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    setIsLoading(true);
    fetch('https://rapport-backend.onrender.com/auth/')
      .then((response) => response.json())
      .then(({ data }) => {
        const processedUsers = data.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar || 'https://i.pravatar.cc/100?img=' + Math.floor(Math.random() * 70),
          status: Math.random() > 0.5 ? 'Online' : `Last seen ${Math.floor(Math.random() * 24)} hours ago`,
          lastSeen: getRandomLastSeen()
        }));
        setContacts(processedUsers);
      })
      .catch(error => console.error('Error fetching users:', error))
      .finally(() => setIsLoading(false));
  }

  // Helper function to generate random last seen times
  const getRandomLastSeen = () => {
    const times = [
      'Just now',
      '1 minute ago',
      '5 minutes ago',
      '10 minutes ago',
      '30 minutes ago',
      '1 hour ago',
      '2 hours ago',
      'Yesterday',
      '2 days ago'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

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
        {isLoading && <ActivityIndicator/>}
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
