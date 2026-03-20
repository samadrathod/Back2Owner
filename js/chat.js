import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc, getDoc, addDoc, deleteDoc,
    collection, onSnapshot,
    orderBy, query, updateDoc,
    serverTimestamp, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Get itemId from URL
// URL will be: chat.html?itemId=abc123
const params = new URLSearchParams(window.location.search);
const itemId = params.get("itemId");

let currentUser = null;
let itemData = null;

// Page protect
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    await initChat();
});

async function initChat() {
    if (!itemId) {
        window.location.href = "index.html";
        return;
    }

    // Get item data
    const itemDoc = await getDoc(doc(db, "items", itemId));
    if (!itemDoc.exists()) {
        alert("Item not found!");
        window.location.href = "index.html";
        return;
    }

    itemData = itemDoc.data();

    // Check if chat has expired (24 hours)
    const chatDoc = await getDoc(doc(db, "chats", itemId));
    if (chatDoc.exists()) {
        const chatCreatedAt = chatDoc.data().createdAt?.toDate();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (chatCreatedAt && chatCreatedAt < twentyFourHoursAgo) {
            await deleteEntireChat();
            alert("This chat has expired after 24 hours.");
            window.location.href = "index.html";
            return;
        }

        // Show expiry time
        if (chatCreatedAt) {
            const expiresAt = new Date(chatCreatedAt.getTime() + 24 * 60 * 60 * 1000);
            const hoursLeft = Math.round((expiresAt - new Date()) / (1000 * 60 * 60));
            document.getElementById("expiryNotice").textContent =
                `⏱ This chat expires in ${hoursLeft} hour(s)`;
        }
    } else {
        // Create chat if it doesn't exist yet
        await updateDoc(doc(db, "items", itemId), {
            claimedBy: currentUser.uid,
            status: "Pending"
        });

        await addDoc(collection(db, "chats"), {});
        // Use itemId as document ID
        const chatRef = doc(db, "chats", itemId);
        await updateDoc(chatRef, {
            itemId: itemId,
            itemName: itemData.name,
            finderId: itemData.createdBy,
            claimerId: currentUser.uid,
            createdAt: serverTimestamp()
        }).catch(async () => {
            // If doc doesn't exist yet, set it
            const { setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            await setDoc(chatRef, {
                itemId: itemId,
                itemName: itemData.name,
                finderId: itemData.createdBy,
                claimerId: currentUser.uid,
                createdAt: serverTimestamp()
            });
        });
    }

    // Update UI
    document.getElementById("chatItemName").textContent = `Chat — ${itemData.name}`;

    // Show "Mark as Claimed" button only to finder
    if (currentUser.uid === itemData.createdBy) {
        document.getElementById("markClaimedBtn").style.display = "inline-block";
        document.getElementById("chatSubtitle").textContent =
            "Someone wants to claim this item. Verify their identity!";
    } else {
        document.getElementById("chatSubtitle").textContent =
            "Prove to the finder that this item belongs to you!";
    }

    // Load messages in real time
    loadMessages();
}

function loadMessages() {
    const messagesRef = collection(db, "chats", itemId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    onSnapshot(q, async (snapshot) => {
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";

        if (snapshot.empty) {
            chatMessages.innerHTML = "<p class='text-muted text-center'>No messages yet. Say hello! 👋</p>";
            return;
        }

        for (const docSnap of snapshot.docs) {
            const msg = docSnap.data();

            // Auto delete messages older than 24 hours
            if (msg.createdAt && msg.createdAt.toDate() < twentyFourHoursAgo) {
                await deleteDoc(docSnap.ref);
                continue;
            }

            const isMine = msg.senderId === currentUser.uid;
            const time = msg.createdAt
                ? msg.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

            chatMessages.innerHTML += `
                <div class="chat-bubble ${isMine ? "mine" : "theirs"}">
                    ${msg.text}
                    <div class="time">${time}</div>
                </div>
            `;
        }

        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Send message
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("messageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    await addDoc(collection(db, "chats", itemId, "messages"), {
        text: text,
        senderId: currentUser.uid,
        createdAt: serverTimestamp()
    });
}

// Mark as Claimed
document.getElementById("markClaimedBtn").addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to mark this item as claimed? The chat will be deleted.");
    if (!confirmed) return;

    try {
        // Update item status
        await updateDoc(doc(db, "items", itemId), {
            status: "Claimed"
        });

        // Delete entire chat
        await deleteEntireChat();

        alert("Item marked as claimed! 🎉");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error marking as claimed:", error.message);
    }
});

// Delete entire chat and all messages
async function deleteEntireChat() {
    const messagesRef = collection(db, "chats", itemId, "messages");
    const snapshot = await getDocs(messagesRef);

    // Delete all messages first
    for (const msgDoc of snapshot.docs) {
        await deleteDoc(msgDoc.ref);
    }

    // Then delete the chat document
    await deleteDoc(doc(db, "chats", itemId));
}