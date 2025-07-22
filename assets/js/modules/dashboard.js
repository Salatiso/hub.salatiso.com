/* ================================================================================= */
/* FILE: assets/js/modules/dashboard.js (CORRECTED)                                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument } from '../database.js';
// CORRECTED: This line now uses a valid module specifier for the Firestore library.
import { collection, query, where, onSnapshot, limit } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js)";

let currentUserId = null;
let currentUser = null;

export async function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    currentUser = user;
    console.log("Dynamic Dashboard module initialized.");

    document.getElementById('dashboard-greeting').textContent = `Welcome, ${user.displayName || 'Friend'}`;
    
    setupStyleSwitcher();
    renderDashboard('default'); // Load default dashboard initially
}

function setupStyleSwitcher() {
    const buttons = document.querySelectorAll('.style-selector button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderDashboard(button.dataset.style);
        });
    });
}

async function renderDashboard(style) {
    const container = document.getElementById('dashboard-container');
    container.innerHTML = `<p class="text-center text-slate-500 py-10">Loading your dashboard...</p>`;

    if (style === 'default') {
        renderDefaultDashboard();
    } else if (style === 'kids') {
        renderKidsDashboard();
    }
}

// --- DEFAULT DASHBOARD ---

async function renderDefaultDashboard() {
    const container = document.getElementById('dashboard-container');
    
    // Fetch all necessary data in parallel
    const [lifeCvData, personalFinanceData, businessFinanceData, notifications] = await Promise.all([
        getDocument(`users/${currentUserId}/lifecv/main`),
        getPersonalFinanceSummary(),
        getBusinessFinanceSummary(),
        getNotifications()
    ]);

    const profileStrength = calculateProfileStrength(lifeCvData);

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column -->
            <div class="lg:col-span-2 space-y-6">
                ${renderProfileStrengthWidget(profileStrength)}
                ${renderFinanceSummaryWidget(personalFinanceData, businessFinanceData)}
                ${renderNextStepsWidget(profileStrength)}
            </div>
            <!-- Right Column -->
            <div class="lg:col-span-1 space-y-6">
                ${renderNotificationsWidget(notifications)}
                ${renderActivityWidget()}
            </div>
        </div>
    `;
}

function calculateProfileStrength(cv) {
    let score = 0;
    let total = 7; // Total number of checks
    let suggestions = [];

    if (cv?.summary?.headline) score++; else suggestions.push({ text: "Add a powerful headline to your Profile Summary.", link: "./life-cv.html" });
    if (cv?.experience && Object.keys(cv.experience).length >= 2) score++; else suggestions.push({ text: "Document at least two roles in your Professional Experience.", link: "./life-cv.html" });
    if (cv?.education && Object.keys(cv.education).length >= 1) score++; else suggestions.push({ text: "Add your key qualifications to the Education section.", link: "./life-cv.html" });
    if (cv?.skills && Object.keys(cv.skills).length >= 5) score++; else suggestions.push({ text: "List at least 5 key Skills & Competencies.", link: "./life-cv.html" });
    if (cv?.projects && Object.keys(cv.projects).length >= 1) score++; else suggestions.push({ text: "Showcase a key project in your Portfolio.", link: "./life-cv.html" });
    
    // Check for HRHelp PDP
    // This is a placeholder for a real check
    score++; 
    
    // Check for recent training
    // This is a placeholder for a real check
    score++;

    const percentage = Math.round((score / total) * 100);
    let readiness = {};
    if (percentage > 80) readiness = { job: 'High', sync: 'High', business: 'Ready' };
    else if (percentage > 50) readiness = { job: 'Medium', sync: 'Medium', business: 'Consider' };
    else readiness = { job: 'Low', sync: 'Low', business: 'Planning' };

    return { percentage, readiness, suggestions };
}

// --- WIDGET RENDERING FUNCTIONS ---

function renderProfileStrengthWidget({ percentage, readiness }) {
    return `
        <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-bold text-lg text-slate-800">LifeCV Strength</h3>
            <div class="flex items-center gap-4 mt-4">
                <div class="relative w-24 h-24">
                    <svg class="w-full h-full" viewBox="0 0 36 36"><path class="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path><path class="text-indigo-600" stroke-dasharray="${percentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>
                    <div class="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-800">${percentage}%</div>
                </div>
                <div class="flex-1 grid grid-cols-3 gap-2 text-center">
                    <div><p class="text-sm text-slate-500">Job Readiness</p><span class="font-bold text-green-600">${readiness.job}</span></div>
                    <div><p class="text-sm text-slate-500">Business Readiness</p><span class="font-bold text-blue-600">${readiness.business}</span></div>
                    <div><p class="text-sm text-slate-500">LifeSync Readiness</p><span class="font-bold text-pink-600">${readiness.sync}</span></div>
                </div>
            </div>
        </div>
    `;
}

function renderFinanceSummaryWidget(personal, business) {
    return `
        <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-bold text-lg text-slate-800">Financial Snapshot</h3>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-slate-50 p-4 rounded-md">
                    <p class="text-sm font-semibold text-slate-600">Personal Finances</p>
                    <p class="text-2xl font-bold text-green-600 mt-2">R ${personal.net.toLocaleString()}</p>
                    <p class="text-xs text-slate-500">Net Position (This Month)</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-md">
                    <p class="text-sm font-semibold text-slate-600">Business Finances</p>
                    <p class="text-2xl font-bold text-blue-600 mt-2">R ${business.profit.toLocaleString()}</p>
                    <p class="text-xs text-slate-500">Profit (This Month)</p>
                </div>
            </div>
        </div>
    `;
}

function renderNextStepsWidget({ suggestions }) {
    if (suggestions.length === 0) return '';
    return `
        <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-bold text-lg text-slate-800">Suggested Next Steps</h3>
            <div class="mt-4 space-y-3">
                ${suggestions.slice(0, 2).map(s => `
                    <a href="${s.link}" class="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-md">
                        <span class="text-sm text-indigo-800">${s.text}</span>
                        <i class="fas fa-arrow-right text-indigo-600"></i>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

function renderNotificationsWidget(notifications) {
    return `
        <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-bold text-lg text-slate-800">Notifications</h3>
            <div class="mt-4 space-y-3">
                ${notifications.length > 0 ? notifications.map(n => `
                    <div class="flex items-start gap-3">
                        <div class="mt-1"><i class="fas ${n.icon} text-blue-500"></i></div>
                        <div>
                            <p class="text-sm text-slate-700">${n.text}</p>
                            <a href="${n.link}" class="text-xs font-semibold text-indigo-600">View</a>
                        </div>
                    </div>
                `).join('') : '<p class="text-sm text-slate-500">No new notifications.</p>'}
            </div>
        </div>
    `;
}

function renderActivityWidget() {
    return `
        <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-bold text-lg text-slate-800">Action Required</h3>
            <div class="mt-4">
                <p class="text-sm text-slate-500">You have no pending actions.</p>
                <!-- Example of an action item -->
                <!-- <div class="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <p class="text-sm text-yellow-800">Approve content release for 'Family Value'.</p>
                    <button class="text-xs font-semibold text-yellow-900 mt-1">Go to Family Hub</button>
                </div> -->
            </div>
        </div>
    `;
}


// --- KIDS DASHBOARD ---

function renderKidsDashboard() {
    const container = document.getElementById('dashboard-container');
    container.innerHTML = `
        <div class="bg-yellow-100 border-4 border-yellow-300 p-6 rounded-xl text-center">
             <h2 class="text-3xl font-bold text-yellow-800" style="font-family: 'Poppins', sans-serif;">Fun Zone!</h2>
             <p class="text-yellow-700 mt-1">Let's play and learn!</p>
        </div>
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm text-center">
                <i class="fas fa-gamepad text-5xl text-red-500"></i>
                <h3 class="font-bold text-lg text-slate-800 mt-4">Play a Game</h3>
                <p class="text-sm text-slate-500 mt-1">Challenge yourself with a fun game about your rights!</p>
                <a href="[https://flamea.org/games/constitution-champions.html](https://flamea.org/games/constitution-champions.html)" target="_blank" class="mt-4 inline-block bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Play Now!</a>
            </div>
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm text-center">
                <i class="fas fa-graduation-cap text-5xl text-green-500"></i>
                <h3 class="font-bold text-lg text-slate-800 mt-4">Learn Something New</h3>
                <p class="text-sm text-slate-500 mt-1">Take a quick course about the Constitution.</p>
                <a href="[https://flamea.org/training/course-kids-big_rule_book.html](https://flamea.org/training/course-kids-big_rule_book.html)" target="_blank" class="mt-4 inline-block bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Start Learning!</a>
            </div>
        </div>
    `;
}


// --- DATA FETCHING HELPERS ---

async function getPersonalFinanceSummary() {
    // In a real scenario, this would fetch and calculate from Firestore.
    // For now, we return mock data.
    return { net: 12530.50 };
}

async function getBusinessFinanceSummary() {
    // In a real scenario, this would fetch and calculate from Firestore.
    // For now, we return mock data.
    return { profit: 45800.00 };
}

async function getNotifications() {
    // This function will listen for real-time notifications
    return new Promise(resolve => {
        const q = query(collection(db, "syncInvitations"), where("recipientEmail", "==", currentUser.email), where("status", "==", "pending"), limit(1));
        onSnapshot(q, (snapshot) => {
            let notifications = [];
            if (!snapshot.empty) {
                const invite = snapshot.docs[0].data();
                notifications.push({
                    icon: 'fa-user-friends',
                    text: `You have a LifeSync invitation from ${invite.senderName}.`,
                    link: './family-hub.html'
                });
            }
            // We can add more queries here for other notification types
            resolve(notifications);
        });
    });
}
