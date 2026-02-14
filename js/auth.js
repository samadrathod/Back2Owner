import { auth } from "./firebase.js"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-js";
const from=
document.getElementById("authform");
from.addEventListener("submit",(e) =>{
    e.preventDefault();
    console.log("Form Submitted");
});