// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkRJGjwVTLR0BKsVx6bVVJmqCEPL5p3X0",
  authDomain: "yt-transcript-demo-2025.firebaseapp.com",
  projectId: "yt-transcript-demo-2025",
  storageBucket: "yt-transcript-demo-2025.appspot.com",
  messagingSenderId: "72885249208",
  appId: "1:72885249208:web:8b5c4d3e2f1a0b9c8d7e6f5"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Enable anonymous authentication
auth.signInAnonymously().catch(function(error) {
  console.error('Anonymous auth error:', error);
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
