// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAM90-CZK-hZk_nFq_eW1SCf45v00qnNMU",
  authDomain: "prepwise-b2578.firebaseapp.com",
  projectId: "prepwise-b2578",
  storageBucket: "prepwise-b2578.firebasestorage.app",
  messagingSenderId: "1087263142407",
  appId: "1:1087263142407:web:bc6886e6017aaf82bd70a2",
  measurementId: "G-RQP3Y6JZ8V"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


export const auth = getAuth(app);
export const db = getFirestore(app);