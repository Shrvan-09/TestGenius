import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKeSRlN1ynqVAcHFvLQulIbXvZ1379M8c",
  authDomain: "testgenius-auth.firebaseapp.com",
  projectId: "testgenius-auth",
  storageBucket: "testgenius-auth.firebasestorage.app",
  messagingSenderId: "1003422488924",
  appId: "1:1003422488924:web:d802bf83a6399a850d0999",
  measurementId: "G-E4SWWH8CFM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);