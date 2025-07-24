/* ================================================================================= */
/* FILE: assets/js/modules/publications.js (NEW - REPLACES PLACEHOLDER)              */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// For v1, data is local. For v2, we'd use:
// import { getDocumentsRealtime, saveDocument, updateDocument, deleteDocument } from '../database.js';

// --- LOCAL DATA FOR V1 ---
let publicationsData = [
    {
        id: 'pub001',
        title: 'The Philosophy of the Digital Homestead',
        author: 'Salatiso L. Mdeni',
        timestamp: '2025-07-22T10:00:00Z',
        contentMarkdown: `
# The Philosophy of the Digital Homestead

In an age of digital fragmentation, the concept of a **digital homestead** emerges as a necessary anchor. It is more than a collection of profiles; it is a sovereign digital space where an individual's story, skills, and legacy are cultivated and controlled.

## Core Tenets
1.  **Sovereignty:** You own your data. You control your narrative.
2.  **Holism:** Your life is more than a resume. The homestead represents your skills, family, finances, and personal growth in one interconnected space.
3.  **Legacy:** It is a living archive, a foundation upon which future generations can build.

The Hub is the first step in realizing this vision for every individual.
        `
    },
    {
        id: 'pub002',
        title: 'Understanding Compound Growth in Life & Finance',
        author: 'Gemini',
        timestamp: '2025-07-20T11:00:00Z',
        contentMarkdown: `
## The Eighth Wonder of the World

Albert Einstein is often quoted as having said, "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it." This principle applies far beyond finance.

### Compounding in Skills
-   Learning one new skill makes it easier to learn the next.
-   Consistent daily practice, even for 15 minutes, yields exponential results over a year.

### Compounding in Relationships
-   Small, consistent acts of trust and kindness build a powerful, resilient bond over time.
-   Neglecting these small acts can lead to a compounding debt of mistrust.

Think about where you can apply the principle of compounding in your own life.
        `
    }
];

let currentUserId = null;
const markdownConverter = new showdown.Converter();

export function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    console.log("Publications module initialized.");
    
    renderListView();
    setupEditorModalListeners();
}

function renderListView() {
    const main = document.getElementById('publications-main');
    main.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900">Publications</h1>
                    <p class="mt-1 text-slate-600">A library of articles and insights from the ecosystem.</p>
                </div>
                <button id="create-publication-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm text-sm">
                    <i class="fas fa-pen-nib mr-2"></i>Write New Publication
                </button>
            </div>
            <div id="publications-list" class="space-y-4"></div>
        </div>
    `;

    const listContainer = document.getElementById('publications-list');
    listContainer.innerHTML = '';
    
    publicationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    publicationsData.forEach(pub => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow';
        const postDate = new Date(pub.timestamp);
        const formattedDate = postDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

        card.innerHTML = `
            <p class="text-sm text-slate-500">${pub.author} • ${formattedDate}</p>
            <h2 class="text-2xl font-bold text-slate-800 mt-1">${pub.title}</h2>
        `;
        card.addEventListener('click', () => renderReaderView(pub.id));
        listContainer.appendChild(card);
    });

    document.getElementById('create-publication-btn').addEventListener('click', () => openEditorModal());
}

function renderReaderView(publicationId) {
    const pub = publicationsData.find(p => p.id === publicationId);
    if (!pub) return;

    const main = document.getElementById('publications-main');
    const contentHtml = markdownConverter.makeHtml(pub.contentMarkdown);
    const postDate = new Date(pub.timestamp);
    const formattedDate = postDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

    main.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <button id="back-to-list-btn" class="text-sm text-indigo-600 font-semibold mb-6"><i class="fas fa-arrow-left mr-2"></i>Back to all publications</button>
            <div class="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                <h1 class="text-4xl md:text-5xl font-bold text-slate-900 font-serif">${pub.title}</h1>
                <p class="text-slate-500 mt-4">By ${pub.author} • ${formattedDate}</p>
                <div class="border-t my-6"></div>
                <article class="prose lg:prose-xl text-slate-800">${contentHtml}</article>
                <div class="border-t mt-8 pt-4 flex justify-end gap-3">
                    <button class="edit-publication-btn text-sm text-blue-600 font-semibold" data-id="${pub.id}">Edit</button>
                    <button class="delete-publication-btn text-sm text-red-600 font-semibold" data-id="${pub.id}">Delete</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-list-btn').addEventListener('click', renderListView);
    document.querySelector('.edit-publication-btn').addEventListener('click', () => openEditorModal(pub.id));
    document.querySelector('.delete-publication-btn').addEventListener('click', () => deletePublication(pub.id));
}

function setupEditorModalListeners() {
    const modal = document.getElementById('editor-modal');
    document.getElementById('close-editor-modal').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('publication-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePublication();
    });
    document.getElementById('save-publication-btn').addEventListener('click', () => savePublication());
    document.getElementById('publication-content').addEventListener('input', (e) => {
        const preview = document.getElementById('editor-preview');
        preview.innerHTML = markdownConverter.makeHtml(e.target.value);
    });
}

function openEditorModal(publicationId = null) {
    const modal = document.getElementById('editor-modal');
    const form = document.getElementById('publication-form');
    form.reset();
    
    const pub = publicationId ? publicationsData.find(p => p.id === publicationId) : null;
    
    document.getElementById('publication-id').value = pub ? pub.id : '';
    document.getElementById('publication-title').value = pub ? pub.title : '';
    document.getElementById('publication-author').value = pub ? pub.author : '';
    document.getElementById('publication-content').value = pub ? pub.contentMarkdown : '';
    
    // Trigger initial preview
    const preview = document.getElementById('editor-preview');
    preview.innerHTML = pub ? markdownConverter.makeHtml(pub.contentMarkdown) : '';

    modal.classList.remove('hidden');
}

function savePublication() {
    const id = document.getElementById('publication-id').value;
    const pubData = {
        title: document.getElementById('publication-title').value,
        author: document.getElementById('publication-author').value,
        contentMarkdown: document.getElementById('publication-content').value,
        timestamp: new Date().toISOString()
    };

    if (id) {
        // Update existing
        const index = publicationsData.findIndex(p => p.id === id);
        publicationsData[index] = { ...publicationsData[index], ...pubData };
    } else {
        // Create new
        pubData.id = `pub${Date.now()}`;
        publicationsData.push(pubData);
    }
    
    document.getElementById('editor-modal').classList.add('hidden');
    renderListView(); // Refresh the main list
}

function deletePublication(publicationId) {
    if (window.confirm('Are you sure you want to delete this publication?')) {
        publicationsData = publicationsData.filter(p => p.id !== publicationId);
        renderListView();
    }
}

// Initialize the Publications when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing Publications...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated, initializing Publications for:', user.email);
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
