// userContext.js
import React, { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);

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

  return (
    <UserContext.Provider
      value={{
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
