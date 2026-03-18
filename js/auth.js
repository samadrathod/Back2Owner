import { auth } from "./firebase.js"
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
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
// Show/Hide password toggle
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    // Check current type and switch it
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈"; // hide icon
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁️"; // show icon
    }
});
// Forgot Password
const forgotLink = document.querySelector(".login-links a:first-child");

forgotLink.addEventListener("click", async (e) => {
    e.preventDefault(); // stop the # from jumping

    const email = prompt("Enter your email to reset your password:");
    if (!email) return; // user cancelled

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            alert("No account found with that email.");
        } else if (error.code === "auth/invalid-email") {
            alert("Please enter a valid email address.");
        } else {
            alert("Something went wrong. Please try again.");
        }
    }
});
// Google Login
const googleBtn = document.querySelector(".google-btn");
const provider = new GoogleAuthProvider();

googleBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Google login error:", error.code);
        const message = document.getElementById("errorText");
        if (error.code === "auth/popup-closed-by-user") {
            message.textContent = "Login cancelled. Please try again.";
        } else {
            message.textContent = "Google login failed. Please try again.";
        }
    }
});