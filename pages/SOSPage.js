import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import * as Location from "expo-location";
import { getTheme } from "../context/theme";
import LottieView from "lottie-react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useUserContext } from "../context/userContext";
import { useNavigation } from "@react-navigation/native";
import { useUserPreferences } from "../context/UserPreferencesContext";

const SOSScreen = () => {
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);
  const navigation = useNavigation();
  const { userId } = useUserContext();
  const [activated, setActivated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to send your location with the SOS alert.');
        return null;
      }
      
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location.coords;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
      return null;
    }
  };

  const handleSOSPress = async () => {
   try {
     setActivated(true);
      setIsLoading(true)
      
      // Get current location
      const coords = await getLocation();
      
      if (!coords) {
        Alert.alert('Warning', 'Could not get your location. Alert will be sent without location data.');
      }
       const reqOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          location: coords ? {
            latitude: coords.latitude,
            longitude: coords.longitude
          } : null
        })
      };
       const res = await fetch('https://rapport-backend.onrender.com/mail/sos', reqOptions);
      
      if (!res.ok) {
        throw new Error('Failed to send SOS alert');
      }
      
      const data = await res.json();
      console.log('SOS alert sent successfully:', data);
      
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      Alert.alert('Error', 'Failed to send SOS alert. Please try again.');
    } finally {
      setIsLoading(false)
    }
    navigation.navigate("SOSActive")
  };
  

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primaryBackground }]}
    >
      <View style={styles.content}>
        {activated && (
          <Text style={[styles.activatedText, { color: theme.error }]}>
            Button Activated
          </Text>
        )}

        {/* 🔁 Lottie animation container */}
        <View style={styles.sosButtonContainer}>
          {activated && (
            <LottieView
              source={require("../assets/animations/SOS.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
          )}
          <TouchableOpacity
            style={[styles.sosButton, { backgroundColor: theme.error }]}
            onPress={handleSOSPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.sosText, { color: theme.primaryBackground }]}>
              SOS
            </Text>
          </TouchableOpacity>
        </View>

        {activated && (
          <View
            style={[
              styles.safeWordContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.safeWordHeader}>
              <Ionicons name="call" size={20} color={theme.accentIcon} />
              <Text
                style={[styles.safeWordTitle, { color: theme.primaryText }]}
              >
                Press For Help!
              </Text>
            </View>

            {isLoading && <ActivityIndicator />}

            <View style={styles.warningContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.error} />
              <Text
                style={[styles.warningText, { color: theme.secondaryText }]}
              >
                When this button is pressed, a message containing your general
                details will be sent to the various security services.
              </Text>
            </View>
          </View>
        )}

        {activated && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Entypo name="cross" size={24} color={theme.error} />
            <Text style={[styles.cancelText, { color: theme.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  activatedText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  sosButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 250,
    width: 250,
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    position: "absolute", // ensure button sits on top of Lottie
  },
  sosText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  lottie: {
    width: 250,
    height: 250,
  },
  safeWordContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    marginTop: 40,
  },
  safeWordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  safeWordTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  safeWordBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  safeWordText: {
    fontSize: 14,
  },
  blueberryText: {
    fontWeight: "500",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default SOSScreen;
