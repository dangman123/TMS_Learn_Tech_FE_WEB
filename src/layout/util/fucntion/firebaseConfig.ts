import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getDatabase, ref, set, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyABNKBYnbimmbOvVRTWSZZIXqBFHmlEjvI",
  authDomain: "learn-with-tms-4cc08.firebaseapp.com",
  databaseURL: "https://learn-with-tms-4cc08-default-rtdb.firebaseio.com",
  projectId: "learn-with-tms-4cc08",
  storageBucket: "learn-with-tms-4cc08.appspot.com",
  messagingSenderId: "628515130275",
  appId: "1:628515130275:web:c02e3c11995ff27b6d2816",
  measurementId: "G-NP75XHWQMC",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
