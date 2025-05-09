import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDNTe-hBBitu_OgmM3qpufHMl--P0IZggc",
  authDomain: "auth-8484a.firebaseapp.com",
  databaseURL: "https://auth-8484a-default-rtdb.firebaseio.com/",
  projectId: "auth-8484a",
  storageBucket: "auth-8484a.firebasestorage.app",
  messagingSenderId: "971123960629",
  appId: "1:971123960629:web:3853b057b2fd2bffd5fa7c",
  measurementId: "G-MDLHMFXB7V"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = firestore; // Alias untuk kompatibilitas
const storage = getStorage(app);


// Collections
const usersCollection = collection(firestore, "users");
const otpCollection = collection(firestore, "otps");

export { 
  auth, 
  firestore,
  db, // Tambahkan ekspor ini
  usersCollection,
  otpCollection,
  storage
};