import React, { useState, useRef, useEffect } from "react";
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
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Audio } from "expo-av";
import { getTheme } from "../context/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useChats } from "../context/ChatsContext";
import { useUserContext } from "../context/userContext";
import { useUserPreferences } from "../context/UserPreferencesContext";

const { width, height } = Dimensions.get("window");

const ChatScreen = ({ navigation, route }) => {
  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const { contact } = route.params; // Get the selected contact from navigation params
  const { chats, addChat, addMessage } = useChats();
  const { profileImage, profileData } = useUserContext();
  const [message, setMessage] = useState("");
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [roomId, setRoomId] = useState("");
  const { userId } = useUserContext();

  const flatListRef = useRef(null);

  // Find the chat for this contact
  const chat = chats.find((c) => c.contact.id === contact.id);
  const messages = chat?.messages || [];

  useEffect(() => {
    if (!userId) return;

    const createOrGetChatRoom = async () => {
      try {
        const reqOptions = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            user1: userId,
            user2: contact.id
          })
        };
        
        const response = await fetch(
          'https://rapport-backend.onrender.com/chat/single/create',
          reqOptions
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setRoomId(data.id);
      } catch (error) {
        console.error('Error creating/retrieving chat room:', error);
        // Fallback to a local-only room so users can continue the conversation without backend
        setRoomId(`local-${contact.id}`);
      }
    };

    createOrGetChatRoom();
  }, []);

  useEffect(() => {
    if (!chat) {
      addChat(contact);
    }
  }, [contact, chat, addChat]);

  useEffect(() => {
    // Scroll to bottom when component mounts or messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "me",
      senderId: userId,
      senderName: profileData?.firstName && profileData?.lastName
        ? `${profileData.firstName} ${profileData.lastName}`
        : "You",
      senderAvatar: profileImage || "https://i.pravatar.cc/100?img=11",
      timestamp: new Date().toISOString(),
      type: "text"
    };

    // If we have a real backend room, send to backend; otherwise store locally
    if (roomId && !String(roomId).startsWith('local-')) {
      try {
        const response = await fetch('https://rapport-backend.onrender.com/chat/message/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId,
            senderId: userId,
            senderName: newMessage.senderName,
            content: message,
            messageType: 'text'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Message sent successfully:', responseData);
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert("Error", "Failed to send message to server. Stored locally.");
      }
    }

    // Add the message to local state in both cases
    addMessage(contact.id, newMessage);
    setMessage("");
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const newMessage = {
          id: Date.now().toString(),
          media: result.assets[0].uri,
          sender: "me",
          senderAvatar: profileImage || "https://i.pravatar.cc/100?img=11",
          senderName:
            profileData?.firstName && profileData?.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : "You",
          timestamp: new Date().toISOString(),
          type: "image",
        };
        addMessage(contact.id, newMessage);
        setShowMediaOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleVideoPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const newMessage = {
          id: Date.now().toString(),
          media: result.assets[0].uri,
          sender: "me",
          senderAvatar: profileImage || "https://i.pravatar.cc/100?img=11",
          senderName:
            profileData?.firstName && profileData?.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : "You",
          timestamp: new Date().toISOString(),
          type: "video",
        };
        addMessage(contact.id, newMessage);
        setShowMediaOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick video");
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Audio recording permission is required"
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setShowMediaOptions(false);
    } catch (error) {
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        const newMessage = {
          id: Date.now().toString(),
          media: uri,
          sender: "me",
          senderAvatar: profileImage || "https://i.pravatar.cc/100?img=11",
          senderName:
            profileData?.firstName && profileData?.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : "You",
          timestamp: new Date().toISOString(),
          type: "audio",
        };
        addMessage(contact.id, newMessage);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const playAudio = async (audioUri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: audioUri,
      });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      Alert.alert("Error", "Failed to play audio");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === "me";

    const renderMessageContent = () => {
      switch (item.type) {
        case "image":
          return (
            <Image source={{ uri: item.media }} style={styles.messageImage} />
          );
        case "video":
          return (
            <View style={styles.messageVideo}>
              <Image source={{ uri: item.media }} style={styles.messageImage} />
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="#fff" />
              </View>
            </View>
          );
        case "audio":
          return (
            <TouchableOpacity
              style={[
                styles.audioMessage,
                { backgroundColor: theme.secondaryBackground },
              ]}
              onPress={() => playAudio(item.media)}
            >
              <Ionicons name="play" size={20} color={theme.accentText} />
              <View style={styles.audioWaveform}>
                <View
                  style={[
                    styles.audioBar,
                    { backgroundColor: theme.accentText },
                  ]}
                />
                <View
                  style={[
                    styles.audioBar,
                    { backgroundColor: theme.accentText },
                  ]}
                />
                <View
                  style={[
                    styles.audioBar,
                    { backgroundColor: theme.accentText },
                  ]}
                />
                <View
                  style={[
                    styles.audioBar,
                    { backgroundColor: theme.accentText },
                  ]}
                />
              </View>
              <Text
                style={[styles.audioDuration, { color: theme.primaryText }]}
              >
                0:30
              </Text>
            </TouchableOpacity>
          );
        default:
          return (
            <Text style={[styles.messageText, { color: theme.primaryText }]}>
              {item.text}
            </Text>
          );
      }
    };

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
          {renderMessageContent()}
          <Text style={[styles.messageTime, { color: theme.secondaryText }]}>
            {formatTime(item.timestamp)}
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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.accentText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCenter}
            onPress={() => setShowContactDetails(true)}
          >
            <Image
              source={
                typeof contact?.avatar === 'string'
                  ? { uri: contact.avatar || "https://i.pravatar.cc/100?img=1" }
                  : contact?.avatar || { uri: "https://i.pravatar.cc/100?img=1" }
              }
              style={styles.headerAvatar}
            />
            <View style={styles.headerInfo}>
              <Text style={[styles.headerName, { color: theme.primaryText }]}>
                {contact?.name || "Unknown Contact"}
              </Text>
              <Text style={[styles.headerStatus, { color: theme.accentText }]}>
                Online
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
            <TouchableOpacity style={styles.headerButton}>
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
          data={messages}
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
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />

            {isRecording ? (
              <TouchableOpacity
                style={styles.recordingButton}
                onPress={stopRecording}
              >
                <Ionicons name="stop" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: theme.accentText },
                  { opacity: message.trim() ? 1 : 0.5 },
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            )}
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
                onPress={handleImagePicker}
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
                onPress={handleVideoPicker}
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

              <TouchableOpacity
                style={styles.mediaOption}
                onPress={startRecording}
              >
                <View
                  style={[styles.mediaIcon, { backgroundColor: "#fbbf24" }]}
                >
                  <Ionicons name="mic" size={24} color="#fff" />
                </View>
                <Text
                  style={[styles.mediaOptionText, { color: theme.primaryText }]}
                >
                  Audio
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Contact Details Modal */}
        <Modal
          visible={showContactDetails}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowContactDetails(false)}
        >
          <View
            style={[
              styles.contactDetailsModal,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <View
              style={[
                styles.contactDetailsHeader,
                { borderBottomColor: theme.primaryBorder },
              ]}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowContactDetails(false)}
              >
                <Ionicons name="close" size={24} color={theme.secondaryIcon} />
              </TouchableOpacity>
              <Text
                style={[
                  styles.contactDetailsTitle,
                  { color: theme.primaryText },
                ]}
              >
                Contact Info
              </Text>
              <View style={styles.placeholderButton} />
            </View>

            <ScrollView style={styles.contactDetailsContent}>
              <View
                style={[
                  styles.contactProfile,
                  { borderBottomColor: theme.primaryBorder },
                ]}
              >
                <Image
                  source={{
                    uri: contact?.avatar || "https://i.pravatar.cc/100?img=1",
                  }}
                  style={styles.contactProfileImage}
                />
                <Text
                  style={[
                    styles.contactProfileName,
                    { color: theme.primaryText },
                  ]}
                >
                  {contact?.name || "Unknown Contact"}
                </Text>
                <Text
                  style={[
                    styles.contactProfileStatus,
                    { color: theme.accentText },
                  ]}
                >
                  Online
                </Text>
              </View>

              <View
                style={[
                  styles.contactActions,
                  { borderBottomColor: theme.primaryBorder },
                ]}
              >
                <TouchableOpacity style={styles.contactAction}>
                  <Ionicons name="call" size={24} color={theme.accentText} />
                  <Text
                    style={[
                      styles.contactActionText,
                      { color: theme.primaryText },
                    ]}
                  >
                    Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactAction}>
                  <Ionicons
                    name="videocam"
                    size={24}
                    color={theme.accentText}
                  />
                  <Text
                    style={[
                      styles.contactActionText,
                      { color: theme.primaryText },
                    ]}
                  >
                    Video Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactAction}>
                  <Ionicons name="search" size={24} color={theme.accentText} />
                  <Text
                    style={[
                      styles.contactActionText,
                      { color: theme.primaryText },
                    ]}
                  >
                    Search
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactInfo}>
                <View
                  style={[
                    styles.infoItem,
                    { borderBottomColor: theme.primaryBorder },
                  ]}
                >
                  <Ionicons name="mail" size={20} color={theme.secondaryIcon} />
                  <Text style={[styles.infoText, { color: theme.primaryText }]}>
                    {contact?.name?.toLowerCase().replace(" ", ".")}@email.com
                  </Text>
                </View>
                <View
                  style={[
                    styles.infoItem,
                    { borderBottomColor: theme.primaryBorder },
                  ]}
                >
                  <Ionicons
                    name="phone"
                    size={20}
                    color={theme.secondaryIcon}
                  />
                  <Text style={[styles.infoText, { color: theme.primaryText }]}>
                    +1 234 567 8900
                  </Text>
                </View>
                <View
                  style={[
                    styles.infoItem,
                    { borderBottomColor: theme.primaryBorder },
                  ]}
                >
                  <Ionicons
                    name="location"
                    size={20}
                    color={theme.secondaryIcon}
                  />
                  <Text style={[styles.infoText, { color: theme.primaryText }]}>
                    New York, USA
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageVideo: {
    position: "relative",
  },
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
  audioBar: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  audioDuration: {
    fontSize: 12,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
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
  recordingButton: {
    backgroundColor: "#ef4444",
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Media Options Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  mediaOptionsContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mediaOption: {
    alignItems: "center",
    padding: 16,
  },
  mediaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mediaOptionText: {
    fontSize: 14,
  },
  // Contact Details Modal
  contactDetailsModal: {
    flex: 1,
  },
  contactDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  contactDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholderButton: {
    width: 40,
  },
  contactDetailsContent: {
    flex: 1,
  },
  contactProfile: {
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
  },
  contactProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  contactProfileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contactProfileStatus: {
    fontSize: 16,
  },
  contactActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderBottomWidth: 1,
  },
  contactAction: {
    alignItems: "center",
    padding: 16,
  },
  contactActionText: {
    fontSize: 14,
    marginTop: 8,
  },
  contactInfo: {
    padding: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ChatScreen;
