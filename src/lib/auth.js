// lib/auth.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

// Email signup
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Email login
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google login
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Logout
export const logout = () => {
  return signOut(auth);
};
