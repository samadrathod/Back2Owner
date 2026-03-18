import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("registerForm");
const spinner = document.getElementById("spinner");
const registerBtn = document.getElementById("registerBtn");
const successText = document.getElementById("successText");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("errorText");

    // Clear previous error
    message.textContent = "";

    // Check passwords match BEFORE calling Firebase
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match";
        return;
    }

    // Check password length
    if (password.length < 6) {
        message.textContent = "Password must be at least 6 characters";
        return;
    }

    spinner.style.display = "inline-block";
    registerBtn.disabled = true;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        successText.style.display = "block";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            message.textContent = "An account with this email already exists";
        } else if (error.code === "auth/invalid-email") {
            message.textContent = "Please enter a valid email address";
        } else {
            message.textContent = "Something went wrong. Please try again";
        }
    } finally {
        spinner.style.display = "none";
        registerBtn.disabled = false;
    }
});

// Show/Hide password toggle
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁️";
    }
});