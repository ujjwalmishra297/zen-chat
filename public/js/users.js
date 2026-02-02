import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const usersList = document.getElementById("usersList");

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  onSnapshot(collection(db, "users"), snapshot => {
    usersList.innerHTML = "";

    snapshot.forEach(docSnap => {
      const u = docSnap.data();

      if (u.uid === user.uid) return;

      const div = document.createElement("div");
      div.className = "user-card";

      div.innerHTML = `
        <div class="user-name">${u.username || "User"}</div>
        <div class="status ${u.online ? "online" : "offline"}">
          ${u.online ? "● Online" : "● Offline"}
        </div>
      `;

      div.onclick = () => {
        window.location.href = `chat.html?uid=${u.uid}`;
      };

      usersList.appendChild(div);
    });
  });
});
