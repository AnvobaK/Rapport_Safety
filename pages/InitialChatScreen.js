import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/core";
import { useChats } from "../context/ChatsContext";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const InitialChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chats, addChat, removeChat } = useChats();
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    if (route.params?.newChat && route.params?.fromChat) {
      const newChat = route.params.newChat;
      addChat(newChat);
      navigation.setParams({ newChat: undefined, fromChat: undefined });
    }
  }, [route.params?.newChat, route.params?.fromChat]);

  const handleWriteMessage = () => {
    navigation.navigate("Contact");
  };

  const handleChatPress = (chat) => {
    navigation.navigate("ChatScreen", { contact: chat.contact });
  };

  const handleChatLongPress = (chat) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete the chat with ${chat.contact.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeChat(chat.id);
          },
        },
      ]
    );
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: theme.primaryBorder }]}
      onPress={() => handleChatPress(item)}
      onLongPress={() => handleChatLongPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.contact.avatar }} style={styles.chatAvatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: theme.primaryText }]}>
            {item.contact.name}
          </Text>
          <Text style={[styles.chatTime, { color: theme.secondaryText }]}>
            {item.timestamp}
          </Text>
        </View>
        <View style={styles.chatFooter}>
          <Text
            style={[styles.lastMessage, { color: theme.secondaryText }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.accentText },
              ]}
            >
              <Text
                style={[styles.unreadCount, { color: theme.primaryBackground }]}
              >
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show empty state if no chats
  if (chats.length === 0) {
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.accentIcon} />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View style={styles.mainContent}>
          {/* Chat Bubble Icon */}
          <View style={styles.chatBubbleContainer}>
            <Image
              source={require("../images/mage_message-dots-fill.png")}
              style={styles.Image}
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={[styles.welcomeText, { color: theme.accentText }]}>
              Welcome
            </Text>
            <Text style={[styles.welcomeText, { color: theme.accentText }]}>
              to your inbox!
            </Text>

            <Text style={[styles.subtitleText, { color: theme.secondaryText }]}>
              Start talking with your friends, and{"\n"}
              share whatever is in your mind!
            </Text>
          </View>

          {/* Write Message Button */}
          <TouchableOpacity
            style={[
              styles.writeMessageButton,
              { backgroundColor: theme.accentText },
            ]}
            onPress={handleWriteMessage}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.buttonText, { color: theme.primaryBackground }]}
            >
              Write Message!
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show chats list if there are chats
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
          <Ionicons name="arrow-back" size={24} color={theme.accentIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          Messages
        </Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={handleWriteMessage}
        >
          <Ionicons name="add" size={24} color={theme.accentIcon} />
        </TouchableOpacity>
      </View>

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatsList}
        contentContainerStyle={styles.chatsContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Hint for long press */}
      {chats.length > 0 && (
        <View style={styles.hintContainer}>
          <Text style={[styles.hintText, { color: theme.secondaryText }]}>
            Long press on a chat to delete it
          </Text>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  newMessageButton: {
    padding: 5,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  chatBubbleContainer: {
    marginBottom: 10,
  },
  Image: {
    width: 150,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 40,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 22,
  },
  writeMessageButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    marginBottom: 90,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  // Chat list styles
  chatsList: {
    flex: 1,
  },
  chatsContainer: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatTime: {
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  hintContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    bottom: 30,
  },
  hintText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});

export default InitialChatScreen;
