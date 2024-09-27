// Import Firebase authentication functions
import {signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth } from './firebase-init.js';

const googleProvider = new GoogleAuthProvider();

// Handle form submission for sign-in
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent default form submission behavior

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    errorMessage.textContent = 'Please enter both email and password.';
    errorMessage.style.display = 'block';
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Successfully signed in
      const user = userCredential.user;
      console.log('User signed in:', user);
      
      window.location.href = 'index.html'; // Redirect after login
    })
    .catch((error) => {
      console.error('Error signing in:', error.message);
      errorMessage.textContent = getErrorMessage(error.code);
      errorMessage.style.display = 'block'; // Show error message
    });
});

// Handle sign-up button click
document.getElementById('signUpButton').addEventListener('click', (e) => {
  e.preventDefault(); // Prevent form submission if used within a form

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    errorMessage.textContent = 'Please enter both email and password.';
    errorMessage.style.display = 'block';
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Successfully signed up
      const user = userCredential.user;
      console.log("User signed up:", user);
      window.location.href = 'index.html'; // Redirect after sign-up
    })
    .catch((error) => {
      console.error("Error signing up:", error.message);
      errorMessage.textContent = getErrorMessage(error.code);
      errorMessage.style.display = 'block'; // Show error message
    });
});

// Handle sign-in button click
document.getElementById('signInButton').addEventListener('click', (e) => {
  e.preventDefault(); // Prevent form submission if used within a form

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    errorMessage.textContent = 'Please enter both email and password.';
    errorMessage.style.display = 'block';
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Successfully signed in
      const user = userCredential.user;
      console.log("User signed in:", user);
      window.location.href = 'index.html'; // Redirect after sign-in
    })
    .catch((error) => {
      console.error("Error signing in:", error.message);
      errorMessage.textContent = getErrorMessage(error.code);
      errorMessage.style.display = 'block'; // Show error message
    });
});

// Function to translate Firebase error codes to user-friendly messages
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'The email address is already in use by another account.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
    return 'Incorrect password or email.';
    default:
      return 'An error occurred. Please try again.';
  }
}

//Function for sign in with Google
document.getElementById('google-signin-button').addEventListener('click', (e) => {
  e.preventDefault(); // Prevent default form submission behavior

  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // Successfully signed in
      const user = result.user;
      console.log("User signed in with Google:", user);
      window.location.href = 'index.html'; // Redirect after sign-in
    })
    .catch((error) => {
      console.error("Error signing in with Google:", error.message);
      errorMessage.textContent = 'Error signing in with Google.';
      errorMessage.style.display = 'block'; // Show error message
    });
});
