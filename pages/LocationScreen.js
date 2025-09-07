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
  Platform,
} from "react-native";
import HeaderWithBack from "../components/Headerwithbackbutton";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { getTheme } from "../context/theme";
import { BlurView } from "expo-blur";
import RNModal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2N5bGxhayIsImEiOiJjbWQ0bDBydWYwZzBvMm1zY3gzcDl1M2VnIn0.Uee-V7CtC3EMW3-8bU5MMA";

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
  const [routeInfo, setRouteInfo] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [transportMode, setTransportMode] = useState("driving");
  const [waypoint, setWaypoint] = useState(null);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [mapStyle, setMapStyle] = useState("standard");
  const [mapboxStyle, setMapboxStyle] = useState("mapbox://styles/mapbox/streets-v11");

  // Get theme from context
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  // Theme-based glass and accent colors
  const glassBg = isDarkMode ? "rgba(20,24,40,0.7)" : "rgba(255,255,255,0.7)";
  const glassBorder = isDarkMode ? "rgba(80,200,255,0.18)" : "rgba(0,0,0,0.08)";
  const accentGradient = isDarkMode
    ? ["#00C6FF", "#0072FF"]
    : ["#7be0ff", "#d28eff"];

  useEffect(() => {
    (async () => {
      try {
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
        
        if (!loc || !loc.coords) {
          throw new Error("Failed to get location coordinates");
        }
        
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
          (locUpdate) => {
            if (locUpdate && locUpdate.coords) {
              setLocation(locUpdate.coords);
            }
          }
        );
        return () => subscription && subscription.remove();
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert(
          "Location Error",
          "Failed to get your location. Please check your location settings and try again."
        );
        setLoading(false);
      }
    })();
  }, []);

  // Search for places using Mapbox Geocoding API
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(
          data.features.map((feature) => ({
            id: feature.id,
            name: feature.place_name,
            coordinates: feature.center,
            address: feature.place_name,
          }))
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Search Error", "Failed to search for places. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle map press for setting destination
  const handleMapPress = (e) => {
    if (isAddingWaypoint) {
      setWaypoint({
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      });
      setIsAddingWaypoint(false);
    } else {
      setDestination({
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      });
      setShowSearchResults(false);
    }
  };

  // Get route using Mapbox Directions API
  const getRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=polyline&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert polyline to coordinates for react-native-maps
        const coordinates = decodePolyline(route.geometry);
        setRoute(coordinates);
        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
        });
      }
    } catch (error) {
      console.error("Route error:", error);
      Alert.alert("Route Error", "Failed to get route. Please try again.");
    }
  };

  // Simple polyline decoder (basic implementation)
  const decodePolyline = (encoded) => {
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return coordinates;
  };

  // Handle search result selection
  const handleSearchResultPress = (result) => {
    setDestination({
      latitude: result.coordinates[1],
      longitude: result.coordinates[0],
    });
    setSearchQuery(result.name);
    setShowSearchResults(false);
    
    // Get route if we have current location
    if (location) {
      getRoute(
        [location.longitude, location.latitude],
        result.coordinates
      );
    }
  };

  // Clear destination
  const clearDestination = () => {
    setDestination(null);
    setRoute(null);
    setRouteInfo(null);
    setWaypoint(null);
  };

  // Toggle map style
  const toggleMapStyle = () => {
    const styles = ["standard", "satellite", "hybrid"];
    const mapboxStyles = [
      "mapbox://styles/mapbox/streets-v11",
      "mapbox://styles/mapbox/satellite-v9",
      "mapbox://styles/mapbox/dark-v10",
    ];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
    setMapboxStyle(mapboxStyles[nextIndex]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <HeaderWithBack
        title="Location"
        navigation={navigation}
        rightComponent={
          <TouchableOpacity
            style={styles.headerRightContainer}
            onPress={() => setShowInfoModal(true)}
          >
            <Ionicons name="information-circle" size={24} color={theme.accentText} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: glassBg, borderColor: glassBorder }]}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.primaryText }]}
            placeholder="Search for places..."
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchPlaces(text);
              setShowSearchResults(text.length > 0);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery("");
              setShowSearchResults(false);
            }}>
              <Ionicons name="close-circle" size={20} color={theme.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {showSearchResults && (
        <View style={[styles.searchResults, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          {searchLoading ? (
            <ActivityIndicator size="small" color={theme.accentText} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultPress(item)}
                >
                  <Ionicons name="location" size={20} color={theme.accentText} />
                  <Text style={[styles.searchResultText, { color: theme.primaryText }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: glassBg, borderColor: glassBorder }]}
          onPress={toggleMapStyle}
        >
          <Ionicons name="map" size={20} color={theme.accentText} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: glassBg, borderColor: glassBorder }]}
          onPress={() => setIsAddingWaypoint(!isAddingWaypoint)}
        >
          <Ionicons name="add" size={20} color={theme.accentText} />
        </TouchableOpacity>
        
        {destination && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: glassBg, borderColor: glassBorder }]}
            onPress={clearDestination}
          >
            <Ionicons name="close" size={20} color={theme.accentText} />
          </TouchableOpacity>
        )}
      </View>

      {/* MapView */}
      <View style={styles.mapContainer}>
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
            mapType={mapStyle}
            provider={PROVIDER_GOOGLE}
            onMapReady={() => console.log("Map is ready")}
            onError={(error) => {
              console.error("Map error:", error);
              Alert.alert(
                "Map Error",
                "Failed to load the map. Please check your internet connection and try again."
              );
            }}
          >
            {/* Current Location Marker */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="You are here"
                pinColor={theme.accentText}
              />
            )}

            {/* Destination Marker */}
            {destination && (
              <Marker
                coordinate={destination}
                title="Destination"
                pinColor="#FF3B30"
              />
            )}

            {/* Waypoint Marker */}
            {waypoint && (
              <Marker
                coordinate={waypoint}
                title="Waypoint"
                pinColor="#34C759"
              />
            )}

            {/* Route Line */}
            {route && (
              <Polyline
                coordinates={route}
                strokeColor={theme.accentText}
                strokeWidth={4}
                strokeOpacity={0.8}
              />
            )}
          </MapView>
        )}
      </View>

      {/* Route Info */}
      {routeInfo && (
        <View style={[styles.routeInfo, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          <View style={styles.routeInfoItem}>
            <Ionicons name="time" size={20} color={theme.accentText} />
            <Text style={[styles.routeInfoText, { color: theme.primaryText }]}>
              {Math.round(routeInfo.duration / 60)} min
            </Text>
          </View>
          <View style={styles.routeInfoItem}>
            <Ionicons name="navigate" size={20} color={theme.accentText} />
            <Text style={[styles.routeInfoText, { color: theme.primaryText }]}>
              {(routeInfo.distance / 1000).toFixed(1)} km
            </Text>
          </View>
        </View>
      )}

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
                Location Features
              </Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <Ionicons name="close" size={24} color={theme.accentText} />
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
                  Search for places using Mapbox Geocoding
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
                  Provides driving directions using Mapbox Directions
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
    padding: 8,
  },
  searchContainer: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchResults: {
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  searchResultText: {
    marginLeft: 8,
    fontSize: 14,
  },
  controlsContainer: {
    position: "absolute",
    top: 120,
    right: 16,
    zIndex: 1000,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  routeInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeInfoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
});

export default LocationScreen;