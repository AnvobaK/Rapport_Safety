import React, { createContext, useContext, useState } from "react";

const GroupsContext = createContext();

export const GroupsProvider = ({ children }) => {
  const [groups, setGroups] = useState([]); // [{id, name, members, messages: [{id, sender, text, timestamp}]}]

  // Add a new group
  const addGroup = (name, members) => {
    const newGroup = {
      id: Date.now().toString(),
      name,
      members,
      messages: [],
    };
    setGroups((prev) => [...prev, newGroup]);
    return newGroup.id;
  };

  // Send a message to a group
  const sendMessage = (groupId, sender, text) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              messages: [
                ...group.messages,
                {
                  id: Date.now().toString(),
                  sender,
                  text,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : group
      )
    );
  };

  // Get group by id
  const getGroup = (groupId) => groups.find((g) => g.id === groupId);

  return (
    <GroupsContext.Provider
      value={{ groups, setGroups, addGroup, sendMessage, getGroup }}
    >
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => useContext(GroupsContext);
