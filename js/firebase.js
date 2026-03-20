import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyDFa0obu1TgQMiNNdBhzjlo8qwifjcW3uo",
  authDomain: "back2owner-e182d.firebaseapp.com",
  projectId: "back2owner-e182d",
  storageBucket: "back2owner-e182d.firebasestorage.app",
  messagingSenderId: "700956458829",
  appId: "1:700956458829:web:ed595ffdb92f27c824c104"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };

console.log("🔥 Firebase connected successfully");
console.log("%c Back2Owner ", "background:#2E86FF;color:white;font-size:20px;font-weight:bold;border-radius:6px;padding:6px 12px;");
console.log("%c Built by Samad 👨‍💻 ", "color:#00C9A7;font-size:13px;");
console.log("%c Minor Project — 2025 ", "color:#5A6A8A;font-size:12px;");