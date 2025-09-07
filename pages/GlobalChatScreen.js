import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio, Video } from "expo-av";
import {
  useGlobalChat,
  SYSTEM_USER_ID,
  SYSTEM_AVATAR,
} from "../context/GlobalChatContext";
import { useUserContext } from "../context/userContext";

const GlobalChatScreen = ({ navigation }) => {
  const { messages, addMessage } = useGlobalChat();
  const userContext = useUserContext();
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [videoModal, setVideoModal] = useState({ visible: false, uri: null });
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Use email as userId (unique per user)
  const getMyUserId = () => userContext.profileData.email;

  const getMyName = () => {
    const { profileData } = userContext;
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return "You";
  };

  const getMyAvatar = () => {
    const { profileImage } = userContext;
    if (profileImage) return profileImage;
    return "https://i.pravatar.cc/100?img=11";
  };

  const handleSend = () => {
    if (input.trim()) {
      addMessage(input.trim(), getMyUserId(), true, "text");
      setInput("");
    }
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
        addMessage("", getMyUserId(), true, "image", result.assets[0].uri);
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
        addMessage("", getMyUserId(), true, "video", result.assets[0].uri);
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
        addMessage("", getMyUserId(), true, "audio", uri);
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

  const handleUserPress = (userId, userName, userAvatar) => {
    if (userId === getMyUserId() || userId === SYSTEM_USER_ID) return;
    
    // Extract URI from avatar object if it's an object, otherwise use as string
    const avatarUri = typeof userAvatar === 'object' && userAvatar.uri ? userAvatar.uri : userAvatar;
    
    // Create contact object for private chat
    const contact = {
      id: userId,
      name: userName,
      avatar: avatarUri
    };
    
    // Navigate to Chat tab and then to private chat
    navigation.navigate("Chat", { 
      screen: "ChatScreen", 
      params: { contact } 
    });
  };

  const renderItem = ({ item }) => {
    let name, avatar, userId;
    if (item.userId === getMyUserId()) {
      // Current user: always use latest from context
      name = `${userContext.profileData.firstName} ${userContext.profileData.lastName}`;
      avatar = userContext.profileImage
        ? { uri: userContext.profileImage }
        : require("../images/Group 39429.png");
      userId = item.userId;
    } else if (item.userId === SYSTEM_USER_ID) {
      name = "System";
      avatar = { uri: SYSTEM_AVATAR };
      userId = item.userId;
    } else {
      // Map sample users to names and avatars
      const userMap = {
        "user1@example.com": { name: "Alex Thompson", avatar: "https://i.pravatar.cc/100?img=1" },
        "user2@example.com": { name: "Maria Garcia", avatar: "https://i.pravatar.cc/100?img=2" },
        "user3@example.com": { name: "James Wilson", avatar: "https://i.pravatar.cc/100?img=4" },
      };
      
      const userInfo = userMap[item.userId] || { name: "Unknown User", avatar: "https://i.pravatar.cc/100?img=6" };
      name = userInfo.name;
      avatar = { uri: userInfo.avatar };
      userId = item.userId;
    }
    const isMe = item.userId === getMyUserId();
    const isSystem = item.userId === SYSTEM_USER_ID;
    
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]}>
        {!isMe && (
          <TouchableOpacity 
            onPress={() => handleUserPress(userId, name, avatar)}
            disabled={isSystem}
            activeOpacity={isSystem ? 1 : 0.7}
          >
            <Image source={avatar} style={styles.avatar} />
          </TouchableOpacity>
        )}
        <View
          style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
        >
          <TouchableOpacity
            onPress={() => handleUserPress(userId, name, avatar)}
            disabled={isMe || isSystem}
            activeOpacity={isMe || isSystem ? 1 : 0.7}
          >
            <View style={styles.senderContainer}>
              <Text
                style={[
                  styles.sender, 
                  isMe ? styles.mySender : styles.otherSender,
                  !isMe && !isSystem && styles.clickableSender
                ]}
              >
                {name}
              </Text>
              {!isMe && !isSystem && (
                <Ionicons 
                  name="chatbubble-outline" 
                  size={12} 
                  color="#00C6FF" 
                  style={styles.messageIcon}
                />
              )}
            </View>
          </TouchableOpacity>
          {item.type === "text" && (
            <Text style={styles.message}>{item.text}</Text>
          )}
          {item.type === "image" && (
            <Image source={{ uri: item.media }} style={styles.messageImage} />
          )}
          {item.type === "video" && (
            <TouchableOpacity
              onPress={() => setVideoModal({ visible: true, uri: item.media })}
            >
              <View style={styles.messageVideo}>
                <Image
                  source={{ uri: item.media }}
                  style={styles.messageImage}
                />
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          {item.type === "audio" && (
            <TouchableOpacity
              style={styles.audioMessage}
              onPress={() => playAudio(item.media)}
            >
              <Ionicons name="play" size={20} color="#00C6FF" />
              <View style={styles.audioWaveform}>
                <View style={styles.audioBar} />
                <View style={styles.audioBar} />
                <View style={styles.audioBar} />
                <View style={styles.audioBar} />
              </View>
              <Text style={styles.audioDuration}>Audio</Text>
            </TouchableOpacity>
          )}
          <Text style={isMe ? styles.myTimestamp : styles.otherTimestamp}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {isMe && <Image source={avatar} style={styles.avatar} />}
      </View>
    );
  };

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#00C6FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Global Chat</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowMediaOptions(true)}
          >
            <Ionicons name="add" size={28} color="#00C6FF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#8fa8b8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: input.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={22} color="#fff" />
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
          <View style={styles.mediaOptionsContainer}>
            <TouchableOpacity
              style={styles.mediaOption}
              onPress={handleImagePicker}
            >
              <View style={[styles.mediaIcon, { backgroundColor: "#4ade80" }]}>
                <Ionicons name="image" size={24} color="#fff" />
              </View>
              <Text style={styles.mediaOptionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaOption}
              onPress={handleVideoPicker}
            >
              <View style={[styles.mediaIcon, { backgroundColor: "#f87171" }]}>
                <Ionicons name="videocam" size={24} color="#fff" />
              </View>
              <Text style={styles.mediaOptionText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaOption}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.mediaIcon, { backgroundColor: "#fbbf24" }]}>
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.mediaOptionText}>
                {isRecording ? "Stop" : "Audio"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Video Modal */}
      <Modal
        visible={videoModal.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVideoModal({ visible: false, uri: null })}
      >
        <View style={styles.videoModalContainer}>
          <TouchableOpacity
            style={styles.closeVideoButton}
            onPress={() => setVideoModal({ visible: false, uri: null })}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {videoModal.uri && (
            <Video
              source={{ uri: videoModal.uri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay
              useNativeControls
              style={styles.videoPlayer}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010F25",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
    backgroundColor: "#222",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 2,
  },
  myBubble: {
    backgroundColor: "#00C6FF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  sender: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  mySender: {
    color: "#fff",
  },
  otherSender: {
    color: "#00C6FF",
  },
  clickableSender: {
    textDecorationLine: "underline",
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageIcon: {
    marginLeft: 4,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    color: "#000",
    fontSize: 12,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#010F25",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#00C6FF",
    borderRadius: 20,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "#00C6FF",
    borderRadius: 2,
  },
  audioDuration: {
    color: "#fff",
    fontSize: 12,
  },
  recordingButton: {
    backgroundColor: "#ef4444",
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  mediaOptionsContainer: {
    backgroundColor: "#0F1B2F",
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
    color: "#fff",
    fontSize: 14,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeVideoButton: {
    position: "absolute",
    top: 40,
    right: 30,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  videoPlayer: {
    width: 320,
    height: 220,
    backgroundColor: "#000",
    borderRadius: 12,
  },
  myTimestamp: {
    color: "#000",
    fontSize: 12,
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#fff",
    fontSize: 12,
    textAlign: "right",
  },
});

export default GlobalChatScreen;
