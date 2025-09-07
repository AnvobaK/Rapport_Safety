import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
} from "react-native";
import { getTheme } from "../context/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// Import your main screens
import ChatStack from "./ChatStack";
import SOSPage from "../pages/SOSPage";
import Dashboard from "../pages/Dashboard";
import CommunityPage from "../pages/CommunityPage";
import LocationScreen from "../pages/LocationScreen";
import CommunityRulesScreen from "../pages/CommunityRulesScreen";

const Tab = createBottomTabNavigator();
const { width: screenWidth } = Dimensions.get("window");

// Community Wrapper Component
function CommunityWrapper({ navigation, route }) {
  const { hasAgreedToCommunityRules, isLoading } = useUserPreferences();

  React.useEffect(() => {
    if (!isLoading && !hasAgreedToCommunityRules) {
      navigation.navigate("CommunityRulesScreen");
    }
  }, [hasAgreedToCommunityRules, isLoading, navigation]);

  if (isLoading) {
    return null; // or a loading screen
  }

  if (!hasAgreedToCommunityRules) {
    return <CommunityRulesScreen navigation={navigation} route={route} />;
  }

  return <CommunityPage navigation={navigation} route={route} />;
}

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useUserPreferences();
  const theme = getTheme(isDarkMode);

  const animatedValues = React.useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const opacityValues = React.useRef(
    state.routes.map(() => new Animated.Value(0.7))
  ).current;

  // Animate tab when focused
  const animateTab = (index) => {
    // Reset all animations
    animatedValues.forEach((anim, i) => {
      Animated.parallel([
        Animated.spring(anim, {
          toValue: i === index ? 1.3 : 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
        Animated.timing(opacityValues[i], {
          toValue: i === index ? 1 : 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Animate on tab change
  React.useEffect(() => {
    animateTab(state.index);
  }, [state.index]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: theme.tabBarBackground,
        },
      ]}
    >
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Enhanced tab press animation
              Animated.sequence([
                Animated.parallel([
                  Animated.timing(animatedValues[index], {
                    toValue: 0.7,
                    duration: 80,
                    useNativeDriver: true,
                  }),
                  Animated.timing(opacityValues[index], {
                    toValue: 0.5,
                    duration: 80,
                    useNativeDriver: true,
                  }),
                ]),
                Animated.parallel([
                  Animated.spring(animatedValues[index], {
                    toValue: 1.3,
                    useNativeDriver: true,
                    tension: 120,
                    friction: 7,
                  }),
                  Animated.timing(opacityValues[index], {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                ]),
              ]).start();

              navigation.navigate(route.name);
            }
          };

          // Special handling for SOS button
          if (route.name === "SOS") {
            return (
              <Animated.View
                key={route.key}
                style={[
                  styles.sosButton,
                  {
                    transform: [{ scale: animatedValues[index] }],
                    opacity: opacityValues[index],
                    backgroundColor: "#F23F42",
                    shadowColor: theme.error,
                  },
                ]}
              >
                <View
                  style={{
                    backgroundColor: "",
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={styles.sosTouchable}
                    onPress={onPress}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sosText,
                        { color: theme.primaryBackground },
                      ]}
                    >
                      SOS
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          }

          // Regular tab buttons
          return (
            <Animated.View
              key={route.key}
              style={[
                styles.tab,
                {
                  transform: [{ scale: animatedValues[index] }],
                  opacity: opacityValues[index],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.tabTouchable}
                onPress={onPress}
                activeOpacity={0.8}
              >
                {options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? theme.accentText : theme.secondaryIcon,
                  size: 24,
                })}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// Custom Screen Transition Component
function AnimatedScreen({ children, isFocused }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(screenWidth)).current;

  React.useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenWidth * 0.1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function MainTabNavigator({ route }) {
  // Get the initial tab from route params, default to Dashboard
  const initialTab = route?.params?.initialTab || "Dashboard";

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide default tab bar
        // Enhanced screen transitions
        animationEnabled: true,
        animationTypeForReplace: "push",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        // Custom screen transition
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
      initialRouteName={initialTab}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="view-grid"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Location"
        component={LocationScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SOSPage}
        options={{
          tabBarIcon: ({ focused, color, size }) => null, // SOS button is handled separately
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityWrapper}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Feather name="message-square" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    flex: 1,
  },
  tabTouchable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  sosButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  sosTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
  },
  sosText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
