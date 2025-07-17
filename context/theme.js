export const lightTheme = {
  // Background colors
  primaryBackground: "#FFFFFF",
  secondaryBackground: "#F8F9FA",
  tertiaryBackground: "#E9ECEF",

  // Container backgrounds
  containerBackground: "#FFFFFF",
  cardBackground: "#F8F9FA",
  modalBackground: "#FFFFFF",

  // Text colors
  primaryText: "#1A1A1A",
  secondaryText: "#6C757D",
  tertiaryText: "#ADB5BD",
  accentText: "#00C6FF",

  // Border colors
  primaryBorder: "#E9ECEF",
  secondaryBorder: "#DEE2E6",

  // Status bar
  statusBarStyle: "dark-content",
  statusBarBackground: "#FFFFFF",

  // Switch colors
  switchTrackFalse: "#E9ECEF",
  switchTrackTrue: "#00C6FF",
  switchThumb: "#FFFFFF",

  // Icon colors
  primaryIcon: "#1A1A1A",
  secondaryIcon: "#6C757D",
  accentIcon: "#00C6FF",

  // Overlay colors
  overlayBackground: "rgba(0, 0, 0, 0.3)",

  // Shadow colors
  shadowColor: "#000000",
  shadowOpacity: 0.1,
  shadowRadius: 4,

  // Special colors
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#17A2B8",

  // Tab bar background
  tabBarBackground: "#F5F7FA", // light gray distinct from page background
};

export const darkTheme = {
  // Background colors
  primaryBackground: "#010F25",
  secondaryBackground: "#0F1B2F",
  tertiaryBackground: "#1E293B",

  // Container backgrounds
  containerBackground: "#010F25",
  cardBackground: "rgba(255, 255, 255, 0.05)",
  modalBackground: "#0F1B2F",

  // Text colors
  primaryText: "#FFFFFF",
  secondaryText: "#E2E8F0",
  tertiaryText: "#94A3B8",
  accentText: "#00C6FF",

  // Border colors
  primaryBorder: "#334155",
  secondaryBorder: "#475569",

  // Status bar
  statusBarStyle: "light-content",
  statusBarBackground: "#010F25",

  // Switch colors
  switchTrackFalse: "#2A3A4A",
  switchTrackTrue: "#00C6FF",
  switchThumb: "#FFFFFF",

  // Icon colors
  primaryIcon: "#FFFFFF",
  secondaryIcon: "#64748B",
  accentIcon: "#00C6FF",

  // Overlay colors
  overlayBackground: "rgba(0, 0, 0, 0.5)",

  // Shadow colors
  shadowColor: "#000000",
  shadowOpacity: 0.3,
  shadowRadius: 8,

  // Special colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Tab bar background
  tabBarBackground: "#00091A", // slightly darker than dashboard for dark mode
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};
