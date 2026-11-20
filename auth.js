import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = id => document.getElementById(id);
const msg = (t, ok) => { $("msg").textContent = t; $("msg").className = "msg " + (ok ? "ok" : "err"); };
let busy = false;

const ERR = {
  "auth/invalid-credential": "Email ya password galat hai.",
  "auth/email-already-in-use": "Ye email pehle se registered hai. Login karo.",
  "auth/weak-password": "Password kam se kam 6 characters ka rakho.",
  "auth/invalid-email": "Email sahi format mein daalo.",
  "auth/too-many-requests": "Bahut attempts hue. Thodi der baad try karo.",
  "auth/network-request-failed": "Internet check karo.",
  "permission-denied": "Profile save nahi hua. Firestore rules check karo."
};
const why = e => ERR[e.code] || "Error: " + (e.code || e.message);

function show(login) {
  $("loginForm").classList.toggle("hide", !login);
  $("signupForm").classList.toggle("hide", login);
  $("tLogin").classList.toggle("on", login);
  $("tSignup").classList.toggle("on", !login);
  msg("");
}
$("tLogin").onclick = () => show(true);
$("tSignup").onclick = () => show(false);

onAuthStateChanged(auth, u => { if (u && !busy) location.replace("dashboard.html"); });

$("loginForm").onsubmit = async e => {
  e.preventDefault(); busy = true; msg("Login ho raha hai...", true);
  try {
    await signInWithEmailAndPassword(auth, $("lEmail").value.trim(), $("lPass").value);
    location.replace("dashboard.html");
  } catch (err) { busy = false; msg(why(err)); }
};

$("signupForm").onsubmit = async e => {
  e.preventDefault(); busy = true; msg("Account ban raha hai...", true);
  try {
    const c = await createUserWithEmailAndPassword(auth, $("sEmail").value.trim(), $("sPass").value);
    await setDoc(doc(db, "users", c.user.uid), {
      name: $("sName").value.trim(), ign: $("sIgn").value.trim(), ffUid: $("sUid").value.trim(),
      email: c.user.email, role: "player", createdAt: serverTimestamp()
    });
    location.replace("dashboard.html");
  } catch (err) { busy = false; msg(why(err)); }
};

$("forgot").onclick = async () => {
  const em = $("lEmail").value.trim();
  if (!em) return msg("Pehle upar email daalo.");
  try { await sendPasswordResetEmail(auth, em); msg("Reset link email pe bhej diya.", true); }
  catch (err) { msg(why(err)); }
};
