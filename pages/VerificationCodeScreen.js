import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function VerificationCodeScreen() {
  const navigation = useNavigation();
  const [code, setCode] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [email, setEmail] = useState("seni*******l@gmail.com");

  const handleKeyPress = (key) => {
    if (key === "delete") {
      // Handle delete key
      const newCode = [...code];
      if (newCode[activeIndex] !== "") {
        newCode[activeIndex] = "";
      } else if (activeIndex > 0) {
        newCode[activeIndex - 1] = "";
        setActiveIndex(activeIndex - 1);
      }
      setCode(newCode);
    } else {
      // Handle number key
      if (activeIndex < 4) {
        const newCode = [...code];
        newCode[activeIndex] = key;
        setCode(newCode);

        if (activeIndex < 3) {
          setActiveIndex(activeIndex + 1);
        }
      }
    }
  };

  const handleResendCode = () => {
    // Resend code logic would go here
    console.log("Resending code");
  };

  const handleResetPassword = () => {
    navigation.navigate("CreateNewPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enter your confirmation code</Text>
        <Text style={styles.headerSubtitle}>
          A 4-digit code was sent to {email}
        </Text>
      </View>

      {/* Code Input */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.codeBox,
              activeIndex === index && styles.activeCodeBox,
            ]}
          >
            <Text style={styles.codeText}>{digit}</Text>
            {activeIndex === index && <View style={styles.cursor} />}
          </View>
        ))}
      </View>

      {/* Resend Code Button */}
      <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
        <Text style={styles.resendButtonText}>Resend Code</Text>
      </TouchableOpacity>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
      >
        <Text style={styles.resetButtonText}>Reset Password</Text>
      </TouchableOpacity>

      {/* SMS Info */}
      <View style={styles.smsInfoContainer}>
        <Text style={styles.smsInfoText}>From Messages</Text>
        <Text style={styles.smsInfoCode}>4413</Text>
      </View>

      {/* Custom Keypad */}
      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("1")}
          >
            <Text style={styles.keypadButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("2")}
          >
            <Text style={styles.keypadButtonText}>2</Text>
            <Text style={styles.keypadSubText}>a b c</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("3")}
          >
            <Text style={styles.keypadButtonText}>3</Text>
            <Text style={styles.keypadSubText}>d e f</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("4")}
          >
            <Text style={styles.keypadButtonText}>4</Text>
            <Text style={styles.keypadSubText}>g h i</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("5")}
          >
            <Text style={styles.keypadButtonText}>5</Text>
            <Text style={styles.keypadSubText}>j k l</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("6")}
          >
            <Text style={styles.keypadButtonText}>6</Text>
            <Text style={styles.keypadSubText}>m n o</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("7")}
          >
            <Text style={styles.keypadButtonText}>7</Text>
            <Text style={styles.keypadSubText}>p q r s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("8")}
          >
            <Text style={styles.keypadButtonText}>8</Text>
            <Text style={styles.keypadSubText}>t u v</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("9")}
          >
            <Text style={styles.keypadButtonText}>9</Text>
            <Text style={styles.keypadSubText}>w x y z</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.keypadRow}>
          <View style={styles.emptyButton}></View>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("0")}
          >
            <Text style={styles.keypadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress("delete")}
          >
            <Text style={styles.keypadButtonText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicator}></View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const boxSize = (width - 80) / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001233",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#adb5bd",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  codeBox: {
    width: boxSize,
    height: boxSize,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  activeCodeBox: {
    borderColor: "#00B4D8",
    borderWidth: 2,
  },
  codeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 32,
    backgroundColor: "#00B4D8",
    opacity: 1,
  },
  resendButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  resendButtonText: {
    color: "#00B4D8",
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#000",
    borderRadius: 25,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  resetButtonText: {
    color: "#00B4D8",
    fontSize: 16,
    fontWeight: "bold",
  },
  smsInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  smsInfoText: {
    color: "#adb5bd",
    fontSize: 14,
  },
  smsInfoCode: {
    color: "#adb5bd",
    fontSize: 14,
  },
  keypadContainer: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  keypadButton: {
    width: (width - 60) / 3,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyButton: {
    width: (width - 60) / 3,
  },
  keypadButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "500",
  },
  keypadSubText: {
    color: "#adb5bd",
    fontSize: 12,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: "white",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 8,
  },
});
