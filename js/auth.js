import { auth } from "./firebase.js"
import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("authform");
const spinner = document.getElementById("spinner");
const loginBtn = document.getElementById("loginBtn");
const successText = document.getElementById("successText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("errorText");

  // Clear previous error
  message.textContent = "";

  // Show loading spinner
  spinner.style.display = "inline-block";
  loginBtn.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful");

    // Show success message briefly before redirect
    successText.style.display = "block";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    console.error("Login error:", error.code);

    // Modern Firebase v9+ error code
    if (error.code === "auth/invalid-credential") {
      message.textContent = "Invalid email or password";
    }
    // Legacy Firebase error codes (fallback)
    else if (error.code === "auth/user-not-found") {
      message.textContent = "Invalid email or password";
    }
    else if (error.code === "auth/wrong-password") {
      message.textContent = "Invalid email or password";
    }
    else if (error.code === "auth/invalid-email") {
      message.textContent = "Please enter a valid email address";
    }
    else if (error.code === "auth/too-many-requests") {
      message.textContent = "Too many attempts. Please try again later";
    }
    else if (error.code === "auth/user-disabled") {
      message.textContent = "This account has been disabled";
    }
    else {
      message.textContent = "Something went wrong. Please try again";
    }

  } finally {
    // Always hide spinner and re-enable button
    spinner.style.display = "none";
    loginBtn.disabled = false;
  }
});