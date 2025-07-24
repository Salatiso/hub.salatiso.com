/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (Governance & Profile Complete)             */
/* PURPOSE: Manages the full family structure, including a rich profile, flexible     */
/* governance, custom roles, and member management.                                  */
/* FIX: Corrected the error on the Governance tab for new families.                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, addDocument } from '../database.js';
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
    const membersHtml = familyMembers.map(member => {
        const memberData = currentFamily.memberDetails?.[member.id] || {};
        return `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <img src="${member.photoURL || 'https://placehold.co/40x40/E2E8F0/475569?text=' + (member.displayName?.charAt(0) || 'U')}" class="w-10 h-10 rounded-full object-cover mr-3">
                        <div>
                            <p class="font-semibold text-slate-800">${member.displayName || member.email}</p>
                            <p class="text-sm text-slate-500">${memberData.relationship || 'Family Member'}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${memberData.role ? `<span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">${memberData.role}</span>` : ''}
                        ${isAdmin && member.id !== currentUser.uid ? `<button class="remove-member-btn text-red-500 hover:text-red-700" data-member-id="${member.id}"><i class="fas fa-user-minus"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-800">Family Members (${familyMembers.length})</h3>
                ${isAdmin ? `<button id="invite-member-btn" class="btn-primary"><i class="fas fa-user-plus mr-2"></i>Invite Member</button>` : ''}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${membersHtml || '<p class="text-slate-500 col-span-2 text-center py-8">No family members yet.</p>'}
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
    }
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
    const entities = profile.formalEntities || [];

    const entitiesHtml = entities.map((entity, index) => `
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-md">
            <div>
                <p class="font-semibold text-slate-800">${entity.name}</p>
                <p class="text-sm text-slate-500">${entity.type}</p>
            </div>
            ${isAdmin ? `<button class="remove-entity-btn text-red-500 text-sm" data-index="${index}">&times; Remove</button>` : ''}
        </div>`).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-4">Family Profile & Story</h3>
                <form id="family-profile-form">
                    <div class="mb-4"><label for="family-name-input" class="block text-sm font-medium">Family Name</label><input type="text" id="family-name-input" value="${currentFamily.name}" class="mt-1 block w-full input"></div>
                    <div class="mb-4"><label for="family-summary" class="block text-sm font-medium">Family Summary</label><textarea id="family-summary" rows="3" class="mt-1 block w-full input" placeholder="Describe your family's history, background, or ethos...">${profile.summary || ''}</textarea></div>
                    <div class="mb-4"><label for="family-mission" class="block text-sm font-medium">Mission / Vision</label><textarea id="family-mission" rows="3" class="mt-1 block w-full input" placeholder="What is your family's purpose or guiding principle?">${profile.mission || ''}</textarea></div>
                    <div class="mb-4"><label for="family-values" class="block text-sm font-medium">Core Values</label><input type="text" id="family-values" value="${(profile.values || []).join(', ')}" placeholder="e.g. Integrity, Respect, Ubuntu" class="mt-1 block w-full input"></div>
                    <div class="mt-6 text-right"><button type="submit" class="btn-primary">Save Profile</button></div>
                </form>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-4">Formal Entities</h3>
                <div id="entities-list" class="space-y-2 mb-4">${entitiesHtml || '<p class="text-sm text-slate-500">No formal entities listed.</p>'}</div>
                ${isAdmin ? `
                <form id="add-entity-form" class="border-t pt-4">
                    <p class="text-sm font-medium mb-2">Add a New Entity</p>
                    <div class="flex gap-2">
                        <input type="text" id="entity-name" placeholder="Entity Name" class="block w-full input" required>
                        <input type="text" id="entity-type" placeholder="Type (e.g., Trust, Company)" class="block w-full input" required>
                    </div>
                    <button type="submit" class="mt-3 w-full btn-secondary">Add Entity</button>
                </form>` : ''}
            </div>
        </div>`;
    if (isAdmin) {
        document.getElementById('family-profile-form').addEventListener('submit', handleProfileUpdate);
        document.getElementById('add-entity-form')?.addEventListener('submit', handleAddEntity);
        document.querySelectorAll('.remove-entity-btn').forEach(btn => btn.addEventListener('click', handleRemoveEntity));
    } else {
        container.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
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
        
        // Update user document with family ID
        await updateDocument('users', currentUser.uid, { 
            familyId: familyDoc.id 
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
        // For now, we'll create an invitation record
        // In a real app, you'd send an email invitation
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
        await updateDocument('users', memberId, { familyId: null });
        
        alert('Member removed from family.');
    } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
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
