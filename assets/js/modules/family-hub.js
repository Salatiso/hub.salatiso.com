/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (Foundation for Family Value)               */
/* PURPOSE: This module manages the user's journey from individual, to a synced      */
/* partner, to creating and managing a formal family structure.                      */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, saveDocument, addDocument, getDocuments } from '../database.js';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let mainUnsubscribe = null; // To prevent multiple listeners

const mainContainer = document.getElementById('family-hub-container');

export function init(user) {
    if (!user || !user.uid) {
        console.error("Family Hub Error: User not authenticated.");
        mainContainer.innerHTML = `<p class="text-red-500 text-center">Authentication error. Please refresh.</p>`;
        return;
    }
    currentUser = user;
    console.log("Family Hub module initialized for user:", currentUser.uid);

    if (mainUnsubscribe) mainUnsubscribe(); // Stop any previous listener before starting a new one
    
    checkUserFamilyStatus();
}

/**
 * Checks the user's status in three stages:
 * 1. Are they part of a formal Family?
 * 2. Are they in a LifeSync partnership?
 * 3. If neither, they are an Individual.
 */
function checkUserFamilyStatus() {
    mainContainer.innerHTML = `<p class="text-center text-slate-500 py-10">Loading your family information...</p>`;
    const userDocRef = doc(db, "users", currentUser.uid);

    mainUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
        if (!userSnap.exists()) {
             mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Could not find user data.</p>`;
             return;
        }
        const userData = userSnap.data();

        try {
            if (userData.familyId) {
                const familyDoc = await getDocument('families', userData.familyId);
                renderFamilyDashboard(familyDoc, userData);
            } else if (userData.lifeSync && userData.lifeSync.partnerId) {
                const partnerDoc = await getDocument('users', userData.lifeSync.partnerId);
                renderLifeSyncView(partnerDoc);
            } else {
                renderIndividualView();
            }
        } catch (error) {
            console.error("Error processing user status:", error);
            mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Error loading your family dashboard.</p>`;
        }

    }, (error) => {
        console.error("Error listening to user document:", error);
        mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Error connecting to the database.</p>`;
    });
}


// --- VIEW RENDERING FUNCTIONS ---

/**
 * Renders the view for a user who is not in a partnership or family.
 * Shows options to send or accept LifeSync invitations and to create a new family.
 */
function renderIndividualView() {
    mainContainer.innerHTML = `
        <div class="text-center">
            <i class="fas fa-user text-5xl text-slate-300 mb-4"></i>
            <h2 class="text-2xl font-bold text-slate-800">Your Digital Homestead Starts Here</h2>
            <p class="text-slate-600 mt-2 max-w-xl mx-auto">Connect with a partner using LifeSync, or establish your family's foundation by creating a Family Value structure.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <!-- Send LifeSync Invite -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Connect with a Partner</h3>
                <form id="send-invite-form">
                    <label for="recipient-email" class="block text-sm font-medium text-slate-700">Partner's Email</label>
                    <input type="email" id="recipient-email" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <button type="submit" class="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Send LifeSync Invite</button>
                </form>
            </div>

            <!-- Create Family -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Establish a Family</h3>
                <form id="create-family-form">
                    <label for="family-name" class="block text-sm font-medium text-slate-700">Family Name</label>
                    <input type="text" id="family-name" required placeholder="e.g., The Mbeki Family" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <button type="submit" class="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Create Family</button>
                </form>
            </div>
        </div>
        <div id="pending-invites-container" class="bg-white p-6 rounded-lg shadow-sm mt-6">
             <h3 class="font-semibold text-lg text-slate-800 mb-3">Pending Invitations</h3>
             <div id="invites-list"><p class="text-slate-500 text-sm">Checking for invitations...</p></div>
        </div>
    `;
    attachIndividualViewListeners();
}

/**
 * Renders the view for a user who is in a LifeSync partnership but not a formal family.
 */
async function renderLifeSyncView(partnerData) {
     mainContainer.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="text-center">
                <i class="fas fa-heart text-5xl text-red-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-slate-800">LifeSync Active</h2>
                <p class="text-slate-600 mt-2">You are currently synced with <span class="font-semibold text-indigo-600">${partnerData.profile.displayName || 'your partner'}</span>.</p>
                <p class="text-slate-500 mt-4 max-w-xl mx-auto">You can now view your compatibility dashboard or take the next step by formalizing your family structure.</p>
                 <div class="mt-6">
                     <button id="formalize-family-btn" class="bg-green-600 text-white font-bold py-2 px-5 rounded-lg shadow hover:bg-green-700 transition-colors">
                        <i class="fas fa-home mr-2"></i>Formalize Family
                    </button>
                 </div>
            </div>
        </div>
     `;
     // TODO: Add listener for formalize button
}

/**
 * Renders the main dashboard for a user who is part of a formal family.
 */
function renderFamilyDashboard(familyData, userData) {
    const isAdmin = familyData.admin === currentUser.uid;
    mainContainer.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-3xl font-bold text-slate-800">${familyData.name}</h2>
            <p class="text-slate-600">Family Dashboard</p>
            ${isAdmin ? '<p class="text-sm text-indigo-600 font-semibold mt-1">You are the family administrator.</p>' : ''}
            <!-- More family dashboard content will go here -->
        </div>
    `;
}


// --- EVENT LISTENERS & LOGIC ---

function attachIndividualViewListeners() {
    // Listener for sending a LifeSync invite
    const sendInviteForm = document.getElementById('send-invite-form');
    sendInviteForm.addEventListener('submit', handleSendInvite);

    // Listener for creating a new family
    const createFamilyForm = document.getElementById('create-family-form');
    createFamilyForm.addEventListener('submit', handleCreateFamily);
    
    // Start listening for any incoming invites
    listenForPendingInvites();
}

async function handleSendInvite(e) {
    e.preventDefault();
    const emailInput = document.getElementById('recipient-email');
    const email = emailInput.value.trim();
    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Sending...';

    if (email === currentUser.email) {
        alert("You cannot send an invite to yourself.");
        button.disabled = false;
        button.textContent = 'Send LifeSync Invite';
        return;
    }

    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            throw new Error(`No user found with the email: ${email}. Please ask them to sign up for The Hub first.`);
        }

        const invite = {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'A Hub User',
            senderEmail: currentUser.email,
            recipientEmail: email,
            status: 'pending',
            createdAt: serverTimestamp()
        };
        await addDocument('syncInvitations', invite);
        alert('Invitation sent successfully!');
        emailInput.value = '';
    } catch (error) {
        console.error("Error sending invite:", error);
        alert(`Error: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = 'Send LifeSync Invite';
    }
}

async function handleCreateFamily(e) {
    e.preventDefault();
    const familyNameInput = document.getElementById('family-name');
    const familyName = familyNameInput.value.trim();
    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Creating...';

    try {
        const familyData = {
            name: familyName,
            admin: currentUser.uid,
            members: [currentUser.uid], // Creator is the first member and admin
            createdAt: serverTimestamp(),
            governance: {
                // Default governance structure
                roles: [{ name: 'Administrator', assignedTo: currentUser.uid }]
            }
        };
        const familyDocRef = await addDocument('families', familyData);
        
        // Now, update the user's document to link them to the new family
        await updateDocument('users', currentUser.uid, { familyId: familyDocRef.id });
        
        // The onSnapshot listener will automatically refresh the view to the family dashboard
        alert(`Successfully created the ${familyName}!`);

    } catch (error) {
        console.error("Error creating family:", error);
        alert("There was an error creating the family. Please try again.");
    } finally {
         button.disabled = false;
         button.textContent = 'Create Family';
    }
}

function listenForPendingInvites() {
    const invitesList = document.getElementById('invites-list');
    const q = query(collection(db, 'syncInvitations'), where('recipientEmail', '==', currentUser.email), where('status', '==', 'pending'));

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
                    </div>
                    <div>
                        <button data-invite-id="${doc.id}" data-sender-id="${invite.senderId}" class="accept-invite-btn bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600">Accept</button>
                    </div>
                </div>
            `;
        });
        invitesList.innerHTML = invitesHTML;
        
        document.querySelectorAll('.accept-invite-btn').forEach(button => {
            button.addEventListener('click', handleAcceptInvite);
        });
    });
}

async function handleAcceptInvite(e) {
    const button = e.target;
    const inviteId = button.dataset.inviteId;
    const senderId = button.dataset.senderId;
    button.disabled = true;
    button.textContent = 'Accepting...';

    try {
        const batch = writeBatch(db);

        const currentUserRef = doc(db, 'users', currentUser.uid);
        batch.update(currentUserRef, { 'lifeSync.partnerId': senderId, 'lifeSync.status': 'active' });

        const senderRef = doc(db, 'users', senderId);
        batch.update(senderRef, { 'lifeSync.partnerId': currentUser.uid, 'lifeSync.status': 'active' });

        const inviteRef = doc(db, 'syncInvitations', inviteId);
        batch.update(inviteRef, { status: 'accepted' });

        await batch.commit();
        // The onSnapshot will now re-render the view to the LifeSync page.
    } catch (error) {
        console.error("Error accepting invite:", error);
        alert("Failed to accept invitation.");
        button.disabled = false;
        button.textContent = 'Accept';
    }
}
