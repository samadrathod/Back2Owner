import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Check if current user is admin
async function isAdmin(uid) {
    const adminDoc = await getDoc(doc(db, "admins", uid));
    return adminDoc.exists();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // If not admin, kick them out
    const admin = await isAdmin(user.uid);
    if (!admin) {
        alert("Access denied! Admins only.");
        window.location.href = "index.html";
        return;
    }

    loadAllItems();
});

async function loadAllItems() {
    const querySnapshot = await getDocs(collection(db, "foundItems"));
    const adminItemList = document.getElementById("adminItemList");
    adminItemList.innerHTML = "";

    if (querySnapshot.empty) {
        adminItemList.innerHTML = "<p class='text-muted text-center mt-md'>No items listed yet.</p>";
        return;
    }

    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const itemId = docSnap.id;

        adminItemList.innerHTML += `
            <div id="item-${itemId}" class="item-card fade-in">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width:100%;height:200px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--spacing-md);">` : ""}
                <h3>${item.name}</h3>
                <p><strong>Location:</strong> ${item.location}</p>
                <p>${item.description}</p>
                <p class="text-muted"><strong>Posted by:</strong> ${item.createdBy}</p>
                <span class="badge badge-available">${item.status}</span>
                <button class="btn btn-danger delete-btn mt-md" data-id="${itemId}">🗑 Delete Item</button>
            </div>
        `;
    });
}

// Delete any item as admin
document.getElementById("adminItemList").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;
        const confirmed = confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "foundItems", id));
            document.getElementById(`item-${id}`).remove();
            console.log("🗑 Admin deleted item:", id);
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