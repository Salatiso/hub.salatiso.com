/* ================================================================================= */
/* FILE: assets/js/modules/family-hub.js (Governance & Profile Upgrade)              */
/* PURPOSE: Manages the full family structure, including profile, governance, roles,  */
/* and member management, with flexibility for informal-to-formal transition.        */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, saveDocument, addDocument } from '../database.js';
import { uploadFile } from '../storage.js';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    "CEO": ["Set the overall vision and strategy.", "Oversee all operations and ventures.", "Act as the primary representative."],
    "Treasurer": ["Manage family finances and budgets.", "Report on financial health.", "Oversee investments and assets."],
    "Mentor": ["Provide guidance and support to younger members.", "Share knowledge and experience.", "Assist with career and personal development."],
    "Provider": ["Ensure the basic needs of the family are met.", "Contribute financially or through resources.", "Manage household resources."]
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
        familyMembers = await Promise.all(memberPromises);
        renderFamilyDashboard();
    });
}


// --- DASHBOARD & TAB RENDERING ---

function renderFamilyDashboard() {
    mainContainer.innerHTML = `
        <div class="flex items-center mb-6">
            <img src="${currentFamily.logoUrl || 'https://placehold.co/80x80/E2E8F0/475569?text=Logo'}" class="w-20 h-20 rounded-full object-cover bg-white shadow-md">
            <div class="ml-4">
                <h1 class="text-3xl font-bold text-slate-900">${currentFamily.name}</h1>
                <p class="text-slate-600">Family Administration Dashboard</p>
            </div>
        </div>
        <div class="border-b border-slate-200">
            <nav class="flex space-x-8" id="family-tabs">
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

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('tab-content');
    const isAdmin = currentFamily.admin === currentUser.uid;

    switch (tabName) {
        case 'members':
            renderMembersTab(contentContainer, isAdmin);
            break;
        case 'familyTree':
            renderFamilyTreeTab(contentContainer);
            break;
        case 'profile':
            renderProfileTab(contentContainer, isAdmin);
            break;
        case 'governance':
            renderGovernanceTab(contentContainer, isAdmin);
            break;
    }
}

// --- SPECIFIC TAB RENDERERS ---

function renderMembersTab(container, isAdmin) {
    const membersHtml = familyMembers.map(member => {
        if (!member) return '';
        return `
            <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <div class="flex items-center">
                    <img src="${member.lifeCv?.profilePictures?.primary || 'https://placehold.co/40x40/E2E8F0/475569?text=U'}" class="w-10 h-10 rounded-full object-cover">
                    <div class="ml-3">
                        <p class="font-semibold text-slate-800">${member.profile?.displayName || 'Unnamed'}</p>
                        <p class="text-sm text-slate-500">${member.email}</p>
                    </div>
                </div>
                ${currentFamily.admin === member.id ? '<span class="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">Admin</span>' : ''}
            </div>`;
    }).join('');

    const relationshipOptions = relationshipTypes.map(r => `<option value="${r}">${r}</option>`).join('');
    const memberOptions = familyMembers.map(m => `<option value="${m.id}">${m.profile?.displayName || m.email}</option>`).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">${membersHtml}</div>
            ${isAdmin ? `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Invite New Member</h3>
                <form id="invite-member-form">
                    <div class="mb-4"><label for="member-email" class="block text-sm font-medium text-slate-700">Member's Email</label><input type="email" id="member-email" required class="mt-1 block w-full input"></div>
                    <div class="mb-4"><label for="relationship-type" class="block text-sm font-medium text-slate-700">Relationship</label><select id="relationship-type" class="mt-1 block w-full input">${relationshipOptions}</select></div>
                    <div class="mb-4"><label for="related-to" class="block text-sm font-medium text-slate-700">Relative</label><select id="related-to" class="mt-1 block w-full input">${memberOptions}</select></div>
                    <button type="submit" class="mt-4 w-full btn-primary">Send Invitation</button>
                </form>
            </div>` : ''}
        </div>`;
    if (isAdmin) {
        document.getElementById('invite-member-form').addEventListener('submit', handleInviteMember);
    }
}

function renderFamilyTreeTab(container) {
    const relationships = currentFamily.relationships || {};
    let treeHtml = '<div class="bg-white p-6 rounded-lg shadow-sm space-y-2">';
    if (Object.keys(relationships).length === 0) {
        treeHtml += '<p class="text-slate-500">No relationships defined yet.</p>';
    } else {
        for (const memberId in relationships) {
            const rel = relationships[memberId];
            const member = familyMembers.find(m => m.id === memberId);
            const relatedToMember = familyMembers.find(m => m.id === rel.relatedTo);
            if (member && relatedToMember) {
                treeHtml += `<p class="text-slate-700"><span class="font-bold text-indigo-600">${member.profile?.displayName}</span> is the <span class="font-semibold">${rel.type}</span> of <span class="font-bold text-indigo-600">${relatedToMember.profile?.displayName}</span>.</p>`;
            }
        }
    }
    treeHtml += '</div>';
    container.innerHTML = treeHtml;
}

function renderProfileTab(container, isAdmin) {
    const profile = currentFamily.profile || {};
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-semibold text-lg text-slate-800 mb-4">Family Profile & Story</h3>
            <form id="family-profile-form">
                <div class="mb-4"><label for="family-name-input" class="block text-sm font-medium">Family Name</label><input type="text" id="family-name-input" value="${currentFamily.name}" class="mt-1 block w-full input"></div>
                <div class="mb-4"><label for="family-summary" class="block text-sm font-medium">Family Summary</label><textarea id="family-summary" rows="3" class="mt-1 block w-full input">${profile.summary || ''}</textarea></div>
                <div class="mb-4"><label for="family-mission" class="block text-sm font-medium">Mission / Vision</label><textarea id="family-mission" rows="3" class="mt-1 block w-full input">${profile.mission || ''}</textarea></div>
                <div class="mb-4"><label for="family-values" class="block text-sm font-medium">Core Values</label><input type="text" id="family-values" value="${(profile.values || []).join(', ')}" placeholder="e.g. Integrity, Respect, Ubuntu" class="mt-1 block w-full input"></div>
                <div class="mt-6 text-right"><button type="submit" class="btn-primary">Save Changes</button></div>
            </form>
        </div>`;
    if (isAdmin) {
        document.getElementById('family-profile-form').addEventListener('submit', handleProfileUpdate);
    } else {
        container.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
    }
}

function renderGovernanceTab(container, isAdmin) {
    const governance = currentFamily.governance || { roles: [], assignments: [] };
    const rolesHtml = governance.assignments.map(a => {
        const member = familyMembers.find(m => m.id === a.memberId);
        if (!member) return '';
        return `
            <div class="p-4 bg-slate-50 rounded-md">
                <p class="font-bold text-slate-800">${a.roleTitle}</p>
                <p class="text-sm text-slate-600">Assigned to: <span class="font-semibold">${member.profile?.displayName}</span></p>
                <p class="text-xs text-slate-500">Since: ${a.startDate}</p>
                <p class="text-sm mt-2">${a.duties}</p>
            </div>`;
    }).join('');

    const memberOptions = familyMembers.map(m => `<option value="${m.id}">${m.profile?.displayName || m.email}</option>`).join('');
    const roleOptions = suggestedRoles.map(r => `<option value="${r}">${r}</option>`).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Assigned Roles</h3>
                <div class="space-y-3">${rolesHtml || '<p class="text-sm text-slate-500">No roles assigned yet.</p>'}</div>
            </div>
            ${isAdmin ? `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Assign a New Role</h3>
                <form id="assign-role-form">
                    <div class="mb-4">
                        <label for="role-title" class="block text-sm font-medium">Role Title</label>
                        <input type="text" id="role-title" list="suggested-roles" required class="mt-1 block w-full input" placeholder="e.g., CEO or Mentor">
                        <datalist id="suggested-roles">${roleOptions}</datalist>
                    </div>
                    <div class="mb-4">
                        <label for="assign-to" class="block text-sm font-medium">Assign to Member</label>
                        <select id="assign-to" class="mt-1 block w-full input">${memberOptions}</select>
                    </div>
                    <div class="mb-4">
                        <label for="start-date" class="block text-sm font-medium">Start Date</label>
                        <input type="date" id="start-date" required class="mt-1 block w-full input">
                    </div>
                    <div class="mb-4">
                        <label for="duties" class="block text-sm font-medium">Duties & Responsibilities</label>
                        <textarea id="duties" rows="4" class="mt-1 block w-full input" placeholder="Describe the key responsibilities..."></textarea>
                    </div>
                    <button type="submit" class="mt-4 w-full btn-primary">Assign Role</button>
                </form>
            </div>` : ''}
        </div>`;

    if (isAdmin) {
        document.getElementById('assign-role-form').addEventListener('submit', handleAssignRole);
        document.getElementById('role-title').addEventListener('input', (e) => {
            const duties = suggestedDuties[e.target.value];
            if (duties) {
                document.getElementById('duties').value = duties.map(d => `- ${d}`).join('\n');
            }
        });
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
            name: familyName, admin: currentUser.uid, members: [currentUser.uid],
            relationships: {}, governance: { roles: suggestedRoles, assignments: [] },
            profile: { summary: '', mission: '', values: [] }, createdAt: serverTimestamp(),
        };
        const familyDocRef = await addDocument('families', familyData);
        await updateDocument('users', currentUser.uid, { familyId: familyDocRef.id });
    } catch (error) {
        console.error("Error creating family:", error);
        alert("Failed to create family.");
        button.disabled = false;
        button.textContent = 'Establish Family';
    }
}

async function handleInviteMember(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('#member-email').value.trim();
    const relationshipType = form.querySelector('#relationship-type').value;
    const relatedToId = form.querySelector('#related-to').value;
    const button = form.querySelector('button');
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const userSnapshot = await getDocs(q);
        if (userSnapshot.empty) throw new Error("User not found.");
        
        const newMemberId = userSnapshot.docs[0].id;
        if (currentFamily.members.includes(newMemberId)) throw new Error("User is already in the family.");

        const updatedMembers = [...currentFamily.members, newMemberId];
        const updatedRelationships = { ...currentFamily.relationships, [newMemberId]: { type: relationshipType, relatedTo: relatedToId } };
        
        const batch = writeBatch(db);
        batch.update(doc(db, "families", currentFamily.id), { members: updatedMembers, relationships: updatedRelationships });
        batch.update(doc(db, "users", newMemberId), { familyId: currentFamily.id });
        await batch.commit();

        alert(`Invitation successful!`);
        form.reset();
    } catch(error) {
        alert(`Error: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = 'Send Invitation';
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('family-name-input').value;
    const summary = document.getElementById('family-summary').value;
    const mission = document.getElementById('family-mission').value;
    const values = document.getElementById('family-values').value.split(',').map(v => v.trim());
    
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
