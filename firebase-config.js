// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCceHAg85kW2w7PPI-2Otx21wfo_TgSIyg",
  authDomain: "yt-transcript-demo-2025.firebaseapp.com",
  projectId: "yt-transcript-demo-2025",
  storageBucket: "yt-transcript-demo-2025.appspot.com",
  messagingSenderId: "72885249208",
  appId: "1:72885249208:web:2c1c9f0d8f3c4e5f6g7h8i"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Enable anonymous authentication (optional - will fail if not configured)
auth.signInAnonymously().catch(function(error) {
  console.warn('Anonymous auth not enabled:', error.message);
  console.warn('Please enable Anonymous authentication in Firebase Console');
  console.warn('See FIREBASE_SETUP.md for instructions');
});

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user.uid);
    // Store user info globally
    window.currentUser = user;
  } else {
    console.log('User signed out');
    window.currentUser = null;
  }
});
