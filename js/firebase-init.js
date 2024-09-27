// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-FMunM1_Ldj79m04zTEaeIduRsZBibvU",
  authDomain: "carbontracker-c35fd.firebaseapp.com",
  projectId: "carbontracker-c35fd",
  storageBucket: "carbontracker-c35fd.appspot.com",
  messagingSenderId: "13358443164",
  appId: "1:13358443164:web:12c538bf4a059eeb141b59"
};

// initialize the things needed for the rest of the app, including app, auth, db, exports then to other scripts
// exporting and importing javascript requires SCRIPT type=module to work.

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };