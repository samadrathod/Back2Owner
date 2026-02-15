import { auth,db } from "./firebase.js";
import { onAuthStateChanged } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection,addDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
//page protect ride=irect
onAuthStateChanged(auth,(user) =>{
    if(!user) {
        window.location.href="login.html";
    }
});
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
    try {
        await addDoc(collection(db,"foundItems"),
    {
        name: name,
        location: location,
        description: description,
        status: "Available",
        createdBy: user.uid,
        createdAt: new Date()
    });
    console.log("item added successfully");
    window.location.href="index.html";
} catch (error){
    console.log("Error adding item:",ErrorEvent.message);
    }
});