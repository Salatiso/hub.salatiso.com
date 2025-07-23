/* ================================================================================= */
/* FILE: assets/js/modules/commshub.js (Comprehensive Comms Hub)                     */
/* PURPOSE: Manages personal drafts, intranet groups with chat/actions, and public   */
/* publications, providing a full communication and publishing workflow.             */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { addDocument, getDocumentsRealtime, updateDocument } from '../database.js';
import { doc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let quill = null;
let currentDocId = null;
let unsubscribeListeners = [];

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("CommsHub module initialized.");

    attachTabListeners();
    renderTabContent('drafts'); // Default tab
}

function attachTabListeners() {
    document.querySelectorAll('#comms-tabs .tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('#comms-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('tab-content');
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];

    switch (tabName) {
        case 'drafts': renderMyDrafts(contentContainer); break;
        case 'groups': renderMyGroups(contentContainer); break;
        case 'publications': renderMyPublications(contentContainer); break;
    }
}

// --- "MY DRAFTS" TAB ---

function renderMyDrafts(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Content Editor</h2>
                <input type="text" id="draft-title" placeholder="Enter your title here..." class="input text-lg font-bold mb-4">
                <div id="editor-container"></div>
                <div class="mt-4 text-right">
                    <button id="save-draft-btn" class="btn-primary">Save Draft</button>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-xl font-bold text-slate-800 mb-4">My Drafts</h2>
                <div id="drafts-list" class="space-y-3"></div>
            </div>
        </div>
    `;
    
    quill = new Quill('#editor-container', { theme: 'snow' });
    document.getElementById('save-draft-btn').addEventListener('click', saveDraft);

    const unsub = getDocumentsRealtime(`users/${currentUser.uid}/commsContent`, (docs) => {
        const listContainer = document.getElementById('drafts-list');
        if (!listContainer) return;
        const drafts = docs.filter(d => d.visibility === 'private');
        if (drafts.length === 0) {
            listContainer.innerHTML = `<p class="text-sm text-slate-500">You have no saved drafts.</p>`;
            return;
        }
        listContainer.innerHTML = drafts.map(d => `
            <div class="p-3 rounded-md hover:bg-slate-50 cursor-pointer border" data-id="${d.id}">
                <p class="font-semibold text-slate-800">${d.title}</p>
                <p class="text-xs text-slate-500">Last saved: ${new Date(d.updatedAt.seconds * 1000).toLocaleString()}</p>
            </div>
        `).join('');
        
        listContainer.querySelectorAll('.border').forEach(card => {
            card.addEventListener('click', () => loadDraft(card.dataset.id));
        });
    });
    unsubscribeListeners.push(unsub);
}

async function saveDraft() {
    const title = document.getElementById('draft-title').value;
    const content = quill.root.innerHTML;
    if (!title || quill.getLength() <= 1) {
        alert("Please provide a title and some content.");
        return;
    }

    const draftData = {
        title,
        content,
        authorId: currentUser.uid,
        visibility: 'private', // Default state
        updatedAt: serverTimestamp(),
    };
    
    try {
        if (currentDocId) {
            await updateDocument(`users/${currentUser.uid}/commsContent`, currentDocId, draftData);
        } else {
            draftData.createdAt = serverTimestamp();
            const docRef = await addDocument(`users/${currentUser.uid}/commsContent`, draftData);
            currentDocId = docRef.id;
        }
        alert("Draft saved successfully!");
    } catch (error) {
        console.error("Error saving draft:", error);
        alert("Could not save draft.");
    }
}

function loadDraft(docId) {
    const docRef = doc(db, `users/${currentUser.uid}/commsContent`, docId);
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('draft-title').value = data.title;
            quill.root.innerHTML = data.content;
            currentDocId = docId;
        }
    });
}

// --- "MY GROUPS" (INTRANET) TAB ---

function renderMyGroups(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">My Groups</h2>
        <p class="text-slate-500">Intranet and group communication features are coming soon.</p>
        <!-- Placeholder for group list and chat interface -->
    `;
}


// --- "MY PUBLICATIONS" (INTERNET) TAB ---

function renderMyPublications(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">My Publications</h2>
        <div id="publications-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;
    
    const unsub = getDocumentsRealtime(`users/${currentUser.uid}/commsContent`, (docs) => {
        const listContainer = document.getElementById('publications-list');
        if (!listContainer) return;
        const publications = docs.filter(d => d.visibility === 'public' || d.visibility === 'intranet');
         if (publications.length === 0) {
            listContainer.innerHTML = `<p class="text-slate-500 md:col-span-3">You have no publications. Create a draft and publish it to get started.</p>`;
            return;
        }
        listContainer.innerHTML = publications.map(p => `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <span class="text-xs font-semibold uppercase ${p.visibility === 'public' ? 'text-green-600' : 'text-blue-600'}">${p.visibility}</span>
                <h3 class="font-bold text-lg text-slate-800 mt-1">${p.title}</h3>
                <p class="text-sm text-slate-500 mt-2">Published on: ${new Date(p.publishedAt.seconds * 1000).toLocaleDateString()}</p>
                <div class="mt-4 pt-4 border-t">
                    <a href="#" class="text-sm font-semibold text-indigo-600 hover:underline">View Page</a>
                </div>
            </div>
        `).join('');
    });
    unsubscribeListeners.push(unsub);
}
