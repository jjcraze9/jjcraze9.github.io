// Firebase config for the "preschool-pickup" project.
// Uses the compat/global SDK (loaded via <script> tags in each HTML file),
// NOT the newer "import" style — that only works with a build tool.

const firebaseConfig = {
  apiKey: "AIzaSyB0jumPEEvj--x_uWvn_Z1zDjs95XVy6KM",
  authDomain: "preschool-pickup.firebaseapp.com",
  databaseURL: "https://preschool-pickup-default-rtdb.firebaseio.com",
  projectId: "preschool-pickup",
  storageBucket: "preschool-pickup.firebasestorage.app",
  messagingSenderId: "409969675462",
  appId: "1:409969675462:web:7fed9d70daebef7afe1bc7"
};

firebase.initializeApp(firebaseConfig);
