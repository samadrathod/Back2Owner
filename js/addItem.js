import { auth,db } from "./firebase.js";
import { onAuthStateChanged } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection,addDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const CLOUDINARY_CLOUD_NAME = "deadwnnmc";
const CLOUDINARY_UPLOAD_PRESET = "back2owner_preset";
//page protect redirect
onAuthStateChanged(auth,(user) =>{
    if(!user) {
        window.location.href="login.html";
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
    return data.secure_url; // ← this is the image URL we save to Firestore
}

const form =
document.getElementById("addItemForm");
form.addEventListener("submit",async (e) =>{
    e.preventDefault();
    const user = auth.currentUser;
    const name=
    document.getElementById("itemName").value;
    const location=
    document.getElementById("itemLocation").value;
    const description=
    document.getElementById("itemDescription").value;
    const imageFile = 
    document.getElementById("itemImage").files[0];
    try {
         let imageUrl = "";
        if (imageFile) {
            imageUrl = await uploadImageToCloudinary(imageFile);
        }
     await addDoc(collection(db, "items"), {
        type: "found",
        name: name,
        location: location,
        description: description,
        imageUrl: imageUrl,
        status: "Available",
        createdBy: user.uid,
        createdAt: new Date()
    });
    console.log("item added successfully");
    window.location.href="index.html";
} catch (error){
    console.log("Error adding item:",error.message);
    }
});