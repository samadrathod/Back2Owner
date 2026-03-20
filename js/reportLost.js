import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const CLOUDINARY_CLOUD_NAME = "deadwnnmc";
const CLOUDINARY_UPLOAD_PRESET = "back2owner_preset";

// Page protect redirect
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const data = await response.json();
    return data.secure_url;
}

const form = document.getElementById("lostForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    const name = document.getElementById("itemName").value;
    const lastLocation = document.getElementById("lastLocation").value;
    const description = document.getElementById("itemDescription").value;
    const imageFile = document.getElementById("itemImage").files[0];

    try {
        let imageUrl = "";
        if (imageFile) {
            imageUrl = await uploadImageToCloudinary(imageFile);
        }

        await addDoc(collection(db, "items"), {
            type: "lost",
            name: name,
            lastLocation: lastLocation,
            description: description,
            imageUrl: imageUrl,
            status: "Missing",
            reportedBy: user.uid,
            createdAt: new Date()
        });

        console.log("Lost report submitted!");
        window.location.href = "index.html";

    } catch (error) {
        console.log("Error submitting report:", error.message);
    }
});