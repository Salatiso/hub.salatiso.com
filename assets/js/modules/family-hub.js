/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (UPGRADED FOR FAMILY VALUE)                 */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument } from '../database.js';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, addDoc, getDocs } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js)";

let currentUserId = null;
let currentUserEmail = null;
let mainUnsubscribe = null;

const shareableSections = [ /* ... same as previous version ... */ ];

export function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    currentUserEmail = user.email;
    console.log("Family Hub 2.0 (Family Value) module initialized.");

    if (mainUnsubscribe) mainUnsubscribe();
    checkUserStatus();
}

async function checkUserStatus() {
    // This is now a multi-stage check: Family -> Couple -> Individual
    const userDocRef = doc(db, "users", currentUserId);
    mainUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
        const userData = userSnap.data();
        if (userData && userData.familyId) {
            // 1. User is part of a formal Family
            const familyDoc = await getDocument(`families/${userData.familyId}`);
            renderFamilyDashboard(userData.familyId, familyDoc);
        } else {
            // 2. User is not in a family, check if they are in a couple
            const q = query(collection(db, "couples"), where("members", "array-contains", currentUserId));
            const coupleSnapshot = await getDocs(q);
            if (!coupleSnapshot.empty) {
                const coupleDoc = coupleSnapshot.docs[0];
                renderSyncedView(coupleDoc.id, coupleDoc.data());
            } else {
                // 3. User is an individual
                renderInvitationView();
            }
        }
    }, (error) => {
        console.error("Error checking user status:", error);
    });
}

// --- FAMILY DASHBOARD VIEW ---

async function renderFamilyDashboard(familyId, familyData) {
    const container = document.getElementById('family-hub-container');
    const isAdmin = familyData.adminId === currentUserId;

    // Fetch all member documents to get their names/emails
    const memberDocs = await Promise.all(
        familyData.members.map(id => getDocument(`users/${id}`))
    );

    container.innerHTML = getFamilyDashboardHTML(familyData, memberDocs, isAdmin);
    
    if(isAdmin) {
        // Add event listeners for admin actions (e.g., add member)
    }
}


// --- SYNCED (COUPLE) VIEW ---

async function renderSyncedView(coupleId, coupleData) {
    const container = document.getElementById('family-hub-container');
    const partnerId = coupleData.members.find(id => id !== currentUserId);
    if (!partnerId) return;

    const partnerDoc = await getDocument(`users/${partnerId}`);
    const partnerName = partnerDoc.displayName || 'Your Partner';

    container.innerHTML = getSyncedViewHTML(partnerName);
    
    document.getElementById('formalize-family-btn').addEventListener('click', () => renderCreateFamilyView(coupleId, coupleData));

    // All the tab and LifeSync logic from the previous version remains the same
    setupSyncedViewTabs(coupleId, partnerId, 'You', partnerName);
}

function setupSyncedViewTabs(coupleId, partnerId, currentUserName, partnerName) { /* ... same as previous version ... */ }
async function renderLifeSyncDashboard(coupleId, partnerId, currentUserName, partnerName) { /* ... same as previous version ... */ }
async function savePermissions(e, coupleId) { /* ... same as previous version ... */ }
async function renderCompatibilityView(partnerId, myPermissions, partnerPermissions, currentUserName, partnerName) { /* ... same as previous version ... */ }


// --- CREATE FAMILY VIEW ---

function renderCreateFamilyView(coupleId, coupleData) {
     const container = document.getElementById('family-hub-container');
     container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-2xl font-bold text-slate-800">Formalize Family Unit</h2>
            <p class="text-slate-600 mt-2">Establish a formal family structure with you as the administrator. This will allow you to add more members like children or elders and manage the family's shared identity.</p>
            <form id="create-family-form" class="mt-6">
                <div>
                    <label for="family-name" class="block text-sm font-medium text-slate-700">Family Name</label>
                    <input type="text" id="family-name" class="mt-1 block w-full rounded-md border-slate-300" placeholder="e.g., The Mdeni Family" required>
                </div>
                <div class="mt-6 flex items-center justify-end gap-4">
                    <button type="button" id="cancel-create-family" class="text-sm font-semibold text-slate-600">Cancel</button>
                    <button type="submit" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md">Create Family</button>
                </div>
            </form>
        </div>
     `;
     document.getElementById('cancel-create-family').addEventListener('click', () => renderSyncedView(coupleId, coupleData));
     document.getElementById('create-family-form').addEventListener('submit', (e) => handleCreateFamily(e, coupleData));
}

async function handleCreateFamily(e, coupleData) {
    e.preventDefault();
    const familyName = document.getElementById('family-name').value;
    if (!familyName) return;

    const batch = writeBatch(db);

    // 1. Create the new family document
    const familyRef = doc(collection(db, "families"));
    batch.set(familyRef, {
        name: familyName,
        adminId: currentUserId,
        members: coupleData.members, // Start with the couple as members
        memberRoles: {
            [currentUserId]: 'Administrator',
            [coupleData.members.find(id => id !== currentUserId)]: 'Partner'
        },
        createdAt: serverTimestamp()
    });

    // 2. Update both user documents with the new familyId
    coupleData.members.forEach(memberId => {
        const userRef = doc(db, "users", memberId);
        batch.update(userRef, { familyId: familyRef.id });
    });
    
    // 3. (Optional) Delete the old couple document as it's now formalized
    const coupleRef = doc(db, "couples", coupleData.members.sort().join('_'));
    batch.delete(coupleRef);

    try {
        await batch.commit();
        // The main listener will automatically detect the change and render the family dashboard.
    } catch (error) {
        console.error("Error creating family:", error);
        alert("Failed to create family unit.");
    }
}


// --- INVITATION VIEW (Individual) ---
function renderInvitationView() { /* ... same as previous version ... */ }
// ... All other invitation functions remain the same ...


// --- HTML TEMPLATE FUNCTIONS ---

function getFamilyDashboardHTML(familyData, memberDocs, isAdmin) {
    const membersHtml = memberDocs.map(memberDoc => {
        const memberId = memberDoc.id;
        const role = familyData.memberRoles[memberId] || 'Member';
        return `
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div>
                    <p class="font-semibold text-slate-800">${memberDoc.displayName || memberDoc.email}</p>
                    <p class="text-xs text-slate-500">${role}</p>
                </div>
                ${isAdmin && memberId !== currentUserId ? '<button class="text-xs text-red-500 font-semibold">Remove</button>' : ''}
            </div>
        `;
    }).join('');

    return `
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

function getSyncedViewHTML(partnerName) {
    const originalSyncedHTML = `...`; // The full HTML from the previous version
    // Add the "Formalize" button to the original HTML
    return originalSyncedHTML.replace(
        '<div id="tab-content-dashboard"', 
        `<div class="text-center mb-6"><button id="formalize-family-btn" class="bg-green-600 text-white font-bold py-2 px-5 rounded-lg shadow hover:bg-green-700"><i class="fas fa-users mr-2"></i>Formalize Family Unit</button></div><div id="tab-content-dashboard"`
    );
}
// ... other HTML functions ...
