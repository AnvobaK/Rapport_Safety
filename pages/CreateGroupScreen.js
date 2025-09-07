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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import { useGroups } from "../context/GroupsContext";

const sampleContacts = [
  {
    id: "1",
    name: "Amber Bird",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: "2",
    name: "Annabel Mayor",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: "3",
    name: "Arnold Gold",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
  {
    id: "4",
    name: "Barney Baines",
    avatar: "https://i.pravatar.cc/100?img=4",
  },
  {
    id: "5",
    name: "Betty Booze",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: "6",
    name: "Bill Rich",
    avatar: "https://i.pravatar.cc/100?img=6",
  },
  {
    id: "7",
    name: "Brooke Davis",
    avatar: "https://i.pravatar.cc/100?img=7",
  },
  {
    id: "8",
    name: "Brooke Dr",
    avatar: "https://i.pravatar.cc/100?img=8",
  },
];

const CreateGroupScreen = ({ navigation }) => {
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const { addGroup } = useGroups();
  const [errorMessage, setErrorMessage] = useState("");

  const toggleContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setErrorMessage("Please enter a group name.");
      return;
    }
    if (selectedContacts.length === 0) {
      setErrorMessage("Please select at least one member.");
      return;
    }
    const groupId = addGroup(groupName, selectedContacts);
    console.log(
      "Created group with ID:",
      groupId,
      "Members:",
      selectedContacts
    );
    navigation.replace("GroupChatScreen", { groupId });
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const renderContactItem = ({ item }) => {
    const selected = selectedContacts.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          selected && { backgroundColor: theme.secondaryBackground },
        ]}
        onPress={() => toggleContact(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={[styles.contactName, { color: theme.primaryText }]}>
          {item.name}
        </Text>
        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={theme.accentText}
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackground}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.accentText} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
            Create Group
          </Text>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.primaryText,
              backgroundColor: theme.secondaryBackground,
            },
            errorMessage === "Please enter a group name." && {
              borderColor: "#d32f2f",
              borderWidth: 1,
            },
          ]}
          placeholder="Please enter a group name"
          placeholderTextColor={theme.secondaryText}
          value={groupName}
          onChangeText={setGroupName}
        />
        {errorMessage === "Please enter a group name." && (
          <Text style={styles.inputErrorText}>{errorMessage}</Text>
        )}
      </View>
      <Text style={[styles.selectMembers, { color: theme.accentText }]}>
        Select Members
      </Text>
      <FlatList
        data={sampleContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contactsList}
      />
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.accentText }]}
        onPress={handleCreateGroup}
      >
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
      {/* Only show toast for member error */}
      {errorMessage === "Please select at least one member." ? (
        <View style={styles.toastContainer} pointerEvents="none">
          <Text style={styles.toastText}>{errorMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    position: "relative",
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  selectMembers: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 20,
    marginBottom: 8,
  },
  contactsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  createButton: {
    margin: 20,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toastContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#d32f2f",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  inputErrorText: {
    color: "#d32f2f",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default CreateGroupScreen;
