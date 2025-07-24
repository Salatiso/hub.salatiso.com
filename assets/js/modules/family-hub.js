/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (Governance & Profile Complete)             */
/* PURPOSE: Manages the full family structure, including a rich profile, flexible     */
/* governance, custom roles, and member management.                                  */
/* FIX: Corrected the error on the Governance tab for new families.                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, addDocument, saveDocument } from '../database.js';
import { uploadFile } from '../storage.js';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let currentUser = null;
let currentFamily = null;
let familyMembers = [];
let mainUnsubscribe = null;

const mainContainer = document.getElementById('family-hub-container');

// --- DATA LISTS FOR FLEXIBILITY ---

const relationshipTypes = [
    "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother", "Grandson", "Granddaughter", "Uncle", "Aunt", "Nephew", "Niece", "Cousin", "Father-in-law", "Mother-in-law", "Brother-in-law", "Sister-in-law", "Stepfather", "Stepmother", "Stepson", "Stepdaughter", "Godfather", "Godmother"
];

const suggestedRoles = [
    // Formal / Business Roles
    "Administrator", "CEO", "Chairperson", "Treasurer", "Secretary", "Director", "Trustee",
    // Family & Informal Roles
    "Head of Family", "Provider", "Mentor", "Educator", "Caregiver", "Story Keeper", "Peace Keeper"
];

const suggestedDuties = {
    "CEO": ["Set the overall vision and strategy.", "Oversee all operations and ventures.", "Act as the primary representative for formal entities."],
    "Treasurer": ["Manage family finances and budgets.", "Report on financial health.", "Oversee investments and assets."],
    "Mentor": ["Provide guidance and support to younger members.", "Share knowledge and experience.", "Assist with career and personal development."],
    "Provider": ["Ensure the basic needs of the family are met.", "Contribute financially or through resources.", "Manage household resources."],
    "Educator": ["Oversee the educational development of children.", "Manage relationships with schools.", "Organize supplementary learning activities."],
    "Story Keeper": ["Document and preserve the family history.", "Manage family photos, documents, and stories.", "Share the family legacy with younger generations."]
};

// Enhanced entity management
const entityTypes = {
    formal: [
        "Private Company (Pty Ltd)", "Public Company", "Close Corporation (CC)", 
        "Non-Profit Organization (NPO)", "Trust", "Foundation", "Cooperative"
    ],
    informal: [
        "Family Business", "Community Initiative", "Advocacy Project", "Social Enterprise",
        "Informal Partnership", "Family Investment Group", "Community Organization"
    ]
};

const entityStatuses = [
    "Idea Stage", "Planning Phase", "Active (Unregistered)", "Registration In Progress", 
    "Formally Registered", "Dormant", "Deregistered"
];

// Enhanced profile field categories
const profileFieldCategories = {
    "Family Heritage": ["Origin Story", "Migration History", "Cultural Traditions", "Language Heritage", "Religious Background"],
    "Values & Beliefs": ["Core Values", "Family Motto", "Guiding Principles", "Spiritual Beliefs", "Cultural Practices"],
    "Achievements": ["Notable Accomplishments", "Awards & Recognition", "Educational Milestones", "Professional Success", "Community Impact"],
    "Traditions": ["Annual Celebrations", "Holiday Traditions", "Food Heritage", "Music & Arts", "Sports & Recreation"],
    "Legacy": ["Family Business", "Property & Assets", "Intellectual Property", "Community Contributions", "Future Aspirations"],
    "Challenges Overcome": ["Historical Challenges", "Economic Hardships", "Health Challenges", "Social Barriers", "Personal Growth"],
    "Custom": ["Add Custom Category"]
};


export function init(user) {
    if (!user) return;
    currentUser = user;
    if (mainUnsubscribe) mainUnsubscribe();
    checkUserFamilyStatus();
}

async function checkUserFamilyStatus() {
    mainContainer.innerHTML = `<p class="text-center text-slate-500 py-10">Loading your family information...</p>`;
    const userDocRef = doc(db, "users", currentUser.uid);
    mainUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
        const userData = userSnap.data();
        if (userData && userData.familyId) {
            await loadFamilyDashboard(userData.familyId);
        } else {
            renderIndividualView();
        }
    });
}

async function loadFamilyDashboard(familyId) {
    const familyDocRef = doc(db, "families", familyId);
    onSnapshot(familyDocRef, async (familySnap) => {
        if (!familySnap.exists()) return;
        currentFamily = { id: familySnap.id, ...familySnap.data() };
        const memberPromises = (currentFamily.members || []).map(id => getDocument('users', id));
        familyMembers = (await Promise.all(memberPromises)).filter(m => m); // Filter out any null members
        renderFamilyDashboard();
    });
}


// --- DASHBOARD & TAB RENDERING ---

function renderFamilyDashboard() {
    mainContainer.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center mb-6">
            <img src="${currentFamily.logoUrl || 'https://placehold.co/80x80/E2E8F0/475569?text=Logo'}" class="w-20 h-20 rounded-full object-cover bg-white shadow-md">
            <div class="ml-0 sm:ml-4 mt-4 sm:mt-0">
                <h1 class="text-3xl font-bold text-slate-900">${currentFamily.name}</h1>
                <p class="text-slate-600">Family Administration Dashboard</p>
            </div>
        </div>
        <div class="border-b border-slate-200">
            <nav class="flex flex-wrap -mb-px space-x-8" id="family-tabs">
                <button data-tab="members" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 active"><i class="fas fa-users mr-2"></i> Members</button>
                <button data-tab="familyTree" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"><i class="fas fa-sitemap mr-2"></i> Family Tree</button>
                <button data-tab="profile" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"><i class="fas fa-id-card mr-2"></i> Family Profile</button>
                <button data-tab="governance" class="tab-button py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"><i class="fas fa-gavel mr-2"></i> Governance</button>
            </nav>
        </div>
        <div id="tab-content" class="mt-6"></div>`;

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
    renderTabContent('members'); // Default tab
}


// --- INDIVIDUAL VIEW (NO FAMILY) ---

async function renderIndividualView() {
    // Check for pending family invitations
    const invitationsQuery = query(
        collection(db, 'familyInvitations'),
        where('invitedEmail', '==', currentUser.email),
        where('status', '==', 'pending')
    );
    
    const invitationSnap = await getDocs(invitationsQuery);
    const pendingInvitations = invitationSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const invitationsHtml = pendingInvitations.length > 0 ? `
        <div class="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 class="font-semibold text-yellow-800 mb-3">Pending Family Invitations</h3>
            <div class="space-y-3">
                ${pendingInvitations.map(inv => `
                    <div class="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                            <p class="font-medium text-slate-800">${inv.familyName}</p>
                            <p class="text-sm text-slate-600">Invited by ${inv.invitedByName} as ${inv.relationship}</p>
                        </div>
                        <div class="space-x-2">
                            <button class="accept-invitation-btn text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" data-invitation-id="${inv.id}">Accept</button>
                            <button class="decline-invitation-btn text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-invitation-id="${inv.id}">Decline</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    mainContainer.innerHTML = `
        <div class="text-center py-12">
            <div class="max-w-md mx-auto">
                ${invitationsHtml}
                
                <div class="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-users text-3xl text-indigo-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-4">Welcome to Family Hub</h2>
                <p class="text-slate-600 mb-8">You're not part of a family yet. Create your own family or wait for an invitation from an existing family.</p>
                
                <div class="space-y-4">
                    <button id="create-family-btn" class="w-full btn-primary">
                        <i class="fas fa-plus mr-2"></i>Create New Family
                    </button>
                    <p class="text-sm text-slate-500">Or ask a family admin to invite you using your email: <strong>${currentUser.email}</strong></p>
                </div>
            </div>
        </div>

        <!-- Create Family Modal -->
        <div id="create-family-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Create New Family</h3>
                    <form id="create-family-form">
                        <div class="mb-4">
                            <label for="family-name" class="block text-sm font-medium mb-1">Family Name</label>
                            <input type="text" id="family-name" class="input w-full" placeholder="e.g., The Smiths" required>
                        </div>
                        <div class="mb-4">
                            <label for="your-role" class="block text-sm font-medium mb-1">Your Role in the Family</label>
                            <select id="your-role" class="input w-full" required>
                                <option value="">Select your role...</option>
                                ${suggestedRoles.map(role => `<option value="${role}">${role}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" id="close-create-modal" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Create Family</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Event listeners for create family
    document.getElementById('create-family-btn').addEventListener('click', () => {
        document.getElementById('create-family-modal').classList.remove('hidden');
    });
    
    document.getElementById('close-create-modal').addEventListener('click', () => {
        document.getElementById('create-family-modal').classList.add('hidden');
    });
    
    document.getElementById('create-family-form').addEventListener('submit', handleCreateFamily);
    
    // Event listeners for invitations
    document.querySelectorAll('.accept-invitation-btn').forEach(btn => {
        btn.addEventListener('click', handleAcceptInvitation);
    });
    
    document.querySelectorAll('.decline-invitation-btn').forEach(btn => {
        btn.addEventListener('click', handleDeclineInvitation);
    });
}


// --- FAMILY TREE HELPER FUNCTIONS ---

function buildFamilyTreeData() {
    // Organize family members by relationships to create a tree structure
    const tree = {
        generations: {},
        relationships: {}
    };

    familyMembers.forEach(member => {
        const memberDetails = currentFamily.memberDetails?.[member.id] || {};
        const relationship = memberDetails.relationship || 'Family Member';
        
        // Determine generation level based on relationship
        let generation = 0;
        if (['Grandfather', 'Grandmother'].includes(relationship)) generation = -2;
        else if (['Father', 'Mother', 'Uncle', 'Aunt'].includes(relationship)) generation = -1;
        else if (['Son', 'Daughter', 'Nephew', 'Niece'].includes(relationship)) generation = 1;
        else if (['Grandson', 'Granddaughter'].includes(relationship)) generation = 2;
        
        if (!tree.generations[generation]) tree.generations[generation] = [];
        tree.generations[generation].push({
            ...member,
            relationship,
            role: memberDetails.role
        });
    });

    return tree;
}

function renderFamilyTreeHTML(treeData) {
    const generations = Object.keys(treeData.generations).sort((a, b) => parseInt(a) - parseInt(b));
    
    if (generations.length === 0) {
        return '<p class="text-center text-slate-500 py-8">No family members to display in tree view.</p>';
    }

    return generations.map(gen => {
        const members = treeData.generations[gen];
        const generationLabel = getGenerationLabel(parseInt(gen));
        
        return `
            <div class="generation-row mb-8">
                <h4 class="text-sm font-medium text-slate-600 mb-3">${generationLabel}</h4>
                <div class="flex flex-wrap gap-4 justify-center">
                    ${members.map(member => `
                        <div class="family-member-card bg-slate-50 p-4 rounded-lg border-2 border-slate-200 text-center min-w-[120px]">
                            <img src="${member.photoURL || 'https://placehold.co/60x60/E2E8F0/475569?text=' + (member.displayName?.charAt(0) || 'U')}" class="w-12 h-12 rounded-full object-cover mx-auto mb-2">
                            <p class="font-semibold text-slate-800 text-sm">${member.displayName || member.email}</p>
                            <p class="text-xs text-slate-500">${member.relationship}</p>
                            ${member.role ? `<p class="text-xs text-indigo-600 font-medium mt-1">${member.role}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function getGenerationLabel(generation) {
    switch (generation) {
        case -2: return 'Grandparents Generation';
        case -1: return 'Parents Generation';
        case 0: return 'Current Generation';
        case 1: return 'Children Generation';
        case 2: return 'Grandchildren Generation';
        default: return `Generation ${generation > 0 ? '+' : ''}${generation}`;
    }
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('tab-content');
    const isAdmin = currentFamily.admin === currentUser.uid;

    switch (tabName) {
        case 'members': renderMembersTab(contentContainer, isAdmin); break;
        case 'familyTree': renderFamilyTreeTab(contentContainer); break;
        case 'profile': renderProfileTab(contentContainer, isAdmin); break;
        case 'governance': renderGovernanceTab(contentContainer, isAdmin); break;
    }
}

// --- SPECIFIC TAB RENDERERS ---

function renderMembersTab(container, isAdmin) {
    // Get pending invitations for status display
    const pendingInvitations = currentFamily.pendingInvitations || {};
    
    const membersHtml = familyMembers.map(member => {
        const memberData = currentFamily.memberDetails?.[member.id] || {};
        const idValidation = memberData.idValidation || { status: 'not-checked', lastChecked: null };
        
        return `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <img src="${member.photoURL || 'https://placehold.co/40x40/E2E8F0/475569?text=' + (member.displayName?.charAt(0) || 'U')}" class="w-10 h-10 rounded-full object-cover mr-3">
                        <div>
                            <p class="font-semibold text-slate-800">${member.displayName || member.email || memberData.fullName}</p>
                            <p class="text-sm text-slate-500">${memberData.relationship || 'Family Member'}</p>
                            ${memberData.idNumber ? `<p class="text-xs text-slate-400">ID: ${memberData.idNumber}</p>` : ''}
                            ${memberData.directlyAdded ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Direct Add</span>' : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${memberData.role ? `<span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">${memberData.role}</span>` : ''}
                        ${memberData.idNumber ? `
                            <button class="validate-id-btn text-xs px-2 py-1 rounded ${idValidation.status === 'valid' ? 'bg-green-100 text-green-800' : idValidation.status === 'invalid' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}" 
                                    data-member-id="${member.id}" data-id-number="${memberData.idNumber}">
                                ${idValidation.status === 'valid' ? '✓ Valid' : idValidation.status === 'invalid' ? '✗ Invalid' : '📋 Check ID'}
                            </button>
                        ` : ''}
                        ${isAdmin && member.id !== currentUser.uid ? `<button class="remove-member-btn text-red-500 hover:text-red-700" data-member-id="${member.id}"><i class="fas fa-user-minus"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Show pending invitations
    const invitationsHtml = Object.entries(pendingInvitations).map(([email, data]) => `
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold text-yellow-800">${email}</p>
                    <p class="text-sm text-yellow-600">Invited as ${data.relationship} • ${data.role || 'No specific role'}</p>
                    <p class="text-xs text-yellow-500">Sent: ${new Date(data.sentAt).toLocaleDateString()}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                    ${isAdmin ? `<button class="cancel-invitation-btn text-red-500 hover:text-red-700" data-email="${email}"><i class="fas fa-times"></i></button>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-800">Family Members (${familyMembers.length})</h3>
                ${isAdmin ? `
                    <div class="space-x-2">
                        <button id="add-direct-member-btn" class="btn-secondary"><i class="fas fa-user-plus mr-2"></i>Add Member Directly</button>
                        <button id="invite-member-btn" class="btn-primary"><i class="fas fa-envelope mr-2"></i>Send Invitation</button>
                    </div>
                ` : ''}
            </div>
            
            ${Object.keys(pendingInvitations).length > 0 ? `
                <div>
                    <h4 class="text-md font-medium text-slate-700 mb-3">Pending Invitations</h4>
                    <div class="space-y-2">
                        ${invitationsHtml}
                    </div>
                </div>
            ` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${membersHtml || '<p class="text-slate-500 col-span-2 text-center py-8">No family members yet.</p>'}
            </div>
        </div>

        <!-- Add Direct Member Modal -->
        <div id="direct-member-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Add Family Member Directly</h3>
                    <p class="text-sm text-slate-600 mb-4">For family members without email addresses (children, elderly, etc.)</p>
                    <form id="direct-member-form">
                        <div class="mb-4">
                            <label for="direct-full-name" class="block text-sm font-medium mb-1">Full Name</label>
                            <input type="text" id="direct-full-name" class="input w-full" required>
                        </div>
                        <div class="mb-4">
                            <label for="direct-relationship" class="block text-sm font-medium mb-1">Relationship</label>
                            <select id="direct-relationship" class="input w-full" required>
                                <option value="">Select relationship...</option>
                                ${relationshipTypes.map(rel => `<option value="${rel}">${rel}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="direct-id-number" class="block text-sm font-medium mb-1">ID Number (Optional)</label>
                            <input type="text" id="direct-id-number" class="input w-full" placeholder="e.g., 9001010001080">
                        </div>
                        <div class="mb-4">
                            <label for="direct-date-of-birth" class="block text-sm font-medium mb-1">Date of Birth (Optional)</label>
                            <input type="date" id="direct-date-of-birth" class="input w-full">
                        </div>
                        <div class="mb-4">
                            <label for="direct-role" class="block text-sm font-medium mb-1">Role (Optional)</label>
                            <select id="direct-role" class="input w-full">
                                <option value="">No specific role</option>
                                ${suggestedRoles.map(role => `<option value="${role}">${role}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" id="close-direct-member-modal" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Add Member</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Invite Member Modal -->
        <div id="invite-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Invite Family Member</h3>
                    <form id="invite-form">
                        <div class="mb-4">
                            <label for="member-email" class="block text-sm font-medium mb-1">Email Address</label>
                            <input type="email" id="member-email" class="input w-full" required>
                        </div>
                        <div class="mb-4">
                            <label for="member-relationship" class="block text-sm font-medium mb-1">Relationship</label>
                            <select id="member-relationship" class="input w-full" required>
                                <option value="">Select relationship...</option>
                                ${relationshipTypes.map(rel => `<option value="${rel}">${rel}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="member-role" class="block text-sm font-medium mb-1">Role (Optional)</label>
                            <select id="member-role" class="input w-full">
                                <option value="">No specific role</option>
                                ${suggestedRoles.map(role => `<option value="${role}">${role}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" id="close-invite-modal" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Send Invitation</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    if (isAdmin) {
        document.getElementById('add-direct-member-btn')?.addEventListener('click', () => {
            document.getElementById('direct-member-modal').classList.remove('hidden');
        });
        
        document.getElementById('close-direct-member-modal')?.addEventListener('click', () => {
            document.getElementById('direct-member-modal').classList.add('hidden');
        });
        
        document.getElementById('direct-member-form')?.addEventListener('submit', handleAddDirectMember);
        
        document.getElementById('invite-member-btn')?.addEventListener('click', () => {
            document.getElementById('invite-modal').classList.remove('hidden');
        });
        
        document.getElementById('close-invite-modal')?.addEventListener('click', () => {
            document.getElementById('invite-modal').classList.add('hidden');
        });
        
        document.getElementById('invite-form')?.addEventListener('submit', handleInviteMember);
        
        document.querySelectorAll('.remove-member-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveMember);
        });
        
        document.querySelectorAll('.cancel-invitation-btn').forEach(btn => {
            btn.addEventListener('click', handleCancelInvitation);
        });
    }
    
    // ID validation buttons for all users
    document.querySelectorAll('.validate-id-btn').forEach(btn => {
        btn.addEventListener('click', handleValidateId);
    });
}

function renderFamilyTreeTab(container) {
    // Create a visual family tree based on relationships
    const treeData = buildFamilyTreeData();
    
    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-800">Family Tree</h3>
                <button id="expand-tree-btn" class="btn-secondary"><i class="fas fa-expand-arrows-alt mr-2"></i>Expand View</button>
            </div>
            <div id="family-tree-container" class="bg-white p-6 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                ${renderFamilyTreeHTML(treeData)}
            </div>
        </div>
    `;

    document.getElementById('expand-tree-btn')?.addEventListener('click', () => {
        // Toggle full-screen tree view
        const container = document.getElementById('family-tree-container');
        container.classList.toggle('fixed');
        container.classList.toggle('inset-0');
        container.classList.toggle('z-50');
        container.classList.toggle('bg-white');
    });
}

function renderProfileTab(container, isAdmin) {
    const profile = currentFamily.profile || {};
    const customFields = profile.customFields || {};
    const formalEntities = profile.formalEntities || [];
    const informalEntities = profile.informalEntities || [];

    const renderCustomFields = () => {
        return Object.entries(customFields).map(([category, fields]) => `
            <div class="mb-6 p-4 bg-slate-50 rounded-lg">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-semibold text-slate-800">${category}</h4>
                    ${isAdmin ? `<button class="remove-category-btn text-red-500 text-sm" data-category="${category}">Remove Category</button>` : ''}
                </div>
                ${Object.entries(fields).map(([fieldName, value]) => `
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-slate-700 mb-1">${fieldName}</label>
                        <textarea class="input w-full custom-field-input" data-category="${category}" data-field="${fieldName}" ${!isAdmin ? 'readonly' : ''}>${value}</textarea>
                    </div>
                `).join('')}
                ${isAdmin ? `
                    <div class="mt-3 pt-3 border-t">
                        <div class="flex gap-2">
                            <input type="text" placeholder="Field name" class="input flex-1 new-field-name" data-category="${category}">
                            <button class="btn-secondary add-field-btn" data-category="${category}">Add Field</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    };

    const renderEntityCard = (entity, index, type) => {
        const registrationRequirements = getRegistrationRequirements(entity, type);
        return `
            <div class="entity-card p-4 border border-slate-200 rounded-lg mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-slate-800">${entity.name}</h4>
                        <p class="text-sm text-slate-500">${entity.type} • ${entity.status}</p>
                        ${entity.description ? `<p class="text-sm text-slate-600 mt-1">${entity.description}</p>` : ''}
                    </div>
                    ${isAdmin ? `<button class="remove-entity-btn text-red-500 text-sm" data-type="${type}" data-index="${index}">Remove</button>` : ''}
                </div>
                
                ${entity.website ? `<p class="text-sm"><strong>Website:</strong> <a href="${entity.website}" target="_blank" class="text-indigo-600">${entity.website}</a></p>` : ''}
                ${entity.yearStarted ? `<p class="text-sm"><strong>Started:</strong> ${entity.yearStarted}</p>` : ''}
                ${entity.members ? `<p class="text-sm"><strong>Family Members Involved:</strong> ${entity.members}</p>` : ''}
                ${entity.revenue ? `<p class="text-sm"><strong>Annual Revenue:</strong> R${entity.revenue}</p>` : ''}
                
                ${registrationRequirements.show ? `
                    <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h5 class="font-medium text-blue-800 mb-2">Registration Assessment</h5>
                        <p class="text-sm text-blue-700 mb-2"><strong>Readiness:</strong> ${registrationRequirements.readiness}</p>
                        <p class="text-sm text-blue-700 mb-2"><strong>Recommended Path:</strong> ${registrationRequirements.recommendedPath}</p>
                        <details class="text-sm">
                            <summary class="cursor-pointer text-blue-600 font-medium">View Requirements</summary>
                            <ul class="mt-2 ml-4 list-disc text-blue-600">
                                ${registrationRequirements.requirements.map(req => `<li>${req}</li>`).join('')}
                            </ul>
                        </details>
                        ${registrationRequirements.benefits.length > 0 ? `
                            <details class="text-sm mt-2">
                                <summary class="cursor-pointer text-green-600 font-medium">Registration Benefits</summary>
                                <ul class="mt-2 ml-4 list-disc text-green-600">
                                    ${registrationRequirements.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                </ul>
                            </details>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    };

    container.innerHTML = `
        <div class="space-y-8">
            <!-- Basic Family Information -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-4">Basic Family Information</h3>
                <form id="family-profile-form">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="mb-4">
                            <label for="family-name-input" class="block text-sm font-medium mb-1">Family Name</label>
                            <input type="text" id="family-name-input" value="${currentFamily.name}" class="input w-full" ${!isAdmin ? 'readonly' : ''}>
                        </div>
                        <div class="mb-4">
                            <label for="family-motto" class="block text-sm font-medium mb-1">Family Motto</label>
                            <input type="text" id="family-motto" value="${profile.motto || ''}" class="input w-full" placeholder="e.g., Unity in Diversity" ${!isAdmin ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label for="family-summary" class="block text-sm font-medium mb-1">Family Summary</label>
                        <textarea id="family-summary" rows="3" class="input w-full" placeholder="Describe your family's history, background, or ethos..." ${!isAdmin ? 'readonly' : ''}>${profile.summary || ''}</textarea>
                    </div>
                    <div class="mb-4">
                        <label for="family-mission" class="block text-sm font-medium mb-1">Mission / Vision</label>
                        <textarea id="family-mission" rows="3" class="input w-full" placeholder="What is your family's purpose or guiding principle?" ${!isAdmin ? 'readonly' : ''}>${profile.mission || ''}</textarea>
                    </div>
                    <div class="mb-4">
                        <label for="family-values" class="block text-sm font-medium mb-1">Core Values</label>
                        <input type="text" id="family-values" value="${(profile.values || []).join(', ')}" placeholder="e.g. Integrity, Respect, Ubuntu" class="input w-full" ${!isAdmin ? 'readonly' : ''}>
                    </div>
                    ${isAdmin ? '<div class="text-right"><button type="submit" class="btn-primary">Save Basic Info</button></div>' : ''}
                </form>
            </div>

            <!-- Custom Profile Fields -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-lg text-slate-800">Family Story & Heritage</h3>
                    ${isAdmin ? '<button id="add-custom-category-btn" class="btn-secondary"><i class="fas fa-plus mr-2"></i>Add Category</button>' : ''}
                </div>
                <div id="custom-fields-container">
                    ${renderCustomFields()}
                    ${Object.keys(customFields).length === 0 ? '<p class="text-slate-500 text-center py-4">No custom fields added yet. Click "Add Category" to start telling your family story.</p>' : ''}
                </div>
            </div>

            <!-- Formal Entities -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-lg text-slate-800">Formal Entities</h3>
                    ${isAdmin ? '<button id="add-formal-entity-btn" class="btn-secondary"><i class="fas fa-building mr-2"></i>Add Formal Entity</button>' : ''}
                </div>
                <div id="formal-entities-container">
                    ${formalEntities.map((entity, index) => renderEntityCard(entity, index, 'formal')).join('')}
                    ${formalEntities.length === 0 ? '<p class="text-slate-500 text-center py-4">No formal entities listed.</p>' : ''}
                </div>
            </div>

            <!-- Informal Entities & Initiatives -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-lg text-slate-800">Informal Entities & Initiatives</h3>
                    ${isAdmin ? '<button id="add-informal-entity-btn" class="btn-secondary"><i class="fas fa-lightbulb mr-2"></i>Add Initiative</button>' : ''}
                </div>
                <div id="informal-entities-container">
                    ${informalEntities.map((entity, index) => renderEntityCard(entity, index, 'informal')).join('')}
                    ${informalEntities.length === 0 ? '<p class="text-slate-500 text-center py-4">No informal entities or initiatives listed.</p>' : ''}
                </div>
            </div>
        </div>

        ${isAdmin ? `
            <!-- Add Custom Category Modal -->
            <div id="custom-category-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 class="text-lg font-semibold mb-4">Add Custom Category</h3>
                        <form id="custom-category-form">
                            <div class="mb-4">
                                <label for="category-type" class="block text-sm font-medium mb-1">Category Type</label>
                                <select id="category-type" class="input w-full" required>
                                    <option value="">Select category type...</option>
                                    ${Object.keys(profileFieldCategories).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-4" id="custom-category-name-container" style="display: none;">
                                <label for="custom-category-name" class="block text-sm font-medium mb-1">Custom Category Name</label>
                                <input type="text" id="custom-category-name" class="input w-full" placeholder="Enter custom category name">
                            </div>
                            <div class="flex justify-end space-x-3">
                                <button type="button" id="close-category-modal" class="btn-secondary">Cancel</button>
                                <button type="submit" class="btn-primary">Add Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Add Entity Modal -->
            <div id="entity-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-4" id="entity-modal-title">Add Entity</h3>
                        <form id="entity-form">
                            <input type="hidden" id="entity-type-hidden">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="mb-4">
                                    <label for="entity-name" class="block text-sm font-medium mb-1">Entity Name</label>
                                    <input type="text" id="entity-name" class="input w-full" required>
                                </div>
                                <div class="mb-4">
                                    <label for="entity-category" class="block text-sm font-medium mb-1">Type/Category</label>
                                    <select id="entity-category" class="input w-full" required>
                                        <option value="">Select type...</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="entity-status" class="block text-sm font-medium mb-1">Current Status</label>
                                    <select id="entity-status" class="input w-full" required>
                                        <option value="">Select status...</option>
                                        ${entityStatuses.map(status => `<option value="${status}">${status}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="entity-year-started" class="block text-sm font-medium mb-1">Year Started</label>
                                    <input type="number" id="entity-year-started" class="input w-full" min="1900" max="2030">
                                </div>
                                <div class="mb-4">
                                    <label for="entity-website" class="block text-sm font-medium mb-1">Website (Optional)</label>
                                    <input type="url" id="entity-website" class="input w-full" placeholder="https://example.com">
                                </div>
                                <div class="mb-4">
                                    <label for="entity-members" class="block text-sm font-medium mb-1">Family Members Involved</label>
                                    <input type="text" id="entity-members" class="input w-full" placeholder="e.g., John, Mary, Peter">
                                </div>
                                <div class="mb-4 md:col-span-2">
                                    <label for="entity-description" class="block text-sm font-medium mb-1">Description</label>
                                    <textarea id="entity-description" rows="3" class="input w-full" placeholder="Describe the entity's purpose and activities..."></textarea>
                                </div>
                                <div class="mb-4">
                                    <label for="entity-revenue" class="block text-sm font-medium mb-1">Annual Revenue (ZAR)</label>
                                    <input type="number" id="entity-revenue" class="input w-full" placeholder="0" min="0">
                                </div>
                                <div class="mb-4">
                                    <label for="entity-employees" class="block text-sm font-medium mb-1">Number of Employees</label>
                                    <input type="number" id="entity-employees" class="input w-full" placeholder="0" min="0">
                                </div>
                            </div>
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" id="close-entity-modal" class="btn-secondary">Cancel</button>
                                <button type="submit" class="btn-primary">Add Entity</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        ` : ''}
    `;

    // Event listeners
    if (isAdmin) {
        setupProfileEventListeners();
    }
}

function renderGovernanceTab(container, isAdmin) {
    // FIX: Ensure governance.assignments is an array before mapping.
    const governance = currentFamily.governance || {};
    const assignments = governance.assignments || [];

    const rolesHtml = assignments.map(a => {
        const member = familyMembers.find(m => m && m.id === a.memberId);
        if (!member) return '';
        return `
            <div class="p-4 bg-slate-50 rounded-md">
                <p class="font-bold text-slate-800">${a.roleTitle}</p>
                <p class="text-sm text-slate-600">Assigned to: <span class="font-semibold">${member.profile?.displayName}</span></p>
                <p class="text-xs text-slate-500">Since: ${a.startDate}</p>
                <p class="text-sm mt-2 whitespace-pre-wrap">${a.duties}</p>
            </div>`;
    }).join('');

    const memberOptions = familyMembers.map(m => `<option value="${m.id}">${m.profile?.displayName || m.email}</option>`).join('');
    const roleOptions = suggestedRoles.map(r => `<option value="${r}"></option>`).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Assigned Roles & Responsibilities</h3>
                <div class="space-y-3">${rolesHtml || '<p class="text-sm text-slate-500">No roles assigned yet.</p>'}</div>
            </div>
            ${isAdmin ? `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Assign a New Role</h3>
                <form id="assign-role-form">
                    <div class="mb-4">
                        <label for="role-title" class="block text-sm font-medium">Role Title (Select or type custom)</label>
                        <input type="text" id="role-title" list="suggested-roles" required class="mt-1 block w-full input" placeholder="e.g., CEO or Mentor">
                        <datalist id="suggested-roles">${roleOptions}</datalist>
                    </div>
                    <div class="mb-4"><label for="assign-to" class="block text-sm font-medium">Assign to Member</label><select id="assign-to" class="mt-1 block w-full input">${memberOptions}</select></div>
                    <div class="mb-4"><label for="start-date" class="block text-sm font-medium">Start Date</label><input type="date" id="start-date" required class="mt-1 block w-full input"></div>
                    <div class="mb-4"><label for="duties" class="block text-sm font-medium">Duties & Responsibilities</label><textarea id="duties" rows="4" class="mt-1 block w-full input" placeholder="Describe key responsibilities..."></textarea></div>
                    <button type="submit" class="mt-4 w-full btn-primary">Assign Role</button>
                </form>
            </div>` : ''}
        </div>`;

    if (isAdmin) {
        document.getElementById('assign-role-form').addEventListener('submit', handleAssignRole);
        document.getElementById('role-title').addEventListener('input', (e) => {
            const duties = suggestedDuties[e.target.value];
            document.getElementById('duties').value = duties ? duties.map(d => `- ${d}`).join('\n') : '';
        });
    }
}


// --- EVENT HANDLERS & LOGIC ---

async function handleCreateFamily(e) {
    e.preventDefault();
    const form = e.target;
    const familyName = form.querySelector('#family-name').value;
    const userRole = form.querySelector('#your-role').value;
    
    try {
        // Create family document
        const familyData = {
            name: familyName,
            admin: currentUser.uid,
            members: [currentUser.uid],
            memberDetails: {
                [currentUser.uid]: {
                    relationship: 'Head of Family',
                    role: userRole,
                    joinedDate: new Date().toISOString()
                }
            },
            profile: {
                summary: '',
                mission: '',
                values: [],
                formalEntities: []
            },
            governance: {
                assignments: [{
                    roleTitle: userRole,
                    memberId: currentUser.uid,
                    startDate: new Date().toISOString(),
                    duties: suggestedDuties[userRole]?.join(', ') || ''
                }]
            },
            createdAt: new Date().toISOString()
        };
        
        const familyDoc = await addDocument('families', familyData);
        
        // Create or update user document with family ID
        await saveDocument('users', currentUser.uid, { 
            familyId: familyDoc.id,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            photoURL: currentUser.photoURL || null,
            lastUpdated: new Date().toISOString()
        });
        
        // Close modal
        document.getElementById('create-family-modal').classList.add('hidden');
        
        alert('Family created successfully!');
    } catch (error) {
        console.error('Error creating family:', error);
        alert('Failed to create family. Please try again.');
    }
}

async function handleInviteMember(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('#member-email').value;
    const relationship = form.querySelector('#member-relationship').value;
    const role = form.querySelector('#member-role').value;
    
    try {
        // Create invitation record
        const invitationData = {
            familyId: currentFamily.id,
            familyName: currentFamily.name,
            invitedEmail: email,
            relationship: relationship,
            role: role,
            invitedBy: currentUser.uid,
            invitedByName: currentUser.displayName || currentUser.email,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        await addDocument('familyInvitations', invitationData);
        
        // Also track in family document for quick display
        const updatedInvitations = {
            ...(currentFamily.pendingInvitations || {}),
            [email]: {
                relationship: relationship,
                role: role,
                sentAt: new Date().toISOString(),
                sentBy: currentUser.displayName || currentUser.email
            }
        };
        
        await updateDocument('families', currentFamily.id, {
            pendingInvitations: updatedInvitations
        });
        
        // Close modal and reset form
        document.getElementById('invite-modal').classList.add('hidden');
        form.reset();
        
        alert(`Invitation sent to ${email}! They will be notified to join the family.`);
    } catch (error) {
        console.error('Error sending invitation:', error);
        alert('Failed to send invitation. Please try again.');
    }
}

async function handleRemoveMember(e) {
    const memberId = e.target.closest('.remove-member-btn').dataset.memberId;
    
    if (!confirm('Are you sure you want to remove this member from the family?')) {
        return;
    }
    
    try {
        // Remove member from family
        const updatedMembers = currentFamily.members.filter(id => id !== memberId);
        const updatedMemberDetails = { ...currentFamily.memberDetails };
        delete updatedMemberDetails[memberId];
        
        await updateDocument('families', currentFamily.id, {
            members: updatedMembers,
            memberDetails: updatedMemberDetails
        });
        
        // Remove family ID from user
        await saveDocument('users', memberId, { 
            familyId: null,
            lastUpdated: new Date().toISOString()
        });
        
        alert('Member removed from family.');
    } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
    }
}

async function handleAcceptInvitation(e) {
    const invitationId = e.target.dataset.invitationId;
    
    try {
        // Get the invitation details
        const invitationDoc = await getDocument('familyInvitations', invitationId);
        if (!invitationDoc) return;
        
        // Add user to family
        const familyDoc = await getDocument('families', invitationDoc.familyId);
        const updatedMembers = [...(familyDoc.members || []), currentUser.uid];
        const updatedMemberDetails = {
            ...familyDoc.memberDetails,
            [currentUser.uid]: {
                relationship: invitationDoc.relationship,
                role: invitationDoc.role,
                joinedDate: new Date().toISOString()
            }
        };
        
        await updateDocument('families', invitationDoc.familyId, {
            members: updatedMembers,
            memberDetails: updatedMemberDetails
        });
        
        // Update user with family ID
        await saveDocument('users', currentUser.uid, {
            familyId: invitationDoc.familyId,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            photoURL: currentUser.photoURL || null,
            lastUpdated: new Date().toISOString()
        });
        
        // Mark invitation as accepted
        await updateDocument('familyInvitations', invitationId, {
            status: 'accepted',
            acceptedAt: new Date().toISOString()
        });
        
        alert('Family invitation accepted! Welcome to the family.');
    } catch (error) {
        console.error('Error accepting invitation:', error);
        alert('Failed to accept invitation. Please try again.');
    }
}

async function handleDeclineInvitation(e) {
    const invitationId = e.target.dataset.invitationId;
    
    if (!confirm('Are you sure you want to decline this family invitation?')) {
        return;
    }
    
    try {
        await updateDocument('familyInvitations', invitationId, {
            status: 'declined',
            declinedAt: new Date().toISOString()
        });
        
        // Refresh the individual view
        renderIndividualView();
        
        alert('Family invitation declined.');
    } catch (error) {
        console.error('Error declining invitation:', error);
        alert('Failed to decline invitation. Please try again.');
    }
}

async function handleAddDirectMember(e) {
    e.preventDefault();
    const form = e.target;
    const fullName = form.querySelector('#direct-full-name').value;
    const relationship = form.querySelector('#direct-relationship').value;
    const idNumber = form.querySelector('#direct-id-number').value;
    const dateOfBirth = form.querySelector('#direct-date-of-birth').value;
    const role = form.querySelector('#direct-role').value;
    
    try {
        // Generate a unique ID for the direct member
        const memberId = `direct_${Date.now()}`;
        
        // Add to family members list
        const updatedMembers = [...(currentFamily.members || []), memberId];
        const updatedMemberDetails = {
            ...currentFamily.memberDetails,
            [memberId]: {
                fullName: fullName,
                relationship: relationship,
                role: role,
                idNumber: idNumber,
                dateOfBirth: dateOfBirth,
                directlyAdded: true,
                addedBy: currentUser.uid,
                joinedDate: new Date().toISOString()
            }
        };
        
        await updateDocument('families', currentFamily.id, {
            members: updatedMembers,
            memberDetails: updatedMemberDetails
        });
        
        // Close modal and reset form
        document.getElementById('direct-member-modal').classList.add('hidden');
        form.reset();
        
        alert(`${fullName} has been added to the family!`);
    } catch (error) {
        console.error('Error adding direct member:', error);
        alert('Failed to add family member. Please try again.');
    }
}

async function handleCancelInvitation(e) {
    const email = e.target.dataset.email;
    
    if (!confirm(`Are you sure you want to cancel the invitation to ${email}?`)) {
        return;
    }
    
    try {
        const updatedInvitations = { ...currentFamily.pendingInvitations };
        delete updatedInvitations[email];
        
        await updateDocument('families', currentFamily.id, {
            pendingInvitations: updatedInvitations
        });
        
        alert('Invitation cancelled.');
    } catch (error) {
        console.error('Error cancelling invitation:', error);
        alert('Failed to cancel invitation. Please try again.');
    }
}

async function handleValidateId(e) {
    const memberId = e.target.dataset.memberId;
    const idNumber = e.target.dataset.idNumber;
    
    if (!idNumber) {
        alert('No ID number to validate.');
        return;
    }
    
    try {
        // Simple SA ID validation logic (can be enhanced)
        const isValid = validateSouthAfricanId(idNumber);
        
        // Update member details with validation result
        const updatedMemberDetails = {
            ...currentFamily.memberDetails,
            [memberId]: {
                ...currentFamily.memberDetails[memberId],
                idValidation: {
                    status: isValid ? 'valid' : 'invalid',
                    lastChecked: new Date().toISOString(),
                    method: 'local-validation'
                }
            }
        };
        
        await updateDocument('families', currentFamily.id, {
            memberDetails: updatedMemberDetails
        });
        
        // Update button appearance
        e.target.textContent = isValid ? '✓ Valid' : '✗ Invalid';
        e.target.className = `validate-id-btn text-xs px-2 py-1 rounded ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
        
    } catch (error) {
        console.error('Error validating ID:', error);
        alert('Failed to validate ID. Please try again.');
    }
}

function validateSouthAfricanId(idNumber) {
    // Basic South African ID validation
    if (!/^\d{13}$/.test(idNumber)) return false;
    
    // Check date validity
    const year = parseInt(idNumber.substring(0, 2));
    const month = parseInt(idNumber.substring(2, 4));
    const day = parseInt(idNumber.substring(4, 6));
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Luhn algorithm check for last digit
    const digits = idNumber.split('').map(d => parseInt(d));
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
            sum += digits[i];
        } else {
            const doubled = digits[i] * 2;
            sum += doubled > 9 ? doubled - 9 : doubled;
        }
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return checkDigit === digits[12];
}

function getRegistrationRequirements(entity, type) {
    const requirements = {
        show: type === 'informal' && ['Active (Unregistered)', 'Planning Phase'].includes(entity.status),
        readiness: 'Not Ready',
        recommendedPath: 'Continue as Informal',
        requirements: [],
        benefits: []
    };
    
    if (!requirements.show) return requirements;
    
    const revenue = parseInt(entity.revenue) || 0;
    const hasWebsite = !!entity.website;
    const hasDescription = !!entity.description;
    const yearsDuration = entity.yearStarted ? new Date().getFullYear() - parseInt(entity.yearStarted) : 0;
    
    // Determine readiness and path
    if (revenue > 1000000) {
        requirements.readiness = 'Ready for Registration';
        requirements.recommendedPath = 'Private Company (Pty Ltd)';
        requirements.requirements = [
            'Company name reservation (R50)',
            'Memorandum of Incorporation',
            'Initial share capital (min R1)',
            'Company registration (R175)',
            'Directors and shareholders details',
            'Registered office address'
        ];
        requirements.benefits = [
            'Limited liability protection',
            'Tax benefits and deductions',
            'Professional credibility',
            'Easier access to funding',
            'Separate legal entity status'
        ];
    } else if (revenue < 100000 && entity.description?.toLowerCase().includes('community')) {
        requirements.readiness = 'Suitable for NPO';
        requirements.recommendedPath = 'Non-Profit Organization';
        requirements.requirements = [
            'NPO constitution',
            'Three founding members',
            'Registered office address',
            'NPO registration (Free)',
            'Tax exemption application (if needed)',
            'Annual reporting compliance'
        ];
        requirements.benefits = [
            'Tax exemption on donations',
            'Access to grant funding',
            'Public trust and credibility',
            'Donation tax certificates'
        ];
    } else if (hasWebsite && hasDescription && yearsDuration >= 1) {
        requirements.readiness = 'Consider Registration';
        requirements.recommendedPath = 'Close Corporation or Trust';
        requirements.requirements = [
            'Business plan documentation',
            'Financial records (12 months)',
            'Member agreements',
            'Registration fees (R200-R500)',
            'Tax registration'
        ];
        requirements.benefits = [
            'Formal business structure',
            'Tax planning opportunities',
            'Asset protection',
            'Business banking facilities'
        ];
    }
    
    return requirements;
}

function setupProfileEventListeners() {
    // Basic profile form
    document.getElementById('family-profile-form')?.addEventListener('submit', handleProfileUpdate);
    
    // Custom category management
    document.getElementById('add-custom-category-btn')?.addEventListener('click', () => {
        document.getElementById('custom-category-modal').classList.remove('hidden');
    });
    
    document.getElementById('close-category-modal')?.addEventListener('click', () => {
        document.getElementById('custom-category-modal').classList.add('hidden');
    });
    
    document.getElementById('category-type')?.addEventListener('change', (e) => {
        const customContainer = document.getElementById('custom-category-name-container');
        if (e.target.value === 'Custom') {
            customContainer.style.display = 'block';
        } else {
            customContainer.style.display = 'none';
        }
    });
    
    document.getElementById('custom-category-form')?.addEventListener('submit', handleAddCustomCategory);
    
    // Entity management
    document.getElementById('add-formal-entity-btn')?.addEventListener('click', () => {
        openEntityModal('formal');
    });
    
    document.getElementById('add-informal-entity-btn')?.addEventListener('click', () => {
        openEntityModal('informal');
    });
    
    document.getElementById('close-entity-modal')?.addEventListener('click', () => {
        document.getElementById('entity-modal').classList.add('hidden');
    });
    
    document.getElementById('entity-form')?.addEventListener('submit', handleAddEntity);
    
    // Dynamic field management
    document.querySelectorAll('.custom-field-input').forEach(input => {
        input.addEventListener('blur', handleCustomFieldUpdate);
    });
    
    document.querySelectorAll('.add-field-btn').forEach(btn => {
        btn.addEventListener('click', handleAddCustomField);
    });
    
    document.querySelectorAll('.remove-category-btn').forEach(btn => {
        btn.addEventListener('click', handleRemoveCategory);
    });
    
    document.querySelectorAll('.remove-entity-btn').forEach(btn => {
        btn.addEventListener('click', handleRemoveEntity);
    });
}

function openEntityModal(type) {
    const modal = document.getElementById('entity-modal');
    const title = document.getElementById('entity-modal-title');
    const categorySelect = document.getElementById('entity-category');
    const typeHidden = document.getElementById('entity-type-hidden');
    
    typeHidden.value = type;
    title.textContent = type === 'formal' ? 'Add Formal Entity' : 'Add Informal Initiative';
    
    // Populate category options
    categorySelect.innerHTML = '<option value="">Select type...</option>';
    entityTypes[type].forEach(entityType => {
        categorySelect.innerHTML += `<option value="${entityType}">${entityType}</option>`;
    });
    
    modal.classList.remove('hidden');
}

async function handleAddCustomCategory(e) {
    e.preventDefault();
    const form = e.target;
    const categoryType = form.querySelector('#category-type').value;
    const customName = form.querySelector('#custom-category-name').value;
    
    const categoryName = categoryType === 'Custom' ? customName : categoryType;
    
    if (!categoryName) {
        alert('Please select or enter a category name.');
        return;
    }
    
    try {
        const updatedCustomFields = {
            ...(currentFamily.profile?.customFields || {}),
            [categoryName]: {}
        };
        
        await updateDocument('families', currentFamily.id, {
            'profile.customFields': updatedCustomFields
        });
        
        document.getElementById('custom-category-modal').classList.add('hidden');
        form.reset();
        
    } catch (error) {
        console.error('Error adding custom category:', error);
        alert('Failed to add category. Please try again.');
    }
}

async function handleAddCustomField(e) {
    const category = e.target.dataset.category;
    const fieldNameInput = document.querySelector(`[data-category="${category}"].new-field-name`);
    const fieldName = fieldNameInput.value.trim();
    
    if (!fieldName) {
        alert('Please enter a field name.');
        return;
    }
    
    try {
        const updatedCustomFields = {
            ...(currentFamily.profile?.customFields || {}),
            [category]: {
                ...(currentFamily.profile?.customFields?.[category] || {}),
                [fieldName]: ''
            }
        };
        
        await updateDocument('families', currentFamily.id, {
            'profile.customFields': updatedCustomFields
        });
        
        fieldNameInput.value = '';
        
    } catch (error) {
        console.error('Error adding custom field:', error);
        alert('Failed to add field. Please try again.');
    }
}

async function handleCustomFieldUpdate(e) {
    const category = e.target.dataset.category;
    const field = e.target.dataset.field;
    const value = e.target.value;
    
    try {
        const updatedCustomFields = {
            ...(currentFamily.profile?.customFields || {}),
            [category]: {
                ...(currentFamily.profile?.customFields?.[category] || {}),
                [field]: value
            }
        };
        
        await updateDocument('families', currentFamily.id, {
            'profile.customFields': updatedCustomFields
        });
        
    } catch (error) {
        console.error('Error updating custom field:', error);
    }
}

async function handleRemoveCategory(e) {
    const category = e.target.dataset.category;
    
    if (!confirm(`Are you sure you want to remove the "${category}" category and all its fields?`)) {
        return;
    }
    
    try {
        const updatedCustomFields = { ...(currentFamily.profile?.customFields || {}) };
        delete updatedCustomFields[category];
        
        await updateDocument('families', currentFamily.id, {
            'profile.customFields': updatedCustomFields
        });
        
    } catch (error) {
        console.error('Error removing category:', error);
        alert('Failed to remove category. Please try again.');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('family-name-input').value;
    const summary = document.getElementById('family-summary').value;
    const mission = document.getElementById('family-mission').value;
    const values = document.getElementById('family-values').value.split(',').map(v => v.trim()).filter(Boolean);
    
    try {
        await updateDocument('families', currentFamily.id, {
            name: newName,
            'profile.summary': summary,
            'profile.mission': mission,
            'profile.values': values
        });
        alert("Family profile saved.");
    } catch (error) {
        console.error("Profile update failed:", error);
        alert("Could not save profile changes.");
    }
}

async function handleAddEntity(e) {
    e.preventDefault();
    const form = e.target;
    const newEntity = {
        name: form.querySelector('#entity-name').value,
        type: form.querySelector('#entity-type').value,
    };
    const updatedEntities = [...(currentFamily.profile?.formalEntities || []), newEntity];
    try {
        await updateDocument('families', currentFamily.id, { 'profile.formalEntities': updatedEntities });
        form.reset();
    } catch (error) {
        console.error("Error adding entity:", error);
        alert("Failed to add entity.");
    }
}

async function handleRemoveEntity(e) {
    const indexToRemove = parseInt(e.target.dataset.index);
    const updatedEntities = (currentFamily.profile?.formalEntities || []).filter((_, index) => index !== indexToRemove);
    try {
        await updateDocument('families', currentFamily.id, { 'profile.formalEntities': updatedEntities });
    } catch (error) {
        console.error("Error removing entity:", error);
        alert("Failed to remove entity.");
    }
}

async function handleAssignRole(e) {
    e.preventDefault();
    const form = e.target;
    const newAssignment = {
        roleTitle: form.querySelector('#role-title').value,
        memberId: form.querySelector('#assign-to').value,
        startDate: form.querySelector('#start-date').value,
        duties: form.querySelector('#duties').value,
    };

    const updatedAssignments = [...(currentFamily.governance?.assignments || []), newAssignment];
    try {
        await updateDocument('families', currentFamily.id, { 'governance.assignments': updatedAssignments });
        alert("Role assigned successfully!");
        form.reset();
    } catch (error) {
        console.error("Error assigning role:", error);
        alert("Failed to assign role.");
    }
}

// Initialize the Family Hub when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing Family Hub...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated, initializing Family Hub for:', user.email);
            init(user);
        } else {
            console.log('No user authenticated');
        }
    });
});

// Also listen for auth state changes directly
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Auth state changed, user authenticated:', user.email);
        init(user);
    }
});
