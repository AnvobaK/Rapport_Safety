import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Share,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";

const ReportHomeScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // States
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [currentReport, setCurrentReport] = useState({
    id: null,
    title: "",
    content: "",
  });
  const [savedReports, setSavedReports] = useState([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    try {
      const reports = await AsyncStorage.getItem("savedReports");
      if (reports) {
        setSavedReports(JSON.parse(reports));
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const saveReport = async () => {
    if (!currentReport.title.trim() || !currentReport.content.trim()) {
      Alert.alert(
        "Error",
        "Please provide both title and content for your report."
      );
      return;
    }

    try {
      const reportToSave = {
        id: currentReport.id || Date.now().toString(),
        title: currentReport.title.trim(),
        content: currentReport.content.trim(),
        createdAt: currentReport.id
          ? currentReport.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedReports;
      if (currentReport.id) {
        // Update existing report
        updatedReports = savedReports.map((report) =>
          report.id === currentReport.id ? reportToSave : report
        );
      } else {
        // Add new report
        updatedReports = [...savedReports, reportToSave];
      }

      await AsyncStorage.setItem(
        "savedReports",
        JSON.stringify(updatedReports)
      );
      setSavedReports(updatedReports);

      Alert.alert(
        "Success",
        isEditing
          ? "Report updated successfully!"
          : "Report saved successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              setShowEditor(false);
              setCurrentReport({ id: null, title: "", content: "" });
              setIsEditing(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save report. Please try again.");
    }
  };

  const shareReport = async () => {
    if (!currentReport.title.trim() || !currentReport.content.trim()) {
      Alert.alert("Error", "Please write something before sharing.");
      return;
    }

    try {
      const shareContent = `${currentReport.title}\n\n${currentReport.content}`;
      await Share.share({
        message: shareContent,
        title: currentReport.title,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share report.");
    }
  };

  const handleStartReport = () => {
    setCurrentReport({ id: null, title: "", content: "" });
    setIsEditing(false);
    setShowEditor(true);
  };

  const handleEditReport = (report) => {
    setCurrentReport(report);
    setIsEditing(true);
    setShowEditor(true);
    setShowReportsList(false);
  };

  const handleDeleteReport = async (reportId) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedReports = savedReports.filter(
                (report) => report.id !== reportId
              );
              await AsyncStorage.setItem(
                "savedReports",
                JSON.stringify(updatedReports)
              );
              setSavedReports(updatedReports);
            } catch (error) {
              Alert.alert("Error", "Failed to delete report.");
            }
          },
        },
      ]
    );
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery("");
    }
  };

  const cancelEditor = () => {
    if (currentReport.title.trim() || currentReport.content.trim()) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Writing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setShowEditor(false);
              setCurrentReport({ id: null, title: "", content: "" });
              setIsEditing(false);
            },
          },
        ]
      );
    } else {
      setShowEditor(false);
      setCurrentReport({ id: null, title: "", content: "" });
      setIsEditing(false);
    }
  };

  const filteredReports = savedReports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderReportItem = ({ item }) => (
    <View
      style={[styles.reportItem, { backgroundColor: theme.cardBackground }]}
    >
      <TouchableOpacity
        style={styles.reportContent}
        onPress={() => handleEditReport(item)}
      >
        <Text style={[styles.reportTitle, { color: theme.primaryText }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.reportPreview, { color: theme.secondaryText }]}
          numberOfLines={2}
        >
          {item.content}
        </Text>
        <Text style={[styles.reportDate, { color: theme.secondaryText }]}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.deleteButton,
          { backgroundColor: `rgba(239, 68, 68, 0.1)` },
        ]}
        onPress={() => handleDeleteReport(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  if (showEditor) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.primaryBackground }]}
      >
        {/* Editor Header */}
        <View
          style={[
            styles.editorHeader,
            { borderBottomColor: theme.primaryBorder },
          ]}
        >
          <TouchableOpacity onPress={cancelEditor} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.accentIcon} />
          </TouchableOpacity>
          <Text
            style={[styles.editorHeaderTitle, { color: theme.primaryText }]}
          >
            {isEditing ? "Edit Report" : "New Report"}
          </Text>
          <TouchableOpacity onPress={shareReport} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={theme.accentIcon} />
          </TouchableOpacity>
        </View>

        {/* Editor Content */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={styles.editorContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    backgroundColor: theme.secondaryBackground,
                    color: theme.primaryText,
                  },
                ]}
                placeholder="Report Title..."
                placeholderTextColor={theme.secondaryText}
                value={currentReport.title}
                onChangeText={(text) =>
                  setCurrentReport({ ...currentReport, title: text })
                }
                multiline={false}
                returnKeyType="done"
              />

              <TextInput
                style={[
                  styles.contentInput,
                  {
                    backgroundColor: theme.secondaryBackground,
                    color: theme.primaryText,
                  },
                ]}
                placeholder="Write your report here... Describe what happened in your own words."
                placeholderTextColor={theme.secondaryText}
                value={currentReport.content}
                onChangeText={(text) =>
                  setCurrentReport({ ...currentReport, content: text })
                }
                multiline={true}
                textAlignVertical="top"
                returnKeyType="default"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

        {/* Save Button */}
        <View style={styles.editorActions}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.accentText }]}
            onPress={saveReport}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: theme.primaryBackground },
              ]}
            >
              {isEditing ? "Update Report" : "Save Report"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          Write Report
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
            <Ionicons name="search" size={24} color={theme.accentIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listButton}
            onPress={() => setShowReportsList(true)}
          >
            <Ionicons name="list-outline" size={24} color={theme.accentIcon} />
          </TouchableOpacity>
        </View>
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
            placeholder="Search reports..."
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

      {/* Main Content */}
      <View style={styles.content}>
        {/* Show search results if searching */}
        {searchVisible && searchQuery.length > 0 ? (
          <View style={styles.searchResults}>
            <Text
              style={[styles.searchResultsTitle, { color: theme.accentText }]}
            >
              Search Results ({filteredReports.length})
            </Text>
            <FlatList
              data={filteredReports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <>
            {/* Show reports if they exist, otherwise show book image and welcome content */}
            {savedReports.length > 0 ? (
              <>
                {/* Reports Section Header */}
                <View style={styles.reportsHeader}>
                  <Text
                    style={[
                      styles.reportsHeaderTitle,
                      { color: theme.accentText },
                    ]}
                  >
                    Your Reports
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.newReportButton,
                      { backgroundColor: theme.accentText },
                    ]}
                    onPress={handleStartReport}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={theme.primaryBackground}
                    />
                    <Text
                      style={[
                        styles.newReportButtonText,
                        { color: theme.primaryBackground },
                      ]}
                    >
                      New Report
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Reports List */}
                <FlatList
                  data={savedReports}
                  renderItem={renderReportItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={styles.mainReportsList}
                  contentContainerStyle={styles.mainReportsListContent}
                />
              </>
            ) : (
              <>
                {/* Book Image - Only show when no reports */}
                <View style={styles.imageContainer}>
                  <Image
                    source={require("../images/Group 39429.png")}
                    style={styles.bookImage}
                  />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                  <Text style={[styles.title, { color: theme.accentText }]}>
                    Write your Report!
                  </Text>
                  <Text
                    style={[styles.subtitle, { color: theme.secondaryText }]}
                  >
                    Write down what happened in your own words—quick and simple.
                  </Text>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: theme.accentText },
                  ]}
                  onPress={handleStartReport}
                >
                  <Text
                    style={[
                      styles.startButtonText,
                      { color: theme.primaryBackground },
                    ]}
                  >
                    Start Report
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>

      {/* Saved Reports Modal */}
      <Modal
        visible={showReportsList}
        animationType="slide"
        onRequestClose={() => setShowReportsList(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.primaryBackground },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.primaryBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
              Saved Reports
            </Text>
            <TouchableOpacity onPress={() => setShowReportsList(false)}>
              <Ionicons name="close" size={24} color={theme.accentIcon} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={savedReports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reportsList}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                No saved reports yet.
              </Text>
            }
          />
        </SafeAreaView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
  },
  searchButton: {
    marginRight: 15,
  },
  listButton: {
    marginLeft: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Original content styles (for when no reports exist)
  imageContainer: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  bookImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: -30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  startButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: "center",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Reports display styles
  reportsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  reportsHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  newReportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  newReportButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  mainReportsList: {
    flex: 1,
  },
  mainReportsListContent: {
    paddingBottom: 20,
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
  // Editor Styles
  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  editorHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButton: {
    padding: 5,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 400,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    textAlignVertical: "top",
  },
  editorActions: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    bottom: 20,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // Search Results
  searchResults: {
    flex: 1,
    width: "100%",
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  // Report Item Styles
  reportItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  reportContent: {
    flex: 1,
    padding: 15,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reportPreview: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  reportsList: {
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default ReportHomeScreen;
