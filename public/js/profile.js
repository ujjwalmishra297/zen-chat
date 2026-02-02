import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("profileForm");
const logoutBtn = document.getElementById("logoutBtn");
const avatarText = document.getElementById("avatarText");

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    username.value = data.username || "";
    email.value = data.email || user.email;
    mobile.value = data.mobile || "";
    age.value = data.age || "";
    gender.value = data.gender || "";

    avatarText.innerText = (data.username || "U")[0].toUpperCase();
  }
});

form.onsubmit = async e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "users", user.uid), {
    username: username.value,
    mobile: mobile.value,
    age: age.value,
    gender: gender.value,
    updatedAt: serverTimestamp()
  });

  alert("Profile updated successfully");
};

logoutBtn.onclick = async () => {
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });

  await auth.signOut();
  window.location.href = "index.html";
};
