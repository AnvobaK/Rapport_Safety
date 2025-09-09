import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import HeaderWithBack from "../components/Headerwithbackbutton";
import MapView, {
  Marker,
  Polyline,
  Heatmap,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import { BlurView } from "expo-blur";
import RNModal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";

const MAPBOX_API_KEY =
  "pk.eyJ1Ijoic2N5bGxhayIsImEiOiJjbWQ0bDBydWYwZzBvMm1zY3gzcDl1M2VnIn0.Uee-V7CtC3EMW3-8bU5MMA"; // <-- Replace with your Mapbox API key

const TRANSPORT_MODES = [
  { key: "driving", label: "Driving", icon: "car" },
  { key: "walking", label: "Walking", icon: "walk" },
  { key: "cycling", label: "Cycling", icon: "bicycle" },
];

const LocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchedPlaces, setSearchedPlaces] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [transportMode, setTransportMode] = useState("driving");
  const [waypoint, setWaypoint] = useState(null);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [routeSheetExpanded, setRouteSheetExpanded] = useState(false);
  const [mapType, setMapType] = useState("standard"); // standard, satellite, hybrid
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Theme-based glass and accent colors
  const glassBg = isDarkMode ? "rgba(20,24,40,0.7)" : "rgba(255,255,255,0.7)";
  const glassBorder = isDarkMode ? "rgba(80,200,255,0.18)" : "rgba(0,0,0,0.08)";
  const accentGradient = isDarkMode
    ? ["#00C6FF", "#0072FF"]
    : ["#7be0ff", "#d28eff"];
  const shadowColor = isDarkMode ? "#00C6FF" : "#7be0ff";

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
      // Subscribe to location updates
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (locUpdate) => setLocation(locUpdate.coords)
      );
      return () => subscription && subscription.remove();
    })();
  }, []);

  // Search for places using Nominatim
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (place) => {
    const newPlace = {
      id: Date.now().toString(),
      name: place.display_name,
      coordinate: {
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
      },
    };

    setSearchedPlaces((prev) => [...prev, newPlace]);
    setSearchQuery(place.display_name);
    setShowSearchResults(false);
    setSearchResults([]);
    Keyboard.dismiss();

    // Set destination to the selected place
    setDestination(newPlace.coordinate);

    // Zoom map to the selected place
    setMapRegion({
      latitude: newPlace.coordinate.latitude,
      longitude: newPlace.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    // Fetch route from current location to the selected place
    if (location) {
      fetchRoute(location, newPlace.coordinate);
    }
  };

  // Updated fetchRoute to use selected transportMode and waypoint
  const fetchRoute = async (
    from,
    to,
    mode = transportMode,
    waypointCoord = waypoint
  ) => {
    try {
      setRoutes([]);
      setRoute(null);
      setRouteInfo(null);
      let coordsArr = [`${from.longitude},${from.latitude}`];
      if (waypointCoord) {
        coordsArr.push(`${waypointCoord.longitude},${waypointCoord.latitude}`);
      }
      coordsArr.push(`${to.longitude},${to.latitude}`);
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coordsArr.join(
        ";"
      )}?geometries=geojson&alternatives=true&access_token=${MAPBOX_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch route");
      const data = await response.json();
      if (!data.routes || !data.routes.length)
        throw new Error("No route found");
      setRoutes(data.routes);
      // Default to first route
      const firstRoute = data.routes[0];
      let coords = [];
      if (
        firstRoute.geometry &&
        Array.isArray(firstRoute.geometry.coordinates)
      ) {
        coords = firstRoute.geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));
      }
      setRoute(coords);
      setRouteInfo({
        distance: firstRoute.distance, // in meters
        duration: firstRoute.duration, // in seconds
      });
      setSelectedRouteIndex(0);
    } catch (err) {
      console.error("Route error details:", err);
      Alert.alert("Error", "Could not get directions. Please try again.");
      setRoute([]); // Always set to array to avoid undefined
    }
  };

  // Handle selecting an alternative route
  const handleSelectRoute = (idx) => {
    setSelectedRouteIndex(idx);
    const selected = routes[idx];
    if (
      selected &&
      selected.geometry &&
      Array.isArray(selected.geometry.coordinates)
    ) {
      const coords = selected.geometry.coordinates.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));
      setRoute(coords);
      setRouteInfo({
        distance: selected.distance,
        duration: selected.duration,
      });
    }
  };

  // When user changes transport mode or waypoint, refetch route if destination is set
  useEffect(() => {
    if (location && destination) {
      fetchRoute(location, destination, transportMode, waypoint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportMode, waypoint]);

  // Add Waypoint Button handler
  const handleAddWaypoint = () => {
    setIsAddingWaypoint(true);
    Alert.alert("Waypoint Mode", "Tap on the map to set a waypoint.");
  };

  // Modified handleMapPress to support waypoint mode
  const handleMapPress = (e) => {
    Keyboard.dismiss();
    setShowSearchResults(false);
    const dest = e.nativeEvent.coordinate;
    if (isAddingWaypoint) {
      setWaypoint(dest);
      setIsAddingWaypoint(false);
      // Fetch route with waypoint if location and destination are set
      if (
        location &&
        destination &&
        typeof dest.latitude === "number" &&
        typeof dest.longitude === "number"
      ) {
        fetchRoute(location, destination, transportMode, dest);
      }
      return;
    }
    setDestination(dest);
    // Defensive: Only fetch route if both location and dest are valid
    if (
      location &&
      dest &&
      typeof dest.latitude === "number" &&
      typeof dest.longitude === "number"
    ) {
      fetchRoute(location, dest, transportMode, waypoint);
    } else {
      Alert.alert("Error", "Invalid location or destination.");
    }
    // Update map region to show the tapped location
    setMapRegion({
      latitude: dest.latitude,
      longitude: dest.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // Center map on current location
  const centerOnMyLocation = () => {
    if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Custom header right component with location and info icons
  const HeaderRightComponent = () => (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity
        style={styles.headerIcon}
        onPress={() => setShowInfoModal(true)}
      >
        <Ionicons
          name="information-circle"
          size={24}
          color={theme.accentIcon}
        />
      </TouchableOpacity>
    </View>
  );

  // Helper to format duration (seconds) to min/hours
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    return `${(seconds / 3600).toFixed(1)} hr`;
  };

  // Helper to format distance (meters) to km/m
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  // Sample heatmap points (now around KNUST campus, Kumasi, Ghana)
  const heatmapPoints = [
    { latitude: 6.6745, longitude: -1.5712, weight: 1 }, // KNUST main
    { latitude: 6.675, longitude: -1.57, weight: 1 },
    { latitude: 6.6735, longitude: -1.5725, weight: 1 },
    { latitude: 6.676, longitude: -1.569, weight: 1 },
    { latitude: 6.674, longitude: -1.573, weight: 1 },
    { latitude: 6.6755, longitude: -1.5715, weight: 1 },
    { latitude: 6.6738, longitude: -1.5708, weight: 1 },
    { latitude: 6.6748, longitude: -1.572, weight: 1 },
    { latitude: 6.6752, longitude: -1.5705, weight: 1 },
    { latitude: 6.6742, longitude: -1.5718, weight: 1 },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.primaryBackground }]}
    >
      {/* Only show overlays if not in fullscreen mode */}
      {!mapFullscreen && (
        <>
          <HeaderWithBack
            title="Location Tracker"
            rightComponent={<HeaderRightComponent />}
            titleStyle={{ color: isDarkMode ? theme.primaryText : "#000" }}
          />

          {/* Map Style Switcher */}
          <View style={styles.mapStyleSwitcherContainer}>
            <TouchableOpacity
              style={[
                styles.mapStyleButton,
                mapType === "standard" && styles.mapStyleButtonActive,
              ]}
              onPress={() => setMapType("standard")}
            >
              <Text
                style={[
                  styles.mapStyleButtonText,
                  mapType === "standard" && styles.mapStyleButtonTextActive,
                ]}
              >
                Streets
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mapStyleButton,
                mapType === "satellite" && styles.mapStyleButtonActive,
              ]}
              onPress={() => setMapType("satellite")}
            >
              <Text
                style={[
                  styles.mapStyleButtonText,
                  mapType === "satellite" && styles.mapStyleButtonTextActive,
                ]}
              >
                Satellite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mapStyleButton,
                mapType === "hybrid" && styles.mapStyleButtonActive,
              ]}
              onPress={() => setMapType("hybrid")}
            >
              <Text
                style={[
                  styles.mapStyleButtonText,
                  mapType === "hybrid" && styles.mapStyleButtonTextActive,
                ]}
              >
                Hybrid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mapStyleButton,
                showHeatmap && styles.mapStyleButtonActive,
              ]}
              onPress={() => setShowHeatmap((prev) => !prev)}
            >
              <Text
                style={[
                  styles.mapStyleButtonText,
                  showHeatmap && styles.mapStyleButtonTextActive,
                ]}
              >
                Heatmap
              </Text>
            </TouchableOpacity>
          </View>

          {/* Normal Search Bar */}
          <View style={styles.searchBarWrapper}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: theme.modalBackground,
                  borderColor: theme.primaryBorder,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={theme.secondaryText}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: theme.primaryText }]}
                placeholder="Search for places..."
                placeholderTextColor={theme.secondaryText}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchPlaces(text);
                }}
                onFocus={() => setShowSearchResults(true)}
              />
              {searchLoading && (
                <ActivityIndicator
                  size="small"
                  color={theme.accentText}
                  style={styles.searchLoading}
                />
              )}
            </View>
            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <View
                style={[
                  styles.searchResultsContainer,
                  {
                    backgroundColor: theme.modalBackground,
                    borderColor: theme.primaryBorder,
                  },
                ]}
              >
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.searchResultItem,
                        { borderBottomColor: theme.primaryBorder },
                      ]}
                      onPress={() => handleSearchResultSelect(item)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={theme.accentIcon}
                      />
                      <Text
                        style={[
                          styles.searchResultText,
                          { color: theme.primaryText },
                        ]}
                        numberOfLines={2}
                      >
                        {item.display_name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}
          </View>

          {/* Transport Mode Dropdown and Add Waypoint Button in one row */}
          <View
            style={[
              styles.dropdownRow,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
          >
            <BlurView
              intensity={60}
              tint={isDarkMode ? "dark" : "light"}
              style={[styles.glassDropdown, { flex: 1, marginRight: 8 }]}
            >
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowModeDropdown(true)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={
                    TRANSPORT_MODES.find((m) => m.key === transportMode)
                      ?.icon || "car"
                  }
                  size={18}
                  color={theme.primaryText}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: theme.primaryText,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {TRANSPORT_MODES.find((m) => m.key === transportMode)
                    ?.label || "Driving"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={theme.primaryText}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </BlurView>
            {/* Vibrant Add Waypoint Button */}
            <TouchableOpacity
              style={[
                styles.gradientButton,
                {
                  shadowColor,
                  flex: 1,
                  marginLeft: 0,
                  marginRight: 0,
                  minWidth: 120,
                  padding: 0,
                },
              ]}
              onPress={handleAddWaypoint}
              disabled={isAddingWaypoint}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#00C6FF", "#0072FF"] : ["#7be0ff", "#d28eff"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <BlurView
                intensity={85}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.gradientButtonBlur}
              >
                <Text
                  style={{
                    color: theme.primaryBackground,
                    fontWeight: "700",
                    fontSize: 15,
                    letterSpacing: 0.5,
                    textAlign: "center",
                    textShadowColor: isDarkMode ? "#000" : "#fff",
                    textShadowRadius: 4,
                  }}
                >
                  {isAddingWaypoint ? "Tap on map..." : "Add Waypoint"}
                </Text>
              </BlurView>
            </TouchableOpacity>
          </View>
          {waypoint && (
            <Text
              style={{
                color: theme.accentText,
                marginTop: 2,
                marginBottom: 4,
                fontSize: 12,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Waypoint set. Tap again to change.
            </Text>
          )}

          {/* Dropdown Modal rendered at root level */}
          <Modal
            visible={showModeDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowModeDropdown(false)}
          >
            <TouchableOpacity
              style={styles.dropdownOverlay}
              onPress={() => setShowModeDropdown(false)}
              activeOpacity={1}
            >
              <View
                style={[
                  styles.dropdownList,
                  { backgroundColor: glassBg, borderColor: glassBorder },
                ]}
              >
                {TRANSPORT_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.dropdownItem,
                      transportMode === mode.key && {
                        backgroundColor: glassBorder,
                      },
                    ]}
                    onPress={() => {
                      setTransportMode(mode.key);
                      setShowModeDropdown(false);
                    }}
                  >
                    <Ionicons
                      name={mode.icon}
                      size={18}
                      color={theme.primaryText}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: theme.primaryText,
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Glassy Route Options Bar */}
          {routes.length > 1 && (
            <BlurView
              intensity={60}
              tint={isDarkMode ? "dark" : "light"}
              style={styles.routeBarGlass}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.routeBar}
                contentContainerStyle={{ alignItems: "center" }}
              >
                {routes.map((r, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectRoute(idx)}
                    style={[
                      styles.routeOption,
                      {
                        backgroundColor:
                          idx === selectedRouteIndex
                            ? isDarkMode
                              ? "#00C6FF33"
                              : "#7be0ff33"
                            : "transparent",
                        borderColor:
                          idx === selectedRouteIndex
                            ? theme.accentText
                            : glassBorder,
                        shadowColor:
                          idx === selectedRouteIndex
                            ? theme.accentText
                            : "transparent",
                        elevation: idx === selectedRouteIndex ? 6 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          idx === selectedRouteIndex
                            ? theme.accentText
                            : theme.primaryText,
                        fontWeight: "700",
                        fontSize: 15,
                      }}
                    >
                      {formatDuration(r.duration)}
                    </Text>
                    <Text
                      style={{
                        color:
                          idx === selectedRouteIndex
                            ? theme.accentText
                            : theme.secondaryText,
                        fontSize: 13,
                      }}
                    >
                      {formatDistance(r.distance)}
                    </Text>
                    {r.legs && r.legs[0] && r.legs[0].summary && (
                      <Text
                        style={{
                          color:
                            idx === selectedRouteIndex
                              ? theme.accentText
                              : theme.tertiaryText,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        {r.legs[0].summary}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BlurView>
          )}

          {/* Enhanced Route Info Display */}
          {routeInfo && (
            <View style={styles.routeInfoContainer}>
              <View
                style={[
                  styles.routeInfoCard,
                  {
                    backgroundColor: theme.modalBackground,
                    borderColor: theme.primaryBorder,
                    shadowColor: shadowColor,
                  },
                ]}
              >
                <View style={styles.routeInfoHeader}>
                  <Ionicons
                    name="navigate"
                    size={20}
                    color={theme.accentText}
                    style={styles.routeInfoIcon}
                  />
                  <Text
                    style={[
                      styles.routeInfoTitle,
                      { color: theme.primaryText },
                    ]}
                  >
                    Route Details
                  </Text>
                </View>

                <View style={styles.routeInfoContent}>
                  <View style={styles.routeInfoItem}>
                    <View style={styles.routeInfoItemLeft}>
                      <Ionicons
                        name="time"
                        size={18}
                        color={theme.accentIcon}
                      />
                      <Text
                        style={[
                          styles.routeInfoLabel,
                          { color: theme.secondaryText },
                        ]}
                      >
                        Duration
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.routeInfoValue,
                        { color: theme.primaryText },
                      ]}
                    >
                      {formatDuration(routeInfo.duration)}
                    </Text>
                  </View>

                  <View style={styles.routeInfoDivider} />

                  <View style={styles.routeInfoItem}>
                    <View style={styles.routeInfoItemLeft}>
                      <Ionicons name="map" size={18} color={theme.accentIcon} />
                      <Text
                        style={[
                          styles.routeInfoLabel,
                          { color: theme.secondaryText },
                        ]}
                      >
                        Distance
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.routeInfoValue,
                        { color: theme.primaryText },
                      ]}
                    >
                      {formatDistance(routeInfo.distance)}
                    </Text>
                  </View>

                  <View style={styles.routeInfoDivider} />

                  <View style={styles.routeInfoItem}>
                    <View style={styles.routeInfoItemLeft}>
                      <Ionicons
                        name={
                          TRANSPORT_MODES.find((m) => m.key === transportMode)
                            ?.icon || "car"
                        }
                        size={18}
                        color={theme.accentIcon}
                      />
                      <Text
                        style={[
                          styles.routeInfoLabel,
                          { color: theme.secondaryText },
                        ]}
                      >
                        Mode
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.routeInfoValue,
                        { color: theme.primaryText },
                      ]}
                    >
                      {TRANSPORT_MODES.find((m) => m.key === transportMode)
                        ?.label || "Driving"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {/* MapView always fills the rest of the space */}
      <View
        style={
          mapFullscreen
            ? styles.mapFullscreenContainer
            : styles.mapAbsoluteContainer
        }
      >
        {loading || !mapRegion ? (
          <ActivityIndicator
            size="large"
            color={theme.accentText}
            style={{ marginTop: 30 }}
          />
        ) : (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={mapRegion}
            region={mapRegion}
            showsUserLocation={true}
            onPress={handleMapPress}
            mapType={mapType}
            provider={PROVIDER_GOOGLE}
          >
            {/* Heatmap overlay (only if enabled) */}
            {showHeatmap && (
              <Heatmap
                points={heatmapPoints}
                opacity={0.7}
                radius={50}
                gradient={{
                  colors: ["#00f", "#0ff", "#0f0", "#ff0", "#f00"],
                  startPoints: [0.01, 0.25, 0.5, 0.75, 1],
                  colorMapSize: 256,
                }}
              />
            )}
            {/* Current Location Marker */}
            {location &&
              typeof location.latitude === "number" &&
              typeof location.longitude === "number" && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="You are here"
                  pinColor={theme.accentText}
                />
              )}
            {/* Waypoint Marker */}
            {waypoint &&
              typeof waypoint.latitude === "number" &&
              typeof waypoint.longitude === "number" && (
                <Marker
                  coordinate={waypoint}
                  title="Waypoint"
                  pinColor={theme.info}
                />
              )}
            {/* Destination Marker */}
            {destination &&
              typeof destination.latitude === "number" &&
              typeof destination.longitude === "number" && (
                <Marker
                  coordinate={destination}
                  title="Destination"
                  pinColor={theme.error}
                />
              )}
            {/* Searched Places Markers */}
            {searchedPlaces.map(
              (place) =>
                place.coordinate &&
                typeof place.coordinate.latitude === "number" &&
                typeof place.coordinate.longitude === "number" && (
                  <Marker
                    key={place.id}
                    coordinate={place.coordinate}
                    title={place.name}
                    pinColor={theme.warning}
                  />
                )
            )}
            {/* Polyline for the selected route */}
            {route && Array.isArray(route) && route.length > 1 && (
              <Polyline
                coordinates={route}
                strokeColor={theme.accentText}
                strokeWidth={6}
                zIndex={2}
              />
            )}
          </MapView>
        )}

        {/* Fullscreen toggle button (always visible in top right) */}
        <TouchableOpacity
          style={styles.fullscreenToggleButton}
          onPress={() => setMapFullscreen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={mapFullscreen ? "contract" : "expand"}
            size={28}
            color={theme.accentText}
          />
        </TouchableOpacity>

        {/* Only show overlays if not in fullscreen mode */}
        {!mapFullscreen && (
          <>
            {/* My Location Button (absolute) */}
            <TouchableOpacity
              style={styles.myLocationButtonAbsolute}
              onPress={centerOnMyLocation}
              activeOpacity={0.85}
            >
              <Ionicons
                name="locate"
                size={24}
                color={theme.primaryBackground}
              />
            </TouchableOpacity>

            {/* Route Details Bottom Sheet (expandable/collapsible) */}
            {routeInfo && (
              <View
                style={[
                  styles.routeDetailsSheet,
                  routeSheetExpanded
                    ? styles.routeDetailsSheetExpanded
                    : styles.routeDetailsSheetCollapsed,
                ]}
              >
                <TouchableOpacity
                  style={styles.expandCollapseIcon}
                  onPress={() => setRouteSheetExpanded((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={routeSheetExpanded ? "chevron-down" : "chevron-up"}
                    size={28}
                    color={theme.accentText}
                  />
                </TouchableOpacity>
                {routeSheetExpanded && (
                  <ScrollView
                    contentContainerStyle={styles.routeDetailsContent}
                  >
                    <View
                      style={[
                        styles.routeInfoCard,
                        {
                          backgroundColor: theme.modalBackground,
                          borderColor: theme.primaryBorder,
                          shadowColor: shadowColor,
                        },
                      ]}
                    >
                      <View style={styles.routeInfoHeader}>
                        <Ionicons
                          name="navigate"
                          size={20}
                          color={theme.accentText}
                          style={styles.routeInfoIcon}
                        />
                        <Text
                          style={[
                            styles.routeInfoTitle,
                            { color: theme.primaryText },
                          ]}
                        >
                          Route Details
                        </Text>
                      </View>

                      <View style={styles.routeInfoContent}>
                        <View style={styles.routeInfoItem}>
                          <View style={styles.routeInfoItemLeft}>
                            <Ionicons
                              name="time"
                              size={18}
                              color={theme.accentIcon}
                            />
                            <Text
                              style={[
                                styles.routeInfoLabel,
                                { color: theme.secondaryText },
                              ]}
                            >
                              Duration
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.routeInfoValue,
                              { color: theme.primaryText },
                            ]}
                          >
                            {formatDuration(routeInfo.duration)}
                          </Text>
                        </View>

                        <View style={styles.routeInfoDivider} />

                        <View style={styles.routeInfoItem}>
                          <View style={styles.routeInfoItemLeft}>
                            <Ionicons
                              name="map"
                              size={18}
                              color={theme.accentIcon}
                            />
                            <Text
                              style={[
                                styles.routeInfoLabel,
                                { color: theme.secondaryText },
                              ]}
                            >
                              Distance
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.routeInfoValue,
                              { color: theme.primaryText },
                            ]}
                          >
                            {formatDistance(routeInfo.distance)}
                          </Text>
                        </View>

                        <View style={styles.routeInfoDivider} />

                        <View style={styles.routeInfoItem}>
                          <View style={styles.routeInfoItemLeft}>
                            <Ionicons
                              name={
                                TRANSPORT_MODES.find(
                                  (m) => m.key === transportMode
                                )?.icon || "car"
                              }
                              size={18}
                              color={theme.accentIcon}
                            />
                            <Text
                              style={[
                                styles.routeInfoLabel,
                                { color: theme.secondaryText },
                              ]}
                            >
                              Mode
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.routeInfoValue,
                              { color: theme.primaryText },
                            ]}
                          >
                            {TRANSPORT_MODES.find(
                              (m) => m.key === transportMode
                            )?.label || "Driving"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: theme.overlayBackground },
          ]}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.primaryBorder },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
                Location Tracker
              </Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.primaryText} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color={theme.accentIcon} />
                <Text style={[styles.infoText, { color: theme.primaryText }]}>
                  Shows your real-time location on the map
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="search" size={20} color={theme.accentIcon} />
                <Text style={[styles.infoText, { color: theme.primaryText }]}>
                  Search for places and see them on the map
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="navigate" size={20} color={theme.accentIcon} />
                <Text style={[styles.infoText, { color: theme.primaryText }]}>
                  Tap anywhere on the map to set a destination
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="map" size={20} color={theme.accentIcon} />
                <Text style={[styles.infoText, { color: theme.primaryText }]}>
                  Displays the best route with distance and time
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="car" size={20} color={theme.accentIcon} />
                <Text style={[styles.infoText, { color: theme.primaryText }]}>
                  Provides driving directions using HERE Maps
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchLoading: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchResultText: {
    fontSize: 14,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  overlayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  waypointButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  routeBar: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  routeOption: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 100,
  },
  routeInfoBox: {
    alignItems: "center",
    marginBottom: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
  },
  searchBarWrapper: {
    marginTop: 12,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  dropdownRow: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  glassDropdown: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  dropdownList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginVertical: 4,
    marginHorizontal: 16,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  gradientButtonBlur: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  routeBarGlass: {
    borderRadius: 18,
    marginHorizontal: 8,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  routeInfoContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  routeInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: "hidden",
  },
  routeInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  routeInfoIcon: {
    marginRight: 12,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  routeInfoContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  routeInfoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  routeInfoLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  routeInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  routeInfoDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: 8,
  },
  mapAbsoluteContainer: {
    flex: 1,
    position: "relative",
  },
  mapFullscreenContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "#000",
  },
  fullscreenToggleButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  routeDetailsSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  routeDetailsSheetExpanded: {
    height: "70%",
  },
  routeDetailsSheetCollapsed: {
    height: "30%",
  },
  expandCollapseIcon: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  routeDetailsContent: {
    flexGrow: 1,
  },
  myLocationButtonAbsolute: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapStyleSwitcherContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 20,
    padding: 4,
  },
  mapStyleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 2,
  },
  mapStyleButtonActive: {
    backgroundColor: "#00BFFF",
  },
  mapStyleButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 15,
  },
  mapStyleButtonTextActive: {
    color: "#fff",
  },
});

export default LocationScreen;
