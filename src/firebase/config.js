import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBteM8Y_3qiCSS-YbuzQau1FDt3jATZ4y0",
  authDomain: "jaldrishti-bc3b9.firebaseapp.com",
  projectId: "jaldrishti-bc3b9",
  storageBucket: "jaldrishti-bc3b9.firebasestorage.app",
  messagingSenderId: "517642517748",
  appId: "1:517642517748:web:202d187508401a921832a1",
  measurementId: "G-ZM6FJBVQB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

