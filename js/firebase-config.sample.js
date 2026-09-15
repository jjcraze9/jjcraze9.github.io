// Copy this file to "firebase-config.js" and fill in the values from your
// own Firebase project (Project settings → General → Your apps → SDK setup).
//
// These values are NOT secret — Firebase web config is meant to be public.
// Your data is protected by the Realtime Database security rules
// (see database.rules.json) plus requiring a signed-in staff account,
// not by hiding this file.

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "PASTE_YOUR_PROJECT",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
