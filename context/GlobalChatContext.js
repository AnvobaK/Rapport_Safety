import { createContext, useContext, useState } from "react";

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
  ]);

  // Refactored: addMessage to now take a userId
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
