/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (Upgraded for Admin Dashboard)              */
/* PURPOSE: Manages the user's journey from individual to family administrator.      */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, saveDocument, addDocument } from '../database.js';
import { uploadFile } from '../storage.js';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let currentFamily = null;
let familyMembers = []; // To store member profile data
let mainUnsubscribe = null;

const mainContainer = document.getElementById('family-hub-container');

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("Family Hub module initialized for user:", currentUser.uid);
    if (mainUnsubscribe) mainUnsubscribe();
    checkUserFamilyStatus();
}

function checkUserFamilyStatus() {
    mainContainer.innerHTML = `<p class="text-center text-slate-500 py-10">Loading your family information...</p>`;
    const userDocRef = doc(db, "users", currentUser.uid);

    mainUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
        if (!userSnap.exists()) {
            mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Could not find user data.</p>`;
            return;
        }
        const userData = userSnap.data();

        if (userData.familyId) {
            await loadFamilyDashboard(userData.familyId);
        } else {
            renderIndividualView();
        }
    }, (error) => {
        console.error("Error listening to user document:", error);
        mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Error connecting to the database.</p>`;
    });
}

async function loadFamilyDashboard(familyId) {
    const familyDocRef = doc(db, "families", familyId);
    onSnapshot(familyDocRef, async (familySnap) => {
        if (!familySnap.exists()) {
            mainContainer.innerHTML = `<p class="text-center text-red-500 py-10">Family data not found.</p>`;
            return;
        }
        currentFamily = { id: familySnap.id, ...familySnap.data() };
        
        // Fetch all member data
        const memberPromises = currentFamily.members.map(id => getDocument('users', id));
        familyMembers = await Promise.all(memberPromises);

        renderFamilyDashboard();
    });
}


// --- VIEW RENDERING FUNCTIONS ---

function renderIndividualView() {
    mainContainer.innerHTML = `
        <div class="text-center">
            <i class="fas fa-user-friends text-5xl text-slate-300 mb-4"></i>
            <h2 class="text-2xl font-bold text-slate-800">Establish Your Family Homestead</h2>
            <p class="text-slate-600 mt-2 max-w-xl mx-auto">Create a secure digital space for your family to collaborate, grow, and build a shared legacy.</p>
        </div>
        <div class="max-w-md mx-auto mt-8">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Create Your Family</h3>
                <form id="create-family-form">
                    <label for="family-name" class="block text-sm font-medium text-slate-700">Family Name</label>
                    <input type="text" id="family-name" required placeholder="e.g., The Mdeni Family Enterprise" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <button type="submit" class="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Establish Family</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('create-family-form').addEventListener('submit', handleCreateFamily);
}

function renderFamilyDashboard() {
    const isAdmin = currentFamily.admin === currentUser.uid;
    mainContainer.innerHTML = `
        <div class="flex items-center mb-6">
            <img id="family-logo-display" src="${currentFamily.logoUrl || 'https://placehold.co/80x80/E2E8F0/475569?text=Logo'}" class="w-20 h-20 rounded-full object-cover bg-white shadow-md">
            <div class="ml-4">
                <h1 class="text-3xl font-bold text-slate-900">${currentFamily.name}</h1>
                <p class="text-slate-600">Family Administration Dashboard</p>
            </div>
        </div>

        <!-- TABS -->
        <div class="border-b border-slate-200">
            <nav class="flex space-x-8" id="family-tabs">
                <button data-tab="members" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 active">
                    <i class="fas fa-users mr-2"></i> Members
                </button>
                <button data-tab="profile" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-id-card mr-2"></i> Family Profile
                </button>
                <button data-tab="governance" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300">
                    <i class="fas fa-gavel mr-2"></i> Governance
                </button>
            </nav>
        </div>

        <!-- TAB CONTENT -->
        <div id="tab-content" class="mt-6">
            <!-- Content will be injected here -->
        </div>
    `;

    // Attach tab listeners
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });

    // Render initial tab
    renderTabContent('members');
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('tab-content');
    const isAdmin = currentFamily.admin === currentUser.uid;

    switch (tabName) {
        case 'members':
            const membersHtml = familyMembers.map(member => {
                if (!member) return ''; // Handle case where a member doc might not be found
                const isUserAdmin = currentFamily.admin === member.id;
                return `
                    <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                        <div class="flex items-center">
                            <img src="${member.lifeCv?.profilePictures?.primary || 'https://placehold.co/40x40/E2E8F0/475569?text=U'}" class="w-10 h-10 rounded-full object-cover">
                            <div class="ml-3">
                                <p class="font-semibold text-slate-800">${member.profile?.displayName || 'Unnamed Member'}</p>
                                <p class="text-sm text-slate-500">${member.email}</p>
                            </div>
                        </div>
                        <div>
                            ${isUserAdmin ? '<span class="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">Admin</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');

            contentContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Member List -->
                    <div class="space-y-3">
                        ${membersHtml}
                    </div>
                    <!-- Invite New Member -->
                    ${isAdmin ? `
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="font-semibold text-lg text-slate-800 mb-3">Invite New Member</h3>
                        <form id="invite-member-form">
                            <label for="member-email" class="block text-sm font-medium text-slate-700">Member's Email Address</label>
                            <input type="email" id="member-email" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <p class="text-xs text-slate-500 mt-1">They must have a Hub account to be invited.</p>
                            <button type="submit" class="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Send Invitation</button>
                        </form>
                    </div>` : ''}
                </div>
            `;
            if (isAdmin) {
                document.getElementById('invite-member-form').addEventListener('submit', handleInviteMember);
            }
            break;
        case 'profile':
            contentContainer.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-lg text-slate-800 mb-4">Edit Family Profile</h3>
                    <form id="family-profile-form">
                        <div>
                            <label for="family-name-input" class="block text-sm font-medium text-slate-700">Family Name</label>
                            <input type="text" id="family-name-input" value="${currentFamily.name}" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md">
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-slate-700">Family Logo</label>
                            <div class="mt-1 flex items-center">
                                <img src="${currentFamily.logoUrl || 'https://placehold.co/64x64/E2E8F0/475569?text=Logo'}" class="h-16 w-16 rounded-full bg-slate-100 object-cover">
                                <label for="logo-upload" class="ml-5 bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                                    Change
                                </label>
                                <input id="logo-upload" type="file" class="hidden" accept="image/*">
                            </div>
                        </div>
                        <div class="mt-6 text-right">
                            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                        </div>
                    </form>
                </div>
            `;
            if (isAdmin) {
                document.getElementById('family-profile-form').addEventListener('submit', handleProfileUpdate);
                document.getElementById('logo-upload').addEventListener('change', handleLogoUpload);
            } else {
                // Disable form for non-admins
                contentContainer.querySelectorAll('input, button').forEach(el => el.disabled = true);
            }
            break;
        case 'governance':
            contentContainer.innerHTML = `<p class="text-slate-600">Governance tools, including role assignment and appointment letters, will be available here soon.</p>`;
            break;
    }
}


// --- EVENT HANDLERS & LOGIC ---

async function handleCreateFamily(e) {
    e.preventDefault();
    const familyName = document.getElementById('family-name').value.trim();
    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Establishing...';

    try {
        const familyData = {
            name: familyName,
            admin: currentUser.uid,
            members: [currentUser.uid],
            createdAt: serverTimestamp(),
        };
        const familyDocRef = await addDocument('families', familyData);
        await updateDocument('users', currentUser.uid, { familyId: familyDocRef.id });
        // The onSnapshot will automatically refresh the view.
    } catch (error) {
        console.error("Error creating family:", error);
        alert("Failed to create family.");
        button.disabled = false;
        button.textContent = 'Establish Family';
    }
}

async function handleInviteMember(e) {
    e.preventDefault();
    const emailInput = document.getElementById('member-email');
    const email = emailInput.value.trim();
    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
        // Simple invitation logic for now. A full system would use a separate 'invitations' collection.
        const q = query(collection(db, "users"), where("email", "==", email));
        const userSnapshot = await getDocs(q);
        if (userSnapshot.empty) {
            throw new Error("User not found. They must have an account in The Hub.");
        }
        const newMember = userSnapshot.docs[0];
        if (currentFamily.members.includes(newMember.id)) {
             throw new Error("This user is already a member of the family.");
        }
        
        const updatedMembers = [...currentFamily.members, newMember.id];
        await updateDocument('families', currentFamily.id, { members: updatedMembers });
        await updateDocument('users', newMember.id, { familyId: currentFamily.id });

        alert(`${newMember.data().profile.displayName || 'User'} has been added to the family!`);
        emailInput.value = '';

    } catch(error) {
        console.error("Error inviting member:", error);
        alert(`Error: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = 'Send Invitation';
    }
}

async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const filePath = `families/${currentFamily.id}/logo/${file.name}`;
    try {
        const downloadURL = await uploadFile(file, filePath);
        await updateDocument('families', currentFamily.id, { logoUrl: downloadURL });
        alert("Logo updated!");
    } catch (error) {
        console.error("Logo upload failed:", error);
        alert("Could not upload the logo.");
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('family-name-input').value;
    try {
        await updateDocument('families', currentFamily.id, { name: newName });
        alert("Family profile saved.");
    } catch (error) {
        console.error("Profile update failed:", error);
        alert("Could not save profile changes.");
    }
}
