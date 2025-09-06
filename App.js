import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "./context/userContext";
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import IntroScreen from "./pages/Introscreen";
import ForgotPasswordEmailScreen from "./pages/ForgetPasswordEmailScreen";
import ForgotPasswordPhoneScreen from "./pages/ForgotPasswordPhoneScreen";
import CreateNewPasswordScreen from "./pages/PasswordReset";
import VerificationCodeScreen from "./pages/VerificationCodeScreen";
import SelectRoleScreen from "./pages/SelectRoleScreen";
import SignUpFormScreen from "./pages/SignUpFormScreen";
import SignUpProfileScreen from "./pages/SignUpProfileScreen";
import NotificationsScreen from "./pages/Notification-Empty";
import Notifications from "./pages/Notifications";
import VoiceRecorderScreen from "./pages/Record";
import ReportWriterPage from "./pages/ReportPage";
import SOSButton from "./pages/SOSPage";
import SettingsScreen from "./pages/Profile-Extended";
import EditProfileScreen from "./pages/EditProfile";
import TermsConditionsPage from "./pages/TermsandConditions";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import FAQScreen from "./pages/HelpandSupport";
import CommunityRulesScreen from "./pages/CommunityRulesScreen";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ContactsScreen from "./pages/ContactPage";
import InitialChatScreen from "./pages/InitialChatScreen";
import ChatScreen from "./pages/ChatScreen";
import MainTabNavigator from "./components/MainTabNavigator";
import { ChatsProvider } from "./context/ChatsContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import GlobalChatScreen from "./pages/GlobalChatScreen";
import { GlobalChatProvider } from "./context/GlobalChatContext";
import CreateGroupScreen from "./pages/CreateGroupScreen";
import { GroupsProvider } from "./context/GroupsContext";
import GroupChatScreen from "./pages/GroupChatScreen";
import CommunitySettingsScreen from "./pages/CommunitySettings";
import SOSActiveScreen from "./pages/SOSactive";

const Stack = createNativeStackNavigator();

function RootStack() {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(null);

  useEffect(() => {
    const checkFirstTime = async () => {
      const hasSeenRules = await AsyncStorage.getItem("hasSeenCommunityRules");
      setIsFirstTimeUser(!hasSeenRules);
    };
    checkFirstTime();
  }, []);

  if (isFirstTimeUser === null) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isFirstTimeUser ? "Splash" : "MainTabNavigator"}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LogIn" component={LoginScreen} />
      <Stack.Screen name="PasswordReset" component={CreateNewPasswordScreen} />
      <Stack.Screen name="VerifyCode" component={VerificationCodeScreen} />
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      <Stack.Screen name="SignUpForm" component={SignUpFormScreen} />
      <Stack.Screen name="SignUpProfile" component={SignUpProfileScreen} />
      <Stack.Screen name="SOSActive" component={SOSActiveScreen} />

      <Stack.Screen
        name="CommunitySettings"
        component={CommunitySettingsScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationsScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Recording"
        component={VoiceRecorderScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="ReportPage"
        component={ReportWriterPage}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="sos" component={SOSButton} />
      <Stack.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="editprofile"
        component={EditProfileScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="terms"
        component={TermsConditionsPage}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="privacy"
        component={PrivacyPolicyPage}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="helpandsupport"
        component={FAQScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactsScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="CommunityRules"
        component={CommunityRulesScreen}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Notificationswithmessages"
        component={Notifications}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />

      <Stack.Screen
        name="ForgotPasswordEmail"
        component={ForgotPasswordEmailScreen}
      />
      <Stack.Screen
        name="ForgotPasswordPhone"
        component={ForgotPasswordPhoneScreen}
      />
      <Stack.Screen name="InitialChatScreen" component={InitialChatScreen} />
      <Stack.Screen name="GlobalChatScreen" component={GlobalChatScreen} />
      <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
      <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GroupsProvider>
      <UserPreferencesProvider>
        <ChatsProvider>
          <GlobalChatProvider>
            <UserProvider>
              <SafeAreaProvider style={styles.container}>
                <NavigationContainer>
                  <RootStack />
                </NavigationContainer>
              </SafeAreaProvider>
            </UserProvider>
          </GlobalChatProvider>
        </ChatsProvider>
      </UserPreferencesProvider>
    </GroupsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none",
  },
});
