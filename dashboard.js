import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = id => document.getElementById(id);
const msg = (t, ok) => { $("msg").textContent = t; $("msg").className = "msg " + (ok ? "ok" : "err"); };
let ref;

function fill(d) {
  $("hello").textContent = "Welcome, " + d.name;
  $("vEmail").textContent = d.email;
  $("vIgn").textContent = d.ign;
  $("vUid").textContent = d.ffUid;
  $("eIgn").value = d.ign;
  $("eUid").value = d.ffUid;
}

onAuthStateChanged(auth, async u => {
  if (!u) return location.replace("index.html");
  ref = doc(db, "users", u.uid);
  try {
    const s = await getDoc(ref);
    if (s.exists()) fill(s.data());
    else $("hello").textContent = "Profile nahi mila. Logout karke dobara sign up karo.";
  } catch (e) { $("hello").textContent = "Profile load nahi hua: " + (e.code || e.message); }
});

$("editForm").onsubmit = async e => {
  e.preventDefault(); msg("Saving...", true);
  try {
    await updateDoc(ref, { ign: $("eIgn").value.trim(), ffUid: $("eUid").value.trim() });
    fill((await getDoc(ref)).data()); msg("Saved.", true);
  } catch (err) { msg("Save nahi hua: " + (err.code || err.message)); }
};

$("logout").onclick = async () => { await signOut(auth); location.replace("index.html"); };
