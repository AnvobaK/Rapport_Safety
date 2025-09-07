import React, { createContext, useContext, useState } from "react";

const GlobalChatContext = createContext();

export const SYSTEM_USER_ID = "system";
export const SYSTEM_AVATAR = "https://i.pravatar.cc/100?img=12";

export function GlobalChatProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Welcome to the Global Chat!",
      userId: SYSTEM_USER_ID,
      isMe: false,
      type: "text",
      media: null,
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      text: "Hey everyone! How's everyone doing today?",
      userId: "user1@example.com",
      isMe: false,
      type: "text",
      media: null,
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    },
    {
      id: "3",
      text: "Just wanted to remind everyone about the safety meeting tomorrow at 2 PM",
      userId: "user2@example.com",
      isMe: false,
      type: "text",
      media: null,
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    },
    {
      id: "4",
      text: "Thanks for the reminder! I'll be there",
      userId: "user3@example.com",
      isMe: false,
      type: "text",
      media: null,
      timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    },
  ]);

  // Refactored: addMessage now takes userId
  const addMessage = (
    text,
    userId,
    isMe = false,
    type = "text",
    media = null
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        userId,
        isMe,
        type,
        media,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <GlobalChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </GlobalChatContext.Provider>
  );
}

export const useGlobalChat = () => useContext(GlobalChatContext);
