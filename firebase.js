import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBIEfpNQWrEmIJh3_1Y2id1Zkvxn1wQMI4",
  authDomain: "rapport-679d7.firebaseapp.com",
  projectId: "rapport-679d7",
  storageBucket: "rapport-679d7.firebasestorage.app",
  messagingSenderId: "648077179602",
  appId: "1:648077179602:web:d7df9e52fbdbca63cccb0b"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app); 