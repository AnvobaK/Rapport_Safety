import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserPreferencesContext = createContext();

export function UserPreferencesProvider({ children }) {
  const [hasAgreedToCommunityRules, setHasAgreedToCommunityRules] =
    useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const [hasAgreed, darkMode] = await Promise.all([
        AsyncStorage.getItem("hasAgreedToCommunityRules"),
        AsyncStorage.getItem("isDarkMode"),
      ]);

      setHasAgreedToCommunityRules(hasAgreed === "true");
      setIsDarkMode(darkMode !== "false"); // Default to true (dark mode) if not set
    } catch (error) {
      console.error("Error loading user preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAgreedToCommunityRules = async (agreed) => {
    try {
      await AsyncStorage.setItem(
        "hasAgreedToCommunityRules",
        agreed.toString()
      );
      setHasAgreedToCommunityRules(agreed);
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  };

  const setDarkMode = async (isDark) => {
    try {
      await AsyncStorage.setItem("isDarkMode", isDark.toString());
      setIsDarkMode(isDark);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const resetCommunityRulesAgreement = async () => {
    try {
      await AsyncStorage.removeItem("hasAgreedToCommunityRules");
      setHasAgreedToCommunityRules(false);
    } catch (error) {
      console.error("Error resetting community rules agreement:", error);
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        hasAgreedToCommunityRules,
        setAgreedToCommunityRules,
        resetCommunityRulesAgreement,
        isDarkMode,
        setDarkMode,
        isLoading,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export const useUserPreferences = () => useContext(UserPreferencesContext);
