import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Pressable,
  Modal,
  ActivityIndicator,
  TextInput,
  Share,
  Image,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const VoiceRecorderScreen = () => {
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Modal states
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [newRecordingName, setNewRecordingName] = useState("");

  // Search states
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Directory for storing recordings
  const recordingsDirectory = `${FileSystem.documentDirectory}recordings/`;

  useEffect(() => {
    // Set up audio mode
    setupAudio();
    // Create recordings directory if it doesn't exist
    ensureDirectoryExists();
    // Load saved recordings
    loadRecordings();

    return () => {
      // Clean up resources
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  // Filter recordings based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecordings(recordings);
    } else {
      const filtered = recordings.filter((recording) =>
        recording.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecordings(filtered);
    }
  }, [recordings, searchQuery]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Failed to set audio mode", error);
    }
  };

  const ensureDirectoryExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(recordingsDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(recordingsDirectory, {
        intermediates: true,
      });
    }
  };

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const dirInfo = await FileSystem.getInfoAsync(recordingsDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(recordingsDirectory, {
          intermediates: true,
        });
        setIsLoading(false);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(recordingsDirectory);
      const recordingsList = await Promise.all(
        files.map(async (fileName) => {
          const fileInfo = await FileSystem.getInfoAsync(
            recordingsDirectory + fileName
          );
          return {
            id: fileName,
            uri: fileInfo.uri,
            name: fileName.replace(".m4a", ""),
            date: new Date(fileInfo.modificationTime * 1000).toLocaleString(),
            duration: 0, // We'll update this when playing
            size: (fileInfo.size / 1024 / 1024).toFixed(2) + " MB",
          };
        })
      );

      setRecordings(
        recordingsList.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        })
      );
    } catch (error) {
      console.error("Failed to load recordings", error);
      Alert.alert("Error", "Failed to load recordings");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!permissionResponse || !permissionResponse.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert(
            "Permission required",
            "You need to grant audio recording permissions to use this feature."
          );
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      // Start timer
      let seconds = 0;
      const newTimer = setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
      }, 1000);

      setTimer(newTimer);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      const fileName = `recording-${Date.now()}.m4a`;
      const newUri = recordingsDirectory + fileName;

      // Move the recording to our app's documents directory
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // Reload recordings
      await loadRecordings();

      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Error", "Failed to save recording");
    }
  };

  const playRecording = async (recordingItem) => {
    try {
      // If we're already playing something, stop it
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingItem.uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setCurrentlyPlayingId(recordingItem.id);

      // Play the sound
      await newSound.playAsync();
    } catch (error) {
      console.error("Failed to play recording", error);
      Alert.alert("Error", "Failed to play recording");
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // The sound just finished playing
      setIsPlaying(false);
      setCurrentlyPlayingId(null);
    }
  };

  const pausePlayback = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumePlayback = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const handleLongPress = (item) => {
    setSelectedRecording(item);
    setActionModalVisible(true);
  };

  const handleRename = () => {
    setActionModalVisible(false);
    setNewRecordingName(selectedRecording.name);
    setRenameModalVisible(true);
  };

  const confirmRename = async () => {
    try {
      if (!newRecordingName.trim()) {
        Alert.alert("Error", "Please enter a valid name");
        return;
      }

      const oldFileName = selectedRecording.id;
      const newFileName = `${newRecordingName.trim()}.m4a`;
      const oldPath = recordingsDirectory + oldFileName;
      const newPath = recordingsDirectory + newFileName;

      // Check if a file with the new name already exists
      const newFileInfo = await FileSystem.getInfoAsync(newPath);
      if (newFileInfo.exists) {
        Alert.alert("Error", "A recording with this name already exists");
        return;
      }

      await FileSystem.moveAsync({
        from: oldPath,
        to: newPath,
      });

      await loadRecordings();
      setRenameModalVisible(false);
      setSelectedRecording(null);
      setNewRecordingName("");
    } catch (error) {
      console.error("Failed to rename recording", error);
      Alert.alert("Error", "Failed to rename recording");
    }
  };

  const handleShare = async () => {
    try {
      setActionModalVisible(false);

      const result = await Share.share({
        url: selectedRecording.uri,
        title: selectedRecording.name,
        message: `Check out this voice recording: ${selectedRecording.name}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.error("Failed to share recording", error);
      Alert.alert("Error", "Failed to share recording");
    }
  };

  const handleDelete = () => {
    setActionModalVisible(false);
    Alert.alert(
      "Delete Recording",
      `Are you sure you want to delete "${selectedRecording.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      // If we're trying to delete the currently playing recording, stop it first
      if (currentlyPlayingId === selectedRecording.id && sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
      }

      await FileSystem.deleteAsync(recordingsDirectory + selectedRecording.id);
      await loadRecordings();
      setSelectedRecording(null);
    } catch (error) {
      console.error("Failed to delete recording", error);
      Alert.alert("Error", "Failed to delete recording");
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery("");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderRecordingItem = ({ item }) => {
    const isCurrentlyPlaying = currentlyPlayingId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.recordingItem,
          { backgroundColor: theme.cardBackground },
        ]}
        onPress={() => playRecording(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.recordingInfo}>
          <Text style={[styles.recordingName, { color: theme.primaryText }]}>
            {item.name}
          </Text>
          <Text style={[styles.recordingDate, { color: theme.secondaryText }]}>
            {item.date}
          </Text>
          <Text style={[styles.recordingSize, { color: theme.secondaryText }]}>
            {item.size}
          </Text>
        </View>

        <View style={styles.recordingControls}>
          {isCurrentlyPlaying ? (
            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: theme.secondaryBackground },
              ]}
              onPress={isPlaying ? pausePlayback : resumePlayback}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color={theme.accentIcon}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: theme.secondaryBackground },
              ]}
              onPress={() => playRecording(item)}
            >
              <Ionicons name="play" size={24} color={theme.accentIcon} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.accentIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          Voice Recorder
        </Text>
        <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
          <Ionicons name="search" size={24} color={theme.accentIcon} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.secondaryBackground },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: theme.primaryText }]}
            placeholder="Search recordings..."
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <TouchableOpacity
            onPress={toggleSearch}
            style={styles.closeSearchButton}
          >
            <Ionicons name="close" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        </View>
      )}

      {/* Recordings List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentText} />
        </View>
      ) : filteredRecordings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.accentText }]}>
            {searchQuery ? "No recordings found" : "No Recordings yet"}
          </Text>
          {/* Image inserted here */}
          <Image
            source={require("../images/bg-remove.png")} // or use a remote URI
            style={styles.emptyImage}
          />
          <Text
            style={[styles.instructionText, { color: theme.secondaryText }]}
          >
            {searchQuery
              ? "Try a different search term"
              : "Long press to record"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecordings}
          renderItem={renderRecordingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recordingsList}
        />
      )}

      {/* Recording UI */}
      <View style={styles.recordingUI}>
        {isRecording && (
          <Text style={[styles.recordingTime, { color: theme.error }]}>
            {formatTime(recordingDuration)}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.recordButton,
            { backgroundColor: theme.accentText },
            isRecording && { backgroundColor: theme.error },
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Ionicons name="mic" size={32} color={theme.primaryBackground} />
        </TouchableOpacity>

        {/* <Text style={styles.recordingHint}>
          {isRecording ? "Release to stop" : "Long press to record"}
        </Text> */}
      </View>

      {/* Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.overlayBackground },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
              Recording Options
            </Text>
            <Text
              style={[styles.modalRecordingName, { color: theme.primaryText }]}
            >
              {selectedRecording?.name}
            </Text>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.secondaryBackground },
              ]}
              onPress={handleRename}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color={theme.accentIcon}
              />
              <Text
                style={[styles.actionButtonText, { color: theme.accentText }]}
              >
                Rename
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.secondaryBackground },
              ]}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={24}
                color={theme.accentIcon}
              />
              <Text
                style={[styles.actionButtonText, { color: theme.accentText }]}
              >
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: `rgba(239, 68, 68, 0.1)` },
              ]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color={theme.error} />
              <Text style={[styles.actionButtonText, { color: theme.error }]}>
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: theme.secondaryBackground },
              ]}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.overlayBackground },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
              Rename Recording
            </Text>

            <TextInput
              style={[
                styles.renameInput,
                {
                  backgroundColor: theme.secondaryBackground,
                  color: theme.primaryText,
                },
              ]}
              value={newRecordingName}
              onChangeText={setNewRecordingName}
              placeholder="Enter new name"
              placeholderTextColor={theme.secondaryText}
              autoFocus={true}
              selectTextOnFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.secondaryBackground },
                ]}
                onPress={() => {
                  setRenameModalVisible(false);
                  setNewRecordingName("");
                }}
              >
                <Text style={[styles.buttonText, { color: theme.primaryText }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.accentText },
                ]}
                onPress={confirmRename}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.primaryBackground },
                  ]}
                >
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  closeSearchButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingsList: {
    padding: 16,
  },
  recordingItem: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  recordingInfo: {
    flex: 1,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  recordingSize: {
    fontSize: 12,
  },
  recordingControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingUI: {
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  recordingActive: {
    shadowColor: "#FF3B30",
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  recordingHint: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalRecordingName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "100%",
  },
  deleteActionButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  deleteActionText: {
    color: "#FF3B30",
  },
  renameInput: {
    width: "100%",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  confirmButton: {
    backgroundColor: "#00B4D8",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VoiceRecorderScreen;
