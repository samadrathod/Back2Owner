import { auth } from "./firebase.js"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
const form=
document.getElementById("authform");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("Account created");
    window.location.href = "index.html";
  } catch (err) {
    console.log(err.message);
  }
});