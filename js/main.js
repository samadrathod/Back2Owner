import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const foundItemsRef = collection(db, "foundItems");
let currentUser = null;

// Page protect + load items after auth is confirmed
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
    loadItems();
  }
});

async function loadItems() {
  const querySnapshot = await getDocs(foundItemsRef);
  const itemList = document.getElementById("itemList");
  itemList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const item = docSnap.data();
    const itemId = docSnap.id;

    // Only show delete button if this item belongs to the logged-in user
    const deleteBtn = item.createdBy === currentUser.uid
      ? `<button class="delete-btn" data-id="${itemId}" style="
            margin-top:8px;
            background:#ff4d4d;
            color:white;
            border:none;
            padding:6px 14px;
            border-radius:6px;
            cursor:pointer;
            font-size:14px;">
            🗑 Delete
         </button>`
      : "";

    itemList.innerHTML += `
      <div id="item-${itemId}" style="background:white;padding:15px;margin-bottom:10px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <h3>${item.name}</h3>
        <p><strong>Location:</strong> ${item.location}</p>
        <p>${item.description}</p>
        <p>Status: ${item.status}</p>
        ${deleteBtn}
      </div>
    `;
  });

  console.log("📦 Items loaded from Firestore");
}

// Delete handler using event delegation
document.getElementById("itemList").addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "foundItems", id));
      document.getElementById(`item-${id}`).remove(); // remove from UI instantly
      console.log("🗑 Item deleted:", id);
    } catch (error) {
      console.error("Error deleting item:", error.message);
      alert("Failed to delete item. Please try again.");
    }
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});