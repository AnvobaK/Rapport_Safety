import React, { createContext, useContext, useReducer } from "react";

const ChatsContext = createContext();

const initialState = {
  chats: [], // [{ id, contact, messages: [{id, text, sender, ...}], lastMessage, timestamp, unreadCount }]
};

function chatsReducer(state, action) {
  switch (action.type) {
    case "ADD_CHAT": {
      // Prevent duplicate chats by contact id
      const exists = state.chats.some(
        (chat) => chat.contact.id === action.payload.contact.id
      );
      if (exists) return state;
      return {
        ...state,
        chats: [
          {
            ...action.payload,
            messages: [],
            lastMessage: "New conversation started",
            timestamp: new Date().toISOString(),
            unreadCount: 0,
          },
          ...state.chats,
        ],
      };
    }
    case "ADD_MESSAGE": {
      const { contactId, message } = action.payload;
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat.contact.id === contactId) {
            const updatedMessages = [...(chat.messages || []), message];
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: message.text || message.media,
              timestamp: message.timestamp,
              unreadCount: chat.unreadCount,
            };
          }
          return chat;
        }),
      };
    }
    case "REMOVE_CHAT": {
      return {
        ...state,
        chats: state.chats.filter((chat) => chat.id !== action.payload),
      };
    }
    default:
      return state;
  }
}

export function ChatsProvider({ children }) {
  const [state, dispatch] = useReducer(chatsReducer, initialState);

  const addChat = (contact) => {
    dispatch({
      type: "ADD_CHAT",
      payload: { id: Date.now().toString(), contact },
    });
  };

  const addMessage = (contactId, message) => {
    dispatch({ type: "ADD_MESSAGE", payload: { contactId, message } });
  };

  const removeChat = (chatId) => {
    dispatch({ type: "REMOVE_CHAT", payload: chatId });
  };

  return (
    <ChatsContext.Provider
      value={{
        chats: state.chats,
        addChat,
        addMessage,
        removeChat,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}

export const useChats = () => useContext(ChatsContext);
