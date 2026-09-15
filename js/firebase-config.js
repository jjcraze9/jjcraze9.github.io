// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0jumPEEvj--x_uWvn_Z1zDjs95XVy6KM",
  authDomain: "preschool-pickup.firebaseapp.com",
  databaseURL: "https://preschool-pickup-default-rtdb.firebaseio.com",
  projectId: "preschool-pickup",
  storageBucket: "preschool-pickup.firebasestorage.app",
  messagingSenderId: "409969675462",
  appId: "1:409969675462:web:7fed9d70daebef7afe1bc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);