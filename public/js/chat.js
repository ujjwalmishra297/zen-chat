import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =============================
   GET RECEIVER
============================= */
const params = new URLSearchParams(window.location.search);
const receiverId = params.get("uid");

if (!receiverId) {
  alert("No user selected");
  window.location.href = "users.html";
}

const messagesBox = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const typingDiv = document.getElementById("typing");
const chatUsername = document.getElementById("chatUsername");
const statusText = document.getElementById("status");

let currentUser;
let chatId;
let typingTimer;

/* =============================
   AUTH STATE
============================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  chatId = [user.uid, receiverId].sort().join("_");

  // 🔥 Ensure chat document exists (IMPORTANT)
  await setDoc(
    doc(db, "chats", chatId),
    { createdAt: Date.now(), typing: null },
    { merge: true }
  );

  // Load receiver info
  const userSnap = await getDoc(doc(db, "users", receiverId));
  if (userSnap.exists()) {
    const u = userSnap.data();
    chatUsername.innerText = u.username || "User";
    statusText.innerText = u.online ? "Online" : "Offline";
  }

  loadMessages();
  listenTyping();
});

/* =============================
   LOAD MESSAGES (REAL-TIME)
============================= */
function loadMessages() {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("time", "asc")
  );

  onSnapshot(q, snapshot => {
    messagesBox.innerHTML = "";

    snapshot.forEach(docSnap => {
      const m = docSnap.data();
      if (!m.text) return;

      const div = document.createElement("div");
      div.className = `msg ${
        m.sender === currentUser.uid ? "me" : "them"
      }`;

      div.innerHTML = `
        <span>${m.text}</span>
        <small>${m.seen ? "✓✓" : "✓"}</small>
      `;

      messagesBox.appendChild(div);

      // Mark as seen when receiver opens chat
      if (m.sender !== currentUser.uid && !m.seen) {
        updateDoc(
          doc(db, "chats", chatId, "messages", docSnap.id),
          { seen: true }
        );
      }
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

/* =============================
   SEND MESSAGE
============================= */
window.sendMessage = async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text,
    sender: currentUser.uid,
    receiver: receiverId,
    time: Date.now(),       // 🔥 IMPORTANT (no serverTimestamp bug)
    seen: false
  });

  msgInput.value = "";
};

/* =============================
   TYPING INDICATOR
============================= */
msgInput.addEventListener("input", async () => {
  await updateDoc(doc(db, "chats", chatId), {
    typing: currentUser.uid
  });

  clearTimeout(typingTimer);
  typingTimer = setTimeout(async () => {
    await updateDoc(doc(db, "chats", chatId), {
      typing: null
    });
  }, 1200);
});

function listenTyping() {
  onSnapshot(doc(db, "chats", chatId), snap => {
    if (!snap.exists()) return;
    const typingUid = snap.data().typing;
    typingDiv.innerText =
      typingUid && typingUid !== currentUser.uid
        ? "Typing..."
        : "";
  });
}
