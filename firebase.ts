
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsr8UPeEzgizPUJA1qlHTun7FkQxubab4",
  authDomain: "member-gmrj-d16ed.firebaseapp.com",
  projectId: "member-gmrj-d16ed",
  storageBucket: "member-gmrj-d16ed.firebasestorage.app",
  messagingSenderId: "1015827973896",
  appId: "1:1015827973896:web:679d617a0d3eac5d1e8ebd",
  measurementId: "G-PH38L09S9C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
