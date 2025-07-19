import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  RefreshControl,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import HeaderWithBack from "../components/Headerwithbackbutton";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import { db, auth, storage } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, runTransaction, getDocs } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

// Posts data structure
const POSTS_DATA = [
  {
    id: 1,
    user: {
      name: "Team Rapport",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"), // Add rapport logo as profile image
    },
    content:
      "We've received concerns about suspicious activity in the main parking lot last night. Please avoid isolated areas and don't hesitate to use the escort service if you notice anything unusual. 🚨",
    highlight:
      "Remember: If you see something, say something. It's better to be safe than sorry.",
    link: "http://ow.ly/9SlZ",
    image: require("../images/img.png"),
    likes: 230,
    comments: 45,
    shares: 12,
    timestamp: "11:44 AM • 11 mins ago",
    category: "warning",
    priority: "high",
    tags: ["safety", "parking", "alert"],
  },
  {
    id: 2,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "Emergency protocols have been updated. Please review the new procedures directly on the app. Immediate action required for all staff members.",
    likes: 156,
    comments: 23,
    shares: 8,
    timestamp: "10:30 AM • 1 hour ago",
    category: "emergency",
    priority: "critical",
    tags: ["protocols", "emergency", "staff"],
  },
  {
    id: 3,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "🌟 Weekly Safety Tip: Always inform someone of your whereabouts when working late. Use the buddy system whenever possible.",
    highlight:
      "Your safety is our priority. Download the safety app for quick access to emergency contacts.",
    link: "http://safety.rapport.com",
    image: require("../images/img.png"),
    likes: 89,
    comments: 12,
    shares: 25,
    timestamp: "9:15 AM • 2 hours ago",
    category: "updates",
    priority: "normal",
    tags: ["safety", "tips", "wellness"],
  },
  {
    id: 4,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "🚨 ALERT: Fire drill scheduled for tomorrow at 2:00 PM. Please familiarize yourself with evacuation routes and assembly points.",
    likes: 203,
    comments: 34,
    shares: 67,
    timestamp: "Yesterday • 4:22 PM",
    category: "alerts",
    priority: "high",
    tags: ["fire", "drill", "evacuation"],
  },
  {
    id: 5,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "New security cameras have been installed in the parking areas. Enhanced lighting will be added next week to improve visibility during evening hours.",
    highlight:
      "These improvements are part of our ongoing commitment to campus safety.",
    likes: 178,
    comments: 28,
    shares: 15,
    timestamp: "Yesterday • 2:10 PM",
    category: "updates",
    priority: "normal",
    tags: ["security", "cameras", "lighting"],
  },
  {
    id: 6,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "🆘 Weather Alert: Heavy rain expected tonight. Exercise caution when walking on campus. Covered walkways are available between buildings.",
    likes: 92,
    comments: 15,
    shares: 31,
    timestamp: "Yesterday • 11:45 AM",
    category: "warning",
    priority: "medium",
    tags: ["weather", "rain", "walkways"],
  },
  {
    id: 7,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "Mental Health Resources: Remember that counseling services are available 24/7. Your wellbeing matters to us.",
    highlight:
      "Call the helpline: 0800-HELP-NOW or visit the counseling center.",
    link: "http://wellness.rapport.com",
    likes: 245,
    comments: 52,
    shares: 89,
    timestamp: "2 days ago • 3:30 PM",
    category: "updates",
    priority: "normal",
    tags: ["mental-health", "counseling", "wellness"],
  },
  {
    id: 8,
    user: {
      name: "Team Rap",
      handle: "@rapportsa",
      avatar: require("../images/photo1.jpg"),
    },
    content:
      "⚠️ Maintenance Notice: Elevator in Building A will be out of service from 8 AM to 12 PM tomorrow. Please use alternative routes.",
    likes: 67,
    comments: 8,
    shares: 12,
    timestamp: "2 days ago • 1:20 PM",
    category: "alerts",
    priority: "medium",
    tags: ["maintenance", "elevator", "building-a"],
  },
];

const CommunityPage = ({ navigation }) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    all: true,
    warning: false,
    alerts: false,
    updates: false,
    emergency: false,
    bookmarked: false,
  });
  const [selectedPriorities, setSelectedPriorities] = useState({
    all: true,
    critical: false,
    high: false,
    medium: false,
    normal: false,
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const { isAnonymous } = useUserPreferences();
  const [commentText, setCommentText] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [filterAnimation] = useState(new Animated.Value(0));

  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Comment states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState({
    1: [
      {
        id: "1",
        text: "Thanks for the update! I'll make sure to stay alert.",
        user: {
          name: "Alex Chen",
          handle: "@alexchen",
          avatar: require("../images/photo2-removebg-preview.png"),
        },
        timestamp: "10 mins ago",
        likes: 5,
      },
      {
        id: "2",
        text: "I noticed some suspicious activity yesterday too. Good to know we're being watched out for.",
        user: {
          name: "Maria Garcia",
          handle: "@mariag",
          avatar: require("../images/photo3-removebg-preview.png"),
        },
        timestamp: "25 mins ago",
        likes: 12,
      },
      {
        id: "3",
        text: "The escort service is really helpful, especially during late hours.",
        user: {
          name: "David Kim",
          handle: "@davidk",
          avatar: require("../images/photo4-removebg-preview.png"),
        },
        timestamp: "1 hour ago",
        likes: 8,
      },
    ],
    2: [
      {
        id: "4",
        text: "I've already reviewed the new protocols. They're much clearer now.",
        user: {
          name: "Sarah Wilson",
          handle: "@sarahw",
          avatar: require("../images/photo1.jpg"),
        },
        timestamp: "30 mins ago",
        likes: 7,
      },
    ],
  });

  // Fetch posts in real-time
  useEffect(() => {
    try {
      const q = query(collection(db, "posts")); // Temporarily remove orderBy for debugging
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsArr = [];
        querySnapshot.forEach((doc) => {
          postsArr.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched posts:", postsArr);
        setPosts(postsArr);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
      });
      return unsubscribe;
    } catch (err) {
      console.error("Firestore useEffect error:", err);
    }
  }, []);

  useEffect(() => {
    getDocs(collection(db, "posts"))
      .then(snapshot => {
        console.log("Test getDocs:", snapshot.docs.map(doc => doc.data()));
      })
      .catch(err => {
        console.error("Test getDocs error:", err);
      });
  }, []);

  // Create a new post
  const handleCreatePost = async () => {
    let imageUrl = "";
    if (newPostImage) {
      // Upload image to Firebase Storage
      const response = await fetch(newPostImage);
      const blob = await response.blob();
      const imageRef = ref(storage, `posts/${Date.now()}_${auth.currentUser.uid}.jpg`);
      await uploadBytes(imageRef, blob);
      imageUrl = await getDownloadURL(imageRef);
    }
    await addDoc(collection(db, "posts"), {
      authorId: auth.currentUser.uid,
      content: newPostContent,
      imageUrl,
      isAnonymous,
      createdAt: serverTimestamp(),
      likes: 0,
      reactions: {},
    });
    setNewPostContent("");
    setNewPostImage(null);
  };

  // Add a comment to a post
  const handleAddComment = async (postId) => {
    await addDoc(collection(db, "posts", postId, "comments"), {
      authorId: auth.currentUser.uid,
      content: commentText,
      createdAt: serverTimestamp(),
    });
    setCommentText("");
    setSelectedPostId(null);
  };

  // Like a post (transaction)
  const handleLike = async (postId) => {
    const postRef = doc(db, "posts", postId);
    await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) return;
      const newLikes = (postDoc.data().likes || 0) + 1;
      transaction.update(postRef, { likes: newLikes });
    });
  };

  // Pick image for post
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  // Get all unique tags from posts
  const allTags = React.useMemo(() => {
    const tags = new Set();
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [posts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      // You can add logic here to fetch new posts
    }, 2000);
  }, []);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const togglePriority = (priority) => {
    setSelectedPriorities((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSelectedFilters({
      all: true,
      warning: false,
      alerts: false,
      updates: false,
      emergency: false,
      bookmarked: false,
    });
    setSelectedPriorities({
      all: true,
      critical: false,
      high: false,
      medium: false,
      normal: false,
    });
    setSelectedTags([]);
  };

  const handleComment = (postId) => {
    const post = posts.find((p) => p.id === postId);
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPost(null);
    setCommentText("");
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `${post.content}\n\nShared from Rapport Community`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share post");
    }
  };

  const handleSave = (postId) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const filterPosts = () => {
    let filteredPosts = posts;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.tags &&
            post.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    // Apply category filters
    if (!selectedFilters.all) {
      const activeFilters = Object.entries(selectedFilters)
        .filter(
          ([key, value]) => key !== "all" && key !== "bookmarked" && value
        )
        .map(([key]) => key);

      if (activeFilters.length > 0) {
        filteredPosts = filteredPosts.filter((post) =>
          activeFilters.includes(post.category)
        );
      }
    }

    // Apply priority filters
    if (!selectedPriorities.all) {
      const activePriorities = Object.entries(selectedPriorities)
        .filter(([key, value]) => key !== "all" && value)
        .map(([key]) => key);

      if (activePriorities.length > 0) {
        filteredPosts = filteredPosts.filter((post) =>
          activePriorities.includes(post.priority)
        );
      }
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.tags && post.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    // Apply bookmarked filter
    if (selectedFilters.bookmarked) {
      filteredPosts = filteredPosts.filter((post) => savedPosts.has(post.id));
    }

    return filteredPosts;
  };

  const FilterCheckbox = ({ label, checked, onPress, color = "#00C6FF" }) => (
    <TouchableOpacity style={styles.filterItem} onPress={onPress}>
      <Animated.View
        style={[
          styles.checkbox,
          { borderColor: theme.secondaryBorder },
          checked && { backgroundColor: color, borderColor: color },
          { transform: [{ scale: checked ? 1.1 : 1 }] },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </Animated.View>
      <Text style={[styles.filterLabel, { color: theme.primaryText }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TagChip = ({ tag, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tagChip,
        {
          backgroundColor: theme.secondaryBackground,
          borderColor: theme.secondaryBorder,
        },
        selected && {
          backgroundColor: theme.accentText,
          borderColor: theme.accentText,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tagText,
          { color: theme.secondaryText },
          selected && { color: theme.primaryBackground },
        ]}
      >
        #{tag}
      </Text>
    </TouchableOpacity>
  );

  const PriorityBadge = ({ priority }) => {
    const getPriorityColor = () => {
      switch (priority) {
        case "critical":
          return "#ef4444";
        case "high":
          return "#f97316";
        case "medium":
          return "#eab308";
        case "normal":
          return "#10b981";
        default:
          return "#64748b";
      }
    };

    return (
      <View
        style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}
      >
        <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
      </View>
    );
  };

  const PostItem = ({ post }) => (
    <View
      style={[
        styles.post,
        {
          backgroundColor: theme.primaryBackground,
          borderColor: theme.primaryBorder,
        },
      ]}
    >
      {/* Saved indicator */}
      {savedPosts.has(post.id) && (
        <View
          style={[
            styles.savedIndicator,
            { backgroundColor: theme.secondaryBackground },
          ]}
        >
          <Ionicons name="bookmark" size={16} color="#3b82f6" />
          <Text style={styles.savedText}>Saved</Text>
        </View>
      )}

      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={post.user.avatar} style={styles.avatar} />
          <View>
            <Text style={[styles.username, { color: theme.primaryText }]}>
              {post.user.name}
            </Text>
            <Text style={[styles.handle, { color: theme.accentText }]}>
              {post.user.handle}
            </Text>
          </View>
        </View>
        <PriorityBadge priority={post.priority} />
      </View>

      <Text style={[styles.postText, { color: theme.secondaryText }]}>
        {post.content}
      </Text>

      {post.highlight && (
        <Text style={[styles.postText, { color: theme.secondaryText }]}>
          <Text style={[styles.highlight, { color: theme.secondaryText }]}>
            {post.highlight}
          </Text>
        </Text>
      )}

      {post.link && (
        <Text style={[styles.link, { color: theme.accentText }]}>
          {post.link}
        </Text>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <Text
              key={index}
              style={[
                styles.postTag,
                {
                  backgroundColor: theme.secondaryBackground,
                  borderColor: theme.secondaryBorder,
                  color: theme.secondaryText,
                },
              ]}
            >
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {post.image && (
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Image
              source={post.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Ionicons
            name={likedPosts.has(post.id) ? "heart" : "heart-outline"}
            size={20}
            color={likedPosts.has(post.id) ? "#ef4444" : theme.secondaryIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(post.id)}
        >
          <View style={styles.actionWithCount}>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={theme.secondaryIcon}
            />
            {(post.comments || 0) > 0 && (
              <Text
                style={[styles.actionCount, { color: theme.secondaryText }]}
              >
                {post.comments}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(post)}
        >
          <Ionicons
            name="paper-plane-outline"
            size={20}
            color={theme.secondaryIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.bookmarkButton]}
          onPress={() => handleSave(post.id)}
        >
          <Ionicons
            name={savedPosts.has(post.id) ? "bookmark" : "bookmark-outline"}
            size={20}
            color={savedPosts.has(post.id) ? "#3b82f6" : theme.secondaryIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postMeta}>
        <Text style={[styles.likes, { color: theme.secondaryText }]}>
          {post.likes} Likes
        </Text>
        <Text style={[styles.timestamp, { color: theme.secondaryText }]}>
          {post.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <HeaderWithBack />
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.statusBarBackground}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.secondaryBackground,
              borderColor: theme.primaryBorder,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.secondaryIcon}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="What's happening?"
            placeholderTextColor={theme.secondaryText}
            style={[styles.searchInput, { color: theme.primaryText }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.accentText }]}
          onPress={() => setFilterVisible(!filterVisible)}
        >
          <MaterialIcons name="tune" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: theme.overlayBackground },
          ]}
        >
          <Animated.View
            style={[
              styles.filterModal,
              {
                backgroundColor: theme.modalBackground,
                borderColor: theme.primaryBorder,
              },
              {
                transform: [
                  {
                    translateY: filterAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.filterHeader,
                { borderBottomColor: theme.primaryBorder },
              ]}
            >
              <Text style={[styles.filterTitle, { color: theme.accentText }]}>
                Filter Posts
              </Text>
              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                style={styles.closeFilterButton}
              >
                <Ionicons name="close" size={24} color={theme.secondaryIcon} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.filterContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Categories */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  Categories
                </Text>
                <View style={styles.filterGrid}>
                  <FilterCheckbox
                    label="All"
                    checked={selectedFilters.all}
                    onPress={() => toggleFilter("all")}
                  />
                  <FilterCheckbox
                    label="Warning"
                    checked={selectedFilters.warning}
                    onPress={() => toggleFilter("warning")}
                    color="#f97316"
                  />
                  <FilterCheckbox
                    label="Alerts"
                    checked={selectedFilters.alerts}
                    onPress={() => toggleFilter("alerts")}
                    color="#ef4444"
                  />
                  <FilterCheckbox
                    label="Updates"
                    checked={selectedFilters.updates}
                    onPress={() => toggleFilter("updates")}
                    color="#10b981"
                  />
                  <FilterCheckbox
                    label="Emergency"
                    checked={selectedFilters.emergency}
                    onPress={() => toggleFilter("emergency")}
                    color="#dc2626"
                  />
                  <FilterCheckbox
                    label="Bookmarked"
                    checked={selectedFilters.bookmarked}
                    onPress={() => toggleFilter("bookmarked")}
                    color="#3b82f6"
                  />
                </View>
              </View>

              {/* Priorities */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  Priority Level
                </Text>
                <View style={styles.filterGrid}>
                  <FilterCheckbox
                    label="All"
                    checked={selectedPriorities.all}
                    onPress={() => togglePriority("all")}
                  />
                  <FilterCheckbox
                    label="Critical"
                    checked={selectedPriorities.critical}
                    onPress={() => togglePriority("critical")}
                    color="#ef4444"
                  />
                  <FilterCheckbox
                    label="High"
                    checked={selectedPriorities.high}
                    onPress={() => togglePriority("high")}
                    color="#f97316"
                  />
                  <FilterCheckbox
                    label="Medium"
                    checked={selectedPriorities.medium}
                    onPress={() => togglePriority("medium")}
                    color="#eab308"
                  />
                  <FilterCheckbox
                    label="Normal"
                    checked={selectedPriorities.normal}
                    onPress={() => togglePriority("normal")}
                    color="#10b981"
                  />
                </View>
              </View>

              {/* Tags */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  Tags
                </Text>
                <View style={styles.tagsGrid}>
                  {allTags.map((tag) => (
                    <TagChip
                      key={tag}
                      tag={tag}
                      selected={selectedTags.includes(tag)}
                      onPress={() => toggleTag(tag)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.filterActions,
                { borderTopColor: theme.primaryBorder },
              ]}
            >
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: theme.accentText }]}
                onPress={resetFilters}
              >
                <Text style={[styles.resetText, { color: theme.accentText }]}>
                  Reset All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: theme.accentText },
                ]}
                onPress={() => setFilterVisible(false)}
              >
                <Text
                  style={[styles.applyText, { color: theme.primaryBackground }]}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00C6FF"
            colors={["#00C6FF"]}
          />
        }
      >
        {filterPosts().map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeCommentModal}
      >
        <KeyboardAvoidingView
          style={[
            styles.commentModalContainer,
            { backgroundColor: theme.primaryBackground },
          ]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.commentModalContent}>
              {/* Comment Modal Header */}
              <View
                style={[
                  styles.commentModalHeader,
                  { borderBottomColor: theme.primaryBorder },
                ]}
              >
                <TouchableOpacity
                  onPress={closeCommentModal}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={theme.accentIcon} />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.commentModalTitle,
                    { color: theme.primaryText },
                  ]}
                >
                  Comments
                </Text>
                <View style={styles.placeholderButton} />
              </View>

              {/* Original Post */}
              {selectedPost && (
                <View
                  style={[
                    styles.originalPostContainer,
                    { borderBottomColor: theme.primaryBorder },
                  ]}
                >
                  <View style={styles.originalPostHeader}>
                    <Image
                      source={selectedPost.user.avatar}
                      style={styles.originalPostAvatar}
                    />
                    <View style={styles.originalPostUserInfo}>
                      <Text
                        style={[
                          styles.originalPostUsername,
                          { color: theme.primaryText },
                        ]}
                      >
                        {selectedPost.user.name}
                      </Text>
                      <Text
                        style={[
                          styles.originalPostHandle,
                          { color: theme.secondaryText },
                        ]}
                      >
                        {selectedPost.user.handle}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.originalPostText,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {selectedPost.content}
                  </Text>
                  {selectedPost.highlight && (
                    <Text
                      style={[
                        styles.originalPostHighlight,
                        { color: theme.secondaryText },
                      ]}
                    >
                      {selectedPost.highlight}
                    </Text>
                  )}
                </View>
              )}

              {/* Comments List */}
              <ScrollView
                style={styles.commentsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {selectedPost &&
                comments[selectedPost.id] &&
                comments[selectedPost.id].length > 0 ? (
                  comments[selectedPost.id].map((comment) => (
                    <View
                      key={comment.id}
                      style={[
                        styles.commentItem,
                        { borderBottomColor: theme.primaryBorder },
                      ]}
                    >
                      <Image
                        source={comment.user.avatar}
                        style={styles.commentAvatar}
                      />
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text
                            style={[
                              styles.commentUsername,
                              { color: theme.primaryText },
                            ]}
                          >
                            {comment.user.name}
                          </Text>
                          <Text
                            style={[
                              styles.commentHandle,
                              { color: theme.secondaryText },
                            ]}
                          >
                            {comment.user.handle}
                          </Text>
                          <Text
                            style={[
                              styles.commentTimestamp,
                              { color: theme.secondaryText },
                            ]}
                          >
                            {comment.timestamp}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.commentText,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {comment.text}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noCommentsContainer}>
                    <Text
                      style={[
                        styles.noCommentsText,
                        { color: theme.secondaryText },
                      ]}
                    >
                      No comments yet. Be the first to comment!
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Comment Input */}
              <View
                style={[
                  styles.commentInputContainer,
                  {
                    borderTopColor: theme.primaryBorder,
                    backgroundColor: theme.primaryBackground,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: theme.secondaryBackground,
                      color: theme.primaryText,
                    },
                  ]}
                  placeholder="Add a comment..."
                  placeholderTextColor={theme.secondaryText}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={280}
                  returnKeyType="default"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[
                    styles.postCommentButton,
                    { backgroundColor: theme.accentText },
                    !commentText.trim() && {
                      backgroundColor: theme.secondaryBorder,
                    },
                  ]}
                  onPress={() => handleAddComment(selectedPostId)}
                  disabled={!commentText.trim()}
                >
                  <Text
                    style={[
                      styles.postCommentButtonText,
                      { color: theme.primaryBackground },
                      !commentText.trim() && { color: theme.secondaryText },
                    ]}
                  >
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Floating Action Button for Global Chat */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accentText }]}
        onPress={() => navigation.navigate("GlobalChatScreen")}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    borderRadius: 12,
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterModal: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 0,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeFilterButton: {
    padding: 8,
  },
  filterContent: {
    padding: 20,
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#00C6FF",
    borderColor: "#00C6FF",
  },
  filterLabel: {
    fontSize: 16,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  tagChipSelected: {
    backgroundColor: "#00C6FF",
    borderColor: "#00C6FF",
  },
  tagText: {
    fontSize: 14,
  },
  tagTextSelected: {
    color: "#fff",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 198, 255, 0.1)",
    borderWidth: 1,
    alignItems: "center",
  },
  resetText: {
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  post: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    position: "relative",
  },
  savedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  savedText: {
    color: "#3b82f6",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  handle: {
    fontSize: 14,
  },
  postText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  highlight: {
    color: "#949BA4",
  },
  link: {
    fontSize: 15,
    marginBottom: 12,
  },
  imageContainer: {
    marginVertical: 12,
  },
  imagePlaceholder: {
    backgroundColor: "#7f1d1d",
    borderRadius: 8,
    height: 140,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  postActions: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 20,
    padding: 4,
  },
  actionWithCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  bookmarkButton: {
    marginLeft: "auto",
    marginRight: 0,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  likes: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 14,
  },
  sosContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
  },
  sosButton: {
    backgroundColor: "#ef4444",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Comment Modal Styles
  commentModalContainer: {
    flex: 1,
  },
  commentModalContent: {
    flex: 1,
  },
  commentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholderButton: {
    width: 40,
  },
  originalPostContainer: {
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  originalPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  originalPostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  originalPostUserInfo: {
    flex: 1,
  },
  originalPostUsername: {
    fontSize: 14,
    fontWeight: "600",
  },
  originalPostHandle: {
    fontSize: 12,
  },
  originalPostText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  originalPostHighlight: {
    fontSize: 14,
    fontStyle: "italic",
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  commentHandle: {
    fontSize: 12,
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noCommentsText: {
    fontSize: 16,
    textAlign: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  postCommentButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  postCommentButtonDisabled: {
    backgroundColor: "#334155",
  },
  postCommentButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  postCommentButtonTextDisabled: {
    color: "#64748b",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 100,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  priorityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 12,
  },
  postTag: {
    backgroundColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#64748b",
    color: "#64748b",
    fontSize: 12,
  },
});

export default CommunityPage;
