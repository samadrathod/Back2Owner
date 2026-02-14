import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});
import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const foundItemsRef = collection(db, "foundItems");
async function addSampleItem() {
    await addDoc(foundItemsRef, {
        name: "Vehicle Keys",
        location: "Classroom 204",
        description: "Black key with red keychain",
        status: "Available",
        createdAt: new Date()
    });
    console.log("✅ Sample item added to Firestore");
}
async function loadItems() {
    const querySnapshot = await getDocs(foundItemsRef);

    const itemList = document.getElementById("itemList");
    itemList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const item = doc.data();

        itemList.innerHTML += `
            <div style="background:white;padding:15px;margin-bottom:10px;border-radius:6px;">
                <h3>${item.name}</h3>
                <p><strong>Location:</strong> ${item.location}</p>
                <p>${item.description}</p>
                <p>Status: ${item.status}</p>
            </div>
        `;
    });

    console.log("📦 Items loaded from Firestore");
}
loadItems();
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
