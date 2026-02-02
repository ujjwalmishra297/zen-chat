import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   SIGNUP
================================ */
export async function signup(email, password, username) {
  try {
    if (!email || !password || !username) {
      alert("All fields are required");
      return;
    }

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      username,
      email,
      online: true,
      lastSeen: null,
      createdAt: serverTimestamp()
    });

    window.location.href = "users.html";
  } catch (error) {
    alert(error.message);
  }
}

/* ===============================
   LOGIN
================================ */
export async function login(email, password) {
  try {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateDoc(doc(db, "users", result.user.uid), {
      online: true
    });

    window.location.href = "users.html";
  } catch (error) {
    alert(error.message);
  }
}

/* ===============================
   AUTH STATE LISTENER
================================ */
onAuthStateChanged(auth, async user => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      online: true,
      createdAt: serverTimestamp()
    });
  }
});

/* ===============================
   LOGOUT (USE LATER)
================================ */
export async function logout() {
  if (!auth.currentUser) return;

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });

  await auth.signOut();
  window.location.href = "index.html";
}
