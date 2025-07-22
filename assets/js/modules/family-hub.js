/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (CORRECTED)                                 */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, saveDocument } from '../database.js';
// CORRECTED: This line now uses a valid module specifier for the Firestore library.
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUserId = null;
let currentUserEmail = null;
let currentUserData = null;
let mainUnsubscribe = null;

const mainContainer = document.getElementById('family-hub-container');

const shareableSections = [
    { id: 'summary', label: 'Personal Summary' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills & Certifications' },
    { id: 'projects', label: 'Projects' },
    { id: 'references', label: 'References' },
];

export function init(user) {
    if (!user || !user.uid) {
        console.error("Family Hub Error: User not authenticated.");
        return;
    }
    currentUserId = user.uid;
    currentUserEmail = user.email;
    console.log("Family Hub module initialized.");

    if (mainUnsubscribe) mainUnsubscribe(); // Stop any previous listener
    checkUserStatus();
}

function checkUserStatus() {
    mainContainer.innerHTML = `<p class="text-center text-slate-500 py-10">Checking your family status...</p>`;
    const userDocRef = doc(db, "users", currentUserId);

    mainUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
        currentUserData = userSnap.data();
        if (currentUserData && currentUserData.familyId) {
            // 1. User is part of a formal Family
            const familyDoc = await getDocument('families', currentUserData.familyId);
            renderFamilyValueView(familyDoc);
        } else if (currentUserData && currentUserData.lifeSync && currentUserData.lifeSync.partnerId) {
            // 2. User is in a LifeSync relationship
            const partnerDoc = await getDocument('users', currentUserData.lifeSync.partnerId);
            renderSyncedView(partnerDoc.profile.displayName);
        } else {
            // 3. User is an individual
            renderIndividualView();
        }
    }, (error) => {
        console.error("Error checking user status: ", error);
        mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Error loading your information.</p>`;
    });
}


// --- RENDER FUNCTIONS ---

function renderIndividualView() {
    // This view shows options to send or accept invites
    mainContainer.innerHTML = `
        <div class="text-center">
            <i class="fas fa-users text-5xl text-slate-300 mb-4"></i>
            <h2 class="text-2xl font-bold text-slate-800">Connect with your Partner</h2>
            <p class="text-slate-600 mt-2 max-w-lg mx-auto">Use LifeSync to securely share parts of your LifeCV with your partner, manage shared goals, and build a unified view of your life together.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            ${getSendInviteHTML()}
            ${getPendingInvitesHTML()}
        </div>
    `;
    attachSendInviteListener();
    listenForPendingInvites();
}

function renderSyncedView(partnerName) {
    mainContainer.innerHTML = `
         <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">LifeSync Active</h2>
                    <p class="text-slate-600 mt-1">You are synced with <span class="font-semibold text-indigo-600">${partnerName}</span>.</p>
                </div>
                <div class="mt-4 sm:mt-0">
                    <button id="formalize-family-btn" class="bg-green-600 text-white font-bold py-2 px-5 rounded-lg shadow hover:bg-green-700 transition-colors">
                        <i class="fas fa-home mr-2"></i>Formalize Family
                    </button>
                </div>
            </div>
            <div class="border-t my-4"></div>
            <div id="sync-management-content">
                <!-- Tabs for managing the sync -->
            </div>
        </div>
    `;
    // Add logic to render tabs for managing permissions, etc.
    // Attach listener for the "Formalize" button
}

function renderFamilyValueView(familyData) {
     const isAdmin = familyData.admin === currentUserId;
     const membersHtml = familyData.members.map(memberId => {
        // In a real app, you'd fetch member names. For now, we use IDs.
        const isMemberAdmin = memberId === familyData.admin;
        return `
            <div class="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                <div class="flex items-center">
                    <i class="fas fa-user-circle text-slate-400 text-xl"></i>
                    <span class="ml-3 text-slate-700 font-medium">${memberId.substring(0, 8)}...</span>
                    ${isMemberAdmin ? '<span class="ml-2 text-xs bg-indigo-200 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">Admin</span>' : ''}
                </div>
                ${isAdmin && memberId !== currentUserId ? '<button class="text-xs text-red-500 font-semibold hover:underline">Remove</button>' : ''}
            </div>
        `;
    }).join('');

    mainContainer.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-start">
                 <div>
                    <h2 class="text-2xl font-bold text-slate-800">${familyData.name}</h2>
                    <p class="text-slate-600 mt-1">Family Dashboard</p>
                </div>
                ${isAdmin ? '<button class="bg-indigo-100 text-indigo-700 text-sm font-semibold py-2 px-4 rounded-md hover:bg-indigo-200">Manage Family</button>' : ''}
            </div>
            <div class="border-t my-4"></div>
            <h3 class="text-lg font-semibold text-slate-700 mb-3">Members</h3>
            <div class="space-y-2">${membersHtml}</div>
        </div>
    `;
}


// --- HTML COMPONENT BUILDERS ---

function getSendInviteHTML() {
    return `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-semibold text-lg text-slate-800 mb-3">Send a LifeSync Invitation</h3>
            <form id="send-invite-form">
                <label for="recipient-email" class="block text-sm font-medium text-slate-700">Partner's Email Address</label>
                <input type="email" id="recipient-email" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <p class="text-xs text-slate-500 mt-1">They will receive a notification to connect with you.</p>
                <button type="submit" class="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Send Invite</button>
            </form>
        </div>
    `;
}

function getPendingInvitesHTML() {
    return `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-semibold text-lg text-slate-800 mb-3">Pending Invitations</h3>
            <div id="invites-list" class="space-y-3">
                <p class="text-slate-500 text-sm">Checking for invitations...</p>
            </div>
        </div>
    `;
}


// --- EVENT LISTENERS & DATA HANDLERS ---

function attachSendInviteListener() {
    const form = document.getElementById('send-invite-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('recipient-email').value;
        const button = form.querySelector('button');
        button.disabled = true;
        button.textContent = 'Sending...';

        try {
            // Check if user exists
            const q = query(collection(db, "users"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                throw new Error("User with that email does not exist in The Hub.");
            }

            const invite = {
                senderId: currentUserId,
                senderName: auth.currentUser.displayName || 'A User',
                senderEmail: currentUserEmail,
                recipientEmail: email,
                status: 'pending',
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, 'syncInvitations'), invite);
            alert('Invitation sent successfully!');
            form.reset();
        } catch (error) {
            console.error("Error sending invite:", error);
            alert(`Error: ${error.message}`);
        } finally {
            button.disabled = false;
            button.textContent = 'Send Invite';
        }
    });
}

function listenForPendingInvites() {
    const invitesList = document.getElementById('invites-list');
    const q = query(collection(db, 'syncInvitations'), where('recipientEmail', '==', currentUserEmail), where('status', '==', 'pending'));

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            invitesList.innerHTML = `<p class="text-slate-500 text-sm">You have no pending invitations.</p>`;
            return;
        }
        let invitesHTML = '';
        snapshot.forEach(doc => {
            const invite = doc.data();
            invitesHTML += `
                <div class="bg-slate-50 p-3 rounded-md flex justify-between items-center">
                    <div>
                        <p class="text-sm text-slate-800">Invite from <span class="font-semibold">${invite.senderName}</span></p>
                        <p class="text-xs text-slate-500">${invite.senderEmail}</p>
                    </div>
                    <div>
                        <button data-invite-id="${doc.id}" data-sender-id="${invite.senderId}" class="accept-invite-btn bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600">Accept</button>
                    </div>
                </div>
            `;
        });
        invitesList.innerHTML = invitesHTML;
        attachAcceptInviteListeners();
    });
}

function attachAcceptInviteListeners() {
    document.querySelectorAll('.accept-invite-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const inviteId = e.target.dataset.inviteId;
            const senderId = e.target.dataset.senderId;
            e.target.disabled = true;
            e.target.textContent = 'Accepting...';

            try {
                // Use a batch write to update all documents atomically
                const batch = writeBatch(db);

                // 1. Update this user's doc
                const currentUserRef = doc(db, 'users', currentUserId);
                batch.update(currentUserRef, { 'lifeSync.partnerId': senderId, 'lifeSync.status': 'active' });

                // 2. Update the sender's doc
                const senderRef = doc(db, 'users', senderId);
                batch.update(senderRef, { 'lifeSync.partnerId': currentUserId, 'lifeSync.status': 'active' });

                // 3. Update the invitation status
                const inviteRef = doc(db, 'syncInvitations', inviteId);
                batch.update(inviteRef, { status: 'accepted' });

                await batch.commit();
                // The onSnapshot listener will automatically re-render the view
            } catch (error) {
                console.error("Error accepting invite:", error);
                alert("Failed to accept invitation.");
                e.target.disabled = false;
                e.target.textContent = 'Accept';
            }
        });
    });
}
