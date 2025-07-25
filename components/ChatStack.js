import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import InitialChatScreen from "../pages/InitialChatScreen";
import ChatScreen from "../pages/ChatScreen";
import GroupChatScreen from "../pages/GroupChatScreen";

const Stack = createStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InitialChatScreen" component={InitialChatScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
    </Stack.Navigator>
  );
}
