// userContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);

  // Load userId from storage when the app starts
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to load userId', error);
      }
    };
    loadUserId();
  }, []);

  useEffect(async () => {
    try {
      const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          "userId": userId
        })
      }
      const response = await fetch(
        `https://rapport-backend.onrender.com/auth/single`,
        requestOptions
      );
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [userId]);

  // Add all profile data to context
  const [profileData, setProfileData] = useState({
    firstName: "Seline",
    lastName: "Niel",
    email: "selineniel@gmail.com",
    birthDate: "",
    phone: "463252653",
    address: "St. Theresas Hostel",
    institution: "College of Science",
    indexNumber: "352434",
  });

  // Function to update profile data
  const updateProfileData = (newData) => {
    setProfileData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  // Function to update individual field
  const updateProfileField = (field, value) => {
    setProfileData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Function to set and store the user ID
  const setAndStoreUserId = async (id) => {
    try {
      setUserId(id);
      await AsyncStorage.setItem('userId', id);
    } catch (error) {
      console.error('Failed to save userId', error);
    }
  };

  // Function to clear user ID on logout
  const clearUserId = async () => {
    try {
      setUserId(null);
      await AsyncStorage.removeItem('userId');
    } catch (error) {
      console.error('Failed to clear userId', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId: setAndStoreUserId,
        clearUserId,
        profileImage,
        setProfileImage,
        profileData,
        setProfileData,
        updateProfileData,
        updateProfileField,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export { UserContext };
