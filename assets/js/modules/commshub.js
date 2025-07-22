/* ================================================================================= */
/* FILE: assets/js/modules/commshub.js (NEW - REPLACES PLACEHOLDER)                  */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
// Note: For v1, we are using hardcoded data. In v2, we will import from database.js
// import { getDocumentsRealtime } from '../database.js';

// --- ANNOUNCEMENT DATA (Simulated Firestore Data for v1) ---
const announcementsData = [
    {
        id: 'ann001',
        title: 'Welcome to the New CommsHub!',
        content: 'We are excited to launch the CommsHub, your central place for all news and updates within The Hub. Stay tuned for more information as we roll out new features and modules. Your digital homestead is growing every day!',
        author: 'The Hub Administration',
        timestamp: '2025-07-22T14:30:00Z',
        tags: ['New Feature', 'Welcome']
    },
    {
        id: 'ann002',
        title: 'FinHelp Professional Suite Now Live',
        content: 'The first phase of the FinHelp Professional Suite has been released. You can now manage your business contacts, create and send invoices, and track your business purchases. Switch to the "Business" workspace in the FinHelp module to get started.',
        author: 'The Hub Development Team',
        timestamp: '2025-07-21T10:00:00Z',
        tags: ['FinHelp', 'Update']
    },
    {
        id: 'ann003',
        title: 'Scheduled Maintenance: Sunday 27th July',
        content: 'Please be advised that The Hub will undergo scheduled maintenance this Sunday between 02:00 and 04:00 SAST. The platform may be temporarily unavailable during this period. We appreciate your understanding as we work to improve the ecosystem.',
        author: 'The Hub Administration',
        timestamp: '2025-07-20T16:00:00Z',
        tags: ['Maintenance', 'System']
    }
];


export function init(user) {
    if (!user || !user.uid) {
        console.error("CommsHub Error: User not authenticated.");
        return;
    }
    console.log("CommsHub module initialized.");

    // In a future version, this would be a realtime listener:
    // getDocumentsRealtime('public/announcements', renderAnnouncements);
    
    // For v1, we render the static data.
    renderAnnouncements(announcementsData);
}

/**
 * Renders the list of announcements into the container.
 * @param {Array<object>} announcements - An array of announcement objects.
 */
function renderAnnouncements(announcements) {
    const container = document.getElementById('announcements-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (!announcements || announcements.length === 0) {
        container.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-sm text-center">
                <h3 class="text-xl font-semibold text-slate-800">No Announcements Yet</h3>
                <p class="text-slate-500 mt-2">Check back later for news and updates.</p>
            </div>
        `;
        return;
    }

    // Sort by timestamp, newest first
    announcements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    announcements.forEach(ann => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-sm announcement-card';
        
        const postDate = new Date(ann.timestamp);
        const formattedDate = postDate.toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const tagsHtml = ann.tags.map(tag => `
            <span class="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">${tag}</span>
        `).join('');

        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center">
                    ${tagsHtml}
                </div>
                <p class="text-xs text-slate-500">${formattedDate}</p>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">${ann.title}</h2>
            <p class="text-slate-600 leading-relaxed">${ann.content}</p>
            <div class="border-t mt-4 pt-3">
                <p class="text-xs text-slate-500 font-semibold">Posted by: ${ann.author}</p>
            </div>
        `;
        container.appendChild(card);
    });
}
