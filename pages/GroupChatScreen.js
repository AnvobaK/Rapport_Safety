import React, { useState, useRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import { useGroups } from "../context/GroupsContext";

const { width } = Dimensions.get("window");

const dummyAvatars = [
  "https://i.pravatar.cc/100?img=1",
  "https://i.pravatar.cc/100?img=2",
  "https://i.pravatar.cc/100?img=3",
  "https://i.pravatar.cc/100?img=4",
  "https://i.pravatar.cc/100?img=5",
  "https://i.pravatar.cc/100?img=6",
  "https://i.pravatar.cc/100?img=7",
  "https://i.pravatar.cc/100?img=8",
];

const GroupChatScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { getGroup, sendMessage } = useGroups();
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);
  const [input, setInput] = useState("");
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const flatListRef = useRef();

  const group = getGroup(groupId);
  if (!group) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.primaryBackground }]}
      >
        <Text
          style={{
            color: theme.primaryText,
            textAlign: "center",
            marginTop: 40,
          }}
        >
          Group not found.
        </Text>
      </SafeAreaView>
    );
  }

  // Assign dummy avatars to group members
  const groupMembers = group.members.map((name, idx) => ({
    name,
    avatar: dummyAvatars[idx % dummyAvatars.length],
  }));
  const groupAvatar = groupMembers[0]?.avatar;

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(groupId, "You", input.trim());
      setInput("");
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      sendMessage(groupId, "You", "", imageUri, null, null);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    setShowMediaOptions(false);
  };

  const handlePickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const videoUri = result.assets[0].uri;
      sendMessage(groupId, "You", "", null, videoUri, null);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    setShowMediaOptions(false);
  };

  // Admin functions (assume 'You' is creator for demo)
  const isAdmin = group.members[0] === "You";

  const handleRemoveMember = (member) => {
    if (member === "You") return;
    const updatedMembers = group.members.filter((m) => m !== member);
    group.members = updatedMembers;
    Alert.alert("Member Removed", `${member} has been removed from the group.`);
  };

  const handleChangeGroupName = () => {
    if (newGroupName.trim()) {
      group.name = newGroupName.trim();
      setEditingName(false);
      setNewGroupName("");
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === "You";
    const member = groupMembers.find((m) => m.name === item.sender);
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage
              ? [styles.myMessageBubble, { backgroundColor: theme.accentText }]
              : [
                  styles.otherMessageBubble,
                  { backgroundColor: theme.secondaryBackground },
                ],
          ]}
        >
          {!isMyMessage && (
            <Text
              style={[
                styles.sender,
                { color: theme.accentText, marginBottom: 2 },
              ]}
            >
              {item.sender}
            </Text>
          )}
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.messageImage} />
          )}
          {item.video && (
            <View style={styles.messageVideo}>
              <Image source={{ uri: item.video }} style={styles.messageImage} />
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="#fff" />
              </View>
            </View>
          )}
          {item.text ? (
            <Text style={[styles.messageText, { color: theme.primaryText }]}>
              {item.text}
            </Text>
          ) : null}
          <Text style={[styles.messageTime, { color: theme.secondaryText }]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.primaryBackground }]}
      >
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.statusBarBackground}
        />
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: theme.primaryBorder }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("InitialChatScreen")}
          >
            <Ionicons name="arrow-back" size={24} color={theme.accentText} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerCenter}
            onPress={() => setShowGroupInfo(true)}
          >
            <Image source={{ uri: groupAvatar }} style={styles.headerAvatar} />
            <View style={styles.headerInfo}>
              <Text
                style={[styles.headerName, { color: theme.primaryText }]}
                numberOfLines={1}
              >
                {group.name}
              </Text>
              <Text style={[styles.headerStatus, { color: theme.accentText }]}>
                {group.members.length} members
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="videocam" size={24} color={theme.accentText} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="call" size={24} color={theme.accentText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowGroupInfo(true)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={theme.accentText}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={group.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[
            styles.inputContainer,
            {
              borderTopColor: theme.primaryBorder,
              backgroundColor: theme.primaryBackground,
            },
          ]}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.primaryBackground },
            ]}
          >
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => setShowMediaOptions(true)}
            >
              <Ionicons name="add" size={24} color={theme.accentText} />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.secondaryBackground,
                  color: theme.primaryText,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={theme.secondaryText}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.accentText,
                  opacity: input.trim() ? 1 : 0.5,
                },
              ]}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {/* Media Options Modal */}
        <Modal
          visible={showMediaOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMediaOptions(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMediaOptions(false)}
          >
            <View
              style={[
                styles.mediaOptionsContainer,
                { backgroundColor: theme.modalBackground },
              ]}
            >
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={handlePickImage}
              >
                <View
                  style={[styles.mediaIcon, { backgroundColor: "#4ade80" }]}
                >
                  <Ionicons name="image" size={24} color="#fff" />
                </View>
                <Text
                  style={[styles.mediaOptionText, { color: theme.primaryText }]}
                >
                  Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={handlePickVideo}
              >
                <View
                  style={[styles.mediaIcon, { backgroundColor: "#f87171" }]}
                >
                  <Ionicons name="videocam" size={24} color="#fff" />
                </View>
                <Text
                  style={[styles.mediaOptionText, { color: theme.primaryText }]}
                >
                  Video
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Group Info Modal */}
        <Modal
          visible={showGroupInfo}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGroupInfo(false)}
        >
          <View
            style={[
              styles.groupInfoModal,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <View
              style={[
                styles.groupInfoHeader,
                { borderBottomColor: theme.primaryBorder },
              ]}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowGroupInfo(false)}
              >
                <Ionicons name="close" size={24} color={theme.secondaryIcon} />
              </TouchableOpacity>
              <Text
                style={[styles.groupInfoTitle, { color: theme.primaryText }]}
              >
                Group Info
              </Text>
              <View style={styles.placeholderButton} />
            </View>
            <ScrollView style={styles.groupInfoContent}>
              <View
                style={[
                  styles.groupProfile,
                  { borderBottomColor: theme.primaryBorder },
                ]}
              >
                <Image
                  source={{ uri: groupAvatar }}
                  style={styles.headerAvatar}
                />
                {editingName ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextInput
                      style={{
                        borderBottomWidth: 1,
                        borderColor: theme.accentText,
                        color: theme.primaryText,
                        fontSize: 20,
                        minWidth: 120,
                        marginRight: 8,
                      }}
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                      placeholder="New group name"
                      placeholderTextColor={theme.secondaryText}
                    />
                    <TouchableOpacity onPress={handleChangeGroupName}>
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={theme.accentText}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.groupProfileName,
                      { color: theme.primaryText },
                    ]}
                  >
                    {group.name}
                  </Text>
                )}
                {isAdmin && !editingName && (
                  <TouchableOpacity
                    onPress={() => setEditingName(true)}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ color: theme.accentText, fontSize: 14 }}>
                      Edit Name
                    </Text>
                  </TouchableOpacity>
                )}
                <Text
                  style={[
                    styles.groupProfileStatus,
                    { color: theme.accentText },
                  ]}
                >
                  {group.members.length} members
                </Text>
              </View>
              <View
                style={[
                  styles.groupMembers,
                  { borderBottomColor: theme.primaryBorder },
                ]}
              >
                <Text
                  style={[styles.membersTitle, { color: theme.primaryText }]}
                >
                  Members
                </Text>
                {groupMembers.map((member) => (
                  <View
                    key={member.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Image
                      source={{ uri: member.avatar }}
                      style={styles.avatarSmall}
                    />
                    <Text
                      style={{
                        color: theme.primaryText,
                        flex: 1,
                        marginLeft: 8,
                      }}
                    >
                      {member.name}
                    </Text>
                    {isAdmin && member.name !== "You" && (
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member.name)}
                      >
                        <Ionicons
                          name="remove-circle"
                          size={22}
                          color="#d32f2f"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginRight: 8 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: "600" },
  headerStatus: { fontSize: 14, marginTop: 2 },
  headerActions: { flexDirection: "row" },
  headerButton: { padding: 8, marginLeft: 8 },
  messagesList: { flex: 1 },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: { marginVertical: 4 },
  myMessageContainer: { alignItems: "flex-end" },
  otherMessageContainer: { alignItems: "flex-start" },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: { borderBottomRightRadius: 4 },
  otherMessageBubble: { borderBottomLeftRadius: 4 },
  sender: { fontWeight: "600", fontSize: 13 },
  messageText: { fontSize: 16, lineHeight: 20 },
  messageImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 8 },
  messageVideo: { position: "relative" },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  audioMessage: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
  },
  audioWaveform: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    gap: 2,
  },
  audioBar: { width: 3, height: 20, borderRadius: 2 },
  audioDuration: { fontSize: 12 },
  messageTime: { fontSize: 12, marginTop: 4 },
  inputContainer: { borderTopWidth: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  attachButton: { padding: 8, marginRight: 8 },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  groupInfoModal: { flex: 1 },
  groupInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: { padding: 8 },
  groupInfoTitle: { fontSize: 18, fontWeight: "bold" },
  placeholderButton: { width: 40 },
  groupInfoContent: { flex: 1 },
  groupProfile: { alignItems: "center", padding: 30, borderBottomWidth: 1 },
  groupProfileName: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  groupProfileStatus: { fontSize: 16 },
  groupMembers: { padding: 20, borderBottomWidth: 1 },
  membersTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
});

export default GroupChatScreen;
