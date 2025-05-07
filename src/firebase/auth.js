import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const doSignOut = () => auth.signOut();

export const doPasswordReset = (email) => sendPasswordResetEmail(auth, email);

export const doPasswordChange = (password) =>
  updatePassword(auth.currentUser, password);

export const doSendEmailVerification = () =>
  sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });

export const updateUserProfile = async (name) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");

  await updateProfile(currentUser, { displayName: name });

  // Simpan juga ke Realtime Database
  const userRef = ref(db, `users/${currentUser.uid}`);
  await set(userRef, {
    name: name,
    email: currentUser.email,
  });
};
