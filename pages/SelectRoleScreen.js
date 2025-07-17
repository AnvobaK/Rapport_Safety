import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SelectRoleScreen() {
  const navigation = useNavigation();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "lecturer",
      title: "Lecturer",
      image: require("../images/photo2-removebg-preview.png"),
    },
    {
      id: "student",
      title: "Student",
      image: require("../images/photo3-removebg-preview.png"),
    },
    {
      id: "ta",
      title: "Teaching Assistant",
      image: require("../images/photo4-removebg-preview.png"),
    },
    {
      id: "other",
      title: "Other",
      image: require("../images/photo1-removebg-preview.png"),
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleNext = () => {
    if (selectedRole) {
      navigation.navigate("SignUpForm");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressActive]}></View>
        <View style={styles.progressBar}></View>
        <View style={styles.progressBar}></View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Your Role? <Text style={styles.emoji}>👑</Text>
        </Text>
        <Text style={styles.subtitle}>
          Choose the role that best fits you. Rapport will {"\n"} adapt to your
          role.
        </Text>
      </View>

      {/* Role Selection Grid */}
      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.roleCardSelected,
            ]}
            onPress={() => handleRoleSelect(role.id)}
          >
            <View style={styles.avatarContainer}>
              <Image source={role.image} style={styles.avatar} />
            </View>
            <Text style={styles.roleTitle} numberOfLines={1}>
              {role.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedRole && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedRole}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    width: 60,
    backgroundColor: "#333",
    marginHorizontal: 4,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: "#00B4D8",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  emoji: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#adb5bd",
    lineHeight: 22,
    textAlign: "center",
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  roleCard: {
    flexBasis: "48%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  roleCardSelected: {
    borderWidth: 2,
    borderColor: "#00B4D8",
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#00B4D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  roleTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 150,
  },

  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#00B4D8",
    fontSize: 16,
    fontWeight: "bold",
  },
});
