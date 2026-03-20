import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;

// Page protect + load items after auth is confirmed
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        currentUser = user;

        // Check if admin and show admin link
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
            document.getElementById("adminLink").style.display = "inline-block";
        }

        loadItems();
    }
});

async function loadItems() {
    // Query items sorted by newest first
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const itemList = document.getElementById("itemList");
    itemList.innerHTML = "";

    if (querySnapshot.empty) {
        itemList.innerHTML = "<p class='text-muted text-center mt-md'>No items listed yet.</p>";
        return;
    }
    // Auto delete claimed items after 5 hours
const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

for (const docSnap of querySnapshot.docs) {
    const item = docSnap.data();
    if (item.status === "Claimed" && item.claimedAt) {
        const claimedAt = item.claimedAt.toDate();
        if (claimedAt < fiveHoursAgo) {
            await deleteDoc(doc(db, "items", docSnap.id));
            console.log("🧹 Auto deleted claimed item:", docSnap.id);
        }
    }
}

    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const itemId = docSnap.id;

        // Location label differs too
        const location = item.type === "found"
            ? `<p><strong>Found at:</strong> ${item.location}</p>`
            : `<p><strong>Last seen:</strong> ${item.lastLocation}</p>`;

 const isOwner = item.type === "found"
    ? item.createdBy === currentUser.uid
    : item.reportedBy === currentUser.uid;

const deleteBtn = isOwner
    ? `<button class="btn btn-danger delete-btn mt-md" data-id="${itemId}">🗑 Delete</button>`
    : "";

// Claim button — only on found items, only for non-owners
const claimBtn = item.type === "found" && !isOwner && item.status !== "Claimed"
    ? `<a href="chat.html?itemId=${itemId}" class="btn btn-accent mt-md">🙋 This is Mine!</a>`
    : "";

// Claimed status override
const badge = item.status === "Claimed"
    ? `<span class="badge badge-claimed-status">✅ Claimed</span>`
    : item.type === "found"
        ? `<span class="badge badge-available">✅ Found</span>`
        : `<span class="badge badge-claimed">❗ Missing</span>`;
const openChatBtn = item.type === "found"
    && isOwner
    && item.status === "Pending"
    ? `<a href="chat.html?itemId=${itemId}" class="btn btn-primary mt-md">💬 Someone claims this!</a>`
    : "";

itemList.innerHTML += `
    <div id="item-${itemId}" class="item-card fade-in">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" 
        style="width:100%;height:200px;object-fit:cover;border-radius:var(--radius-md);
        margin-bottom:var(--spacing-md);cursor:pointer;" title="Click to view full image">` : ""}
        <h3>${item.name}</h3>
        ${location}
        <p>${item.description}</p>
        ${badge}
        <div class="flex gap-sm mt-md">
            ${openChatBtn}
            ${claimBtn}
            ${deleteBtn}
        </div>
    </div>
`;
    });
  }
    // Delete handler
document.getElementById("itemList").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;
        const confirmed = confirm("Are you sure you want to delete this?");
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "items", id));
            document.getElementById(`item-${id}`).remove();
            console.log("🗑 Item deleted:", id);
        } catch (error) {
            console.error("Error deleting item:", error.message);
            alert("Failed to delete. Please try again.");
        }
    }
});
// Lightbox
document.body.insertAdjacentHTML("beforeend", `
    <div class="lightbox" id="lightbox">
        <img id="lightboxImg" src="" alt="Full image">
    </div>
`);

document.getElementById("itemList").addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
        document.getElementById("lightboxImg").src = e.target.src;
        document.getElementById("lightbox").classList.add("active");
    }
});

document.getElementById("lightbox").addEventListener("click", () => {
    document.getElementById("lightbox").classList.remove("active");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});