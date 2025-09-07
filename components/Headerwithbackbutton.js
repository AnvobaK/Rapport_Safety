import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HeaderWithBack({
  title,
  onBackPress,
  showBackButton = true,
  rightComponent = null,
  titleStyle = {},
}) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleMenuPress = () => {
    navigation.navigate("settings");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContent}>
        {/* Left side - Back button */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#00BFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.centerSection}>
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
        </View>

        {/* Right side - Custom component or menu */}
        <View style={styles.rightSection}>
          {rightComponent || (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
            >
              <Ionicons name="menu" size={24} color="#00BFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  leftSection: {
    width: 44,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    width: 44,
    alignItems: "flex-end",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
