import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const adminItemList = document.getElementById("adminItemList");
    adminItemList.innerHTML = "";

    if (querySnapshot.empty) {
        adminItemList.innerHTML = "<p class='text-muted text-center mt-md'>No items listed yet.</p>";
        return;
    }

    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const itemId = docSnap.id;

        // Different badge for found vs lost
        const badge = item.type === "found"
            ? `<span class="badge badge-available">✅ Found</span>`
            : `<span class="badge badge-claimed">❗ Missing</span>`;

        // Location label differs
        const location = item.type === "found"
            ? `<p><strong>Found at:</strong> ${item.location}</p>`
            : `<p><strong>Last seen:</strong> ${item.lastLocation}</p>`;

        // Posted by — differs for found vs lost
        const postedBy = item.type === "found"
            ? item.createdBy
            : item.reportedBy;

        adminItemList.innerHTML += `
            <div id="item-${itemId}" class="item-card fade-in">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" 
                style="width:100%;height:200px;object-fit:cover;border-radius:var(--radius-md);
                margin-bottom:var(--spacing-md);">` : ""}
                <h3>${item.name}</h3>
                ${location}
                <p>${item.description}</p>
                <p class="text-muted"><strong>Posted by:</strong> ${postedBy}</p>
                ${badge}
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
            await deleteDoc(doc(db, "items", id));
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