import { auth } from './firebase-init.js';  

// If any other page is loaded without authentication, the user is sent back to login/home
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'auth.html';
  }
});


// The user is signed out if the sign out button is clicked.
document.getElementById('sign-out-btn').addEventListener('click', () => {
  console.log("Sign out button clicked.");
  auth.signOut().then(() => {
    // Sign-out successful
    window.location.href = 'auth.html';
    console.log('Successfully signed out');
  }).catch((error) => {
    // An error happened
    console.error('Error signing out:', error);
  });
});