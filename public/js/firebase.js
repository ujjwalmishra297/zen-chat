import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg2ccGIhWOsLIZrZl3S9k-KR9flnaus0Q",
  authDomain: "zen-chats.firebaseapp.com",
  projectId: "zen-chats",
  storageBucket: "zen-chats.firebasestorage.app",
  messagingSenderId: "1022694771398",
  appId: "1:1022694771398:web:dbb9653d6e1b9ee5c0e5c7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
