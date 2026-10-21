// Khởi tạo Firebase + Firestore (dùng bản ES module từ CDN, không cần bundler)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // TODO: dán apiKey thật từ Firebase Console > Project settings
  authDomain: "money-together-822bb.firebaseapp.com",
  projectId: "money-together-822bb",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, setDoc, onSnapshot };
export { app, firebaseConfig };
