/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (UPGRADED FOR COMPATIBILITY DASHBOARD)      */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument } from '../database.js';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, addDoc } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js)";

let currentUserId = null;
let currentUserEmail = null;
let coupleUnsubscribe = null; // To manage the listener

// Define the sections of the LifeCV that can be shared between partners.
const shareableSections = [
    { id: 'summary', label: 'Profile Summary', icon: 'fa-user-circle' },
    { id: 'values', label: 'Core Values & Beliefs', icon: 'fa-gem' },
    { id: 'goals', label: 'Personal & Professional Goals', icon: 'fa-bullseye' },
    { id: 'financial', label: 'Financial Overview', icon: 'fa-wallet' },
    { id: 'skills', label: 'Skills & Competencies', icon: 'fa-cogs' }
];

export function init(user) {
    if (!user || !user.uid) {
        console.error("Family Hub Error: User not authenticated.");
        return;
    }
    currentUserId = user.uid;
    currentUserEmail = user.email;
    console.log("Family Hub 2.0 (Compatibility) module initialized.");

    if (coupleUnsubscribe) coupleUnsubscribe(); // Stop any previous listeners
    checkUserStatus();
}

function checkUserStatus() {
    const q = query(collection(db, "couples"), where("members", "array-contains", currentUserId));
    coupleUnsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const coupleDoc = snapshot.docs[0];
            renderSyncedView(coupleDoc.id, coupleDoc.data());
        } else {
            renderInvitationView();
        }
    }, (error) => {
        console.error("Error checking user couple status:", error);
        document.getElementById('family-hub-container').innerHTML = `<p class="text-red-500">Error loading data.</p>`;
    });
}

// --- SYNCED VIEW ---

async function renderSyncedView(coupleId, coupleData) {
    const container = document.getElementById('family-hub-container');
    const partnerId = coupleData.members.find(id => id !== currentUserId);
    
    if (!partnerId) {
        container.innerHTML = `<p class="text-red-500">Error: Partner data not found.</p>`;
        return;
    }

    const [partnerDoc, currentUserDoc] = await Promise.all([
        getDocument(`users/${partnerId}`),
        getDocument(`users/${currentUserId}`)
    ]);

    const partnerName = partnerDoc.displayName || 'Your Partner';
    const currentUserName = currentUserDoc.displayName || 'You';

    container.innerHTML = getSyncedViewHTML(partnerName);
    setupSyncedViewTabs(coupleId, partnerId, currentUserName, partnerName);
}

function setupSyncedViewTabs(coupleId, partnerId, currentUserName, partnerName) {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = {
        dashboard: document.getElementById('tab-content-dashboard'),
        lifesync: document.getElementById('tab-content-lifesync')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(contents).forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            const targetContentId = `tab-content-${tab.id.split('-')[1]}`;
            document.getElementById(targetContentId).classList.remove('hidden');
        });
    });
    
    // Initialize the LifeSync tab content
    renderLifeSyncDashboard(coupleId, partnerId, currentUserName, partnerName);
}

async function renderLifeSyncDashboard(coupleId, partnerId, currentUserName, partnerName) {
    const lifeSyncContainer = document.getElementById('tab-content-lifesync');
    
    const coupleDoc = await getDocument(`couples/${coupleId}`);
    const myPermissions = coupleDoc.permissions?.[currentUserId] || {};
    const partnerPermissions = coupleDoc.permissions?.[partnerId] || {};

    lifeSyncContainer.innerHTML = getLifeSyncDashboardHTML(myPermissions);
    
    document.getElementById('permissions-form').addEventListener('submit', (e) => savePermissions(e, coupleId));
    
    renderCompatibilityView(partnerId, myPermissions, partnerPermissions, currentUserName, partnerName);
}

async function savePermissions(e, coupleId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPermissions = {};
    shareableSections.forEach(section => {
        newPermissions[section.id] = formData.has(section.id);
    });

    const updatePayload = {
        [`permissions.${currentUserId}`]: newPermissions
    };

    try {
        await updateDocument(`couples/${coupleId}`, updatePayload);
        // Show feedback
        const saveBtn = e.target.querySelector('button');
        saveBtn.textContent = 'Saved!';
        saveBtn.classList.add('bg-green-600');
        setTimeout(() => {
            saveBtn.textContent = 'Save Sharing Settings';
            saveBtn.classList.remove('bg-green-600');
        }, 2000);
    } catch (error) {
        console.error("Error saving permissions:", error);
        alert("Could not save settings.");
    }
}

async function renderCompatibilityView(partnerId, myPermissions, partnerPermissions, currentUserName, partnerName) {
    const container = document.getElementById('compatibility-view');
    container.innerHTML = ''; // Clear previous view

    // Mock LifeCV data for demonstration. In a real scenario, this would be fetched from the user's LifeCV module data.
    const mockLifeCVs = {
        [currentUserId]: {
            summary: { headline: 'Visionary Leader & Builder', text: 'Driven by the goal of building self-sustaining digital ecosystems for empowerment.' },
            values: { text: 'Family, Sovereignty, Legacy, Growth' },
            goals: { text: 'Complete The Hub v1, Secure first 1000 users, Begin Flamea integration.' },
            financial: { text: 'Focus on long-term investment and asset acquisition over short-term gains.' },
            skills: { text: 'Firebase, JavaScript, Strategic Planning, Project Management' }
        },
        [partnerId]: {
            summary: { headline: 'Creative Strategist & Community Organizer', text: 'Passionate about leveraging technology to connect people and foster community growth.' },
            values: { text: 'Community, Empathy, Creativity, Stability' },
            goals: { text: 'Launch a community outreach program, Master data visualization tools.' },
            financial: { text: 'Prioritizes debt-free living and building a strong emergency fund.' },
            skills: { text: 'Marketing, Graphic Design, Public Speaking, Event Management' }
        }
    };
    
    let sharedContentHtml = '';
    shareableSections.forEach(section => {
        const iShare = myPermissions[section.id];
        const partnerShares = partnerPermissions[section.id];

        if (iShare && partnerShares) {
            const myData = mockLifeCVs[currentUserId][section.id]?.text || 'No data provided.';
            const partnerData = mockLifeCVs[partnerId][section.id]?.text || 'No data provided.';

            sharedContentHtml += `
                <div class="bg-white p-4 rounded-lg border">
                    <h4 class="font-semibold text-slate-800 text-center mb-3">${section.label}</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="border-r pr-4">
                            <p class="text-sm font-bold text-center text-indigo-700 mb-2">${currentUserName}</p>
                            <p class="text-sm text-slate-600">${myData}</p>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-center text-pink-700 mb-2">${partnerName}</p>
                            <p class="text-sm text-slate-600">${partnerData}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    if (sharedContentHtml === '') {
        sharedContentHtml = `<p class="text-center text-slate-500 py-8">No sections are currently shared by both partners. Enable sharing above to compare your LifeCVs.</p>`;
    }

    container.innerHTML = sharedContentHtml;
}


// --- INVITATION VIEW (Mostly unchanged from previous version) ---

function renderInvitationView() { /* ... same as previous version ... */ }
async function handleSendInvite(e) { /* ... same as previous version ... */ }
function listenForPendingInvitations() { /* ... same as previous version ... */ }
async function handleAcceptInvite(e) { /* ... same as previous version ... */ }
async function handleDeclineInvite(e) { /* ... same as previous version ... */ }


// --- HTML TEMPLATE FUNCTIONS ---

function getSyncedViewHTML(partnerName) {
    return `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="text-center border-b pb-4">
                <i class="fas fa-users text-3xl text-indigo-500 mb-3"></i>
                <h2 class="text-2xl font-bold text-slate-800">Synced with ${partnerName}</h2>
                <p class="text-slate-600 mt-1">This is your shared dashboard for collaboration and planning.</p>
            </div>
            <div class="border-b border-slate-200 mt-4">
                <nav class="-mb-px flex space-x-6 justify-center" aria-label="Tabs">
                    <button id="tab-dashboard" class="tab-button active text-slate-600 hover:text-indigo-600 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">
                        <i class="fas fa-home mr-2"></i>Family Dashboard
                    </button>
                    <button id="tab-lifesync" class="tab-button text-slate-600 hover:text-indigo-600 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">
                        <i class="fas fa-sync-alt mr-2"></i>LifeSync
                    </button>
                </nav>
            </div>
        </div>
        <div id="tab-content-dashboard" class="py-6"><p class="text-center text-slate-500">Shared calendar, files, and other tools will be built here.</p></div>
        <div id="tab-content-lifesync" class="py-6 hidden"></div>
    `;
}

function getLifeSyncDashboardHTML(myPermissions) {
    const togglesHtml = shareableSections.map(section => {
        const isChecked = myPermissions[section.id] === true;
        return `
            <div class="flex items-center justify-between bg-slate-50 p-3 rounded-md border">
                <span class="font-medium text-slate-700 flex items-center"><i class="fas ${section.icon} w-6 text-center mr-3 text-indigo-500"></i>${section.label}</span>
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" name="${section.id}" id="${section.id}-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${isChecked ? 'checked' : ''}/>
                    <label for="${section.id}-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-xl font-bold text-slate-800">Sharing Permissions</h3>
                    <p class="text-sm text-slate-500 mt-2 mb-4">Choose which sections of your LifeCV to share with your partner. Changes are saved instantly.</p>
                    <form id="permissions-form" class="space-y-3">
                        ${togglesHtml}
                        <div class="pt-4 text-right">
                            <button type="submit" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md">Save Sharing Settings</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="lg:col-span-2">
                 <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-xl font-bold text-slate-800">Compatibility Dashboard</h3>
                    <p class="text-sm text-slate-500 mt-2 mb-4">Here you can see a side-by-side comparison of the LifeCV sections you have both agreed to share.</p>
                    <div id="compatibility-view" class="space-y-4">
                        <p class="text-center text-slate-500 py-8">Loading compatibility view...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
