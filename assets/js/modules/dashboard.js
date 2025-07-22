/* ================================================================================= */
/* FILE: assets/js/modules/dashboard.js (CORRECTED)                                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument } from '../database.js';
// CORRECTED: This line now uses a valid module specifier for the Firestore library.
import { collection, query, where, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;

export async function init(user) {
    if (!user || !user.uid) {
        console.error("Dashboard Error: User not authenticated.");
        return;
    }
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
        container.innerHTML = await getDefaultDashboardHTML();
    } else if (style === 'kids') {
        container.innerHTML = getKidsDashboardHTML();
    }
    
    // After rendering, if there are notifications, attach handlers
    if (style === 'default') {
        listenForNotifications();
    }
}

async function getDefaultDashboardHTML() {
    // Fetch dynamic data in parallel
    const [lifeCvData, personalFinance, businessFinance] = await Promise.all([
        getDocument('users', currentUser.uid),
        getPersonalFinanceSummary(),
        getBusinessFinanceSummary()
    ]);

    const lifeCvStrength = calculateLifeCvStrength(lifeCvData ? lifeCvData.lifeCv : {});

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- LifeCV Strength -->
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm col-span-1 md:col-span-2 lg:col-span-2">
                <h3 class="font-bold text-slate-800 text-lg">LifeCV Strength</h3>
                <p class="text-sm text-slate-500 mb-4">A measure of your profile's completeness.</p>
                <div class="w-full bg-slate-200 rounded-full h-2.5">
                    <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${lifeCvStrength}%"></div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-2xl font-bold text-indigo-600">${lifeCvStrength}%</span>
                    <a href="./life-cv.html" class="text-sm font-semibold text-indigo-600 hover:underline">Improve Profile</a>
                </div>
            </div>

            <!-- Personal Finance -->
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-bold text-slate-800 text-lg">Personal Net Worth</h3>
                <p class="text-sm text-slate-500 mb-4">A snapshot of your finances.</p>
                <p class="text-3xl font-bold text-green-600">R ${personalFinance.net.toFixed(2)}</p>
            </div>

            <!-- Business Finance -->
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-bold text-slate-800 text-lg">Business Profit</h3>
                 <p class="text-sm text-slate-500 mb-4">Your current business health.</p>
                <p class="text-3xl font-bold text-blue-600">R ${businessFinance.profit.toFixed(2)}</p>
            </div>

            <!-- Notifications -->
            <div id="notifications-widget" class="dashboard-card bg-white p-6 rounded-lg shadow-sm col-span-1 md:col-span-2">
                <h3 class="font-bold text-slate-800 text-lg mb-3">Notifications</h3>
                <div id="notifications-list" class="space-y-3">
                    <p class="text-slate-500 text-sm">No new notifications.</p>
                </div>
            </div>

            <!-- Suggested Actions -->
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm col-span-1 md:col-span-2">
                <h3 class="font-bold text-slate-800 text-lg mb-3">Suggested Actions</h3>
                <ul class="space-y-3 list-disc list-inside text-slate-600">
                    <li><a href="./finhelp.html" class="hover:underline text-indigo-600 font-medium">Create your first business invoice.</a></li>
                    <li><a href="./family-hub.html" class="hover:underline text-indigo-600 font-medium">Invite your partner to LifeSync.</a></li>
                    <li><a href="./publications.html" class="hover:underline text-indigo-600 font-medium">Read the latest CommsHub announcement.</a></li>
                </ul>
            </div>
        </div>
    `;
}

function getKidsDashboardHTML() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Welcome Card -->
            <div class="dashboard-card bg-yellow-100 p-8 rounded-xl border-4 border-yellow-300 text-center">
                <h2 class="text-3xl font-bold text-yellow-800">Hi Explorer!</h2>
                <p class="text-yellow-700 mt-2">Ready for an adventure in your digital world?</p>
            </div>

            <!-- My Chores -->
            <div class="dashboard-card bg-blue-100 p-6 rounded-xl border-4 border-blue-300">
                <h3 class="font-bold text-blue-800 text-xl mb-3"><i class="fas fa-tasks mr-2"></i>My Chores</h3>
                <ul class="space-y-2">
                    <li class="flex items-center"><input type="checkbox" class="h-5 w-5 rounded mr-3"> Make my bed</li>
                    <li class="flex items-center"><input type="checkbox" class="h-5 w-5 rounded mr-3"> Feed the dog</li>
                </ul>
            </div>

            <!-- Learning Time -->
            <div class="dashboard-card bg-green-100 p-6 rounded-xl border-4 border-green-300 col-span-1 md:col-span-2">
                <h3 class="font-bold text-green-800 text-xl mb-2"><i class="fas fa-graduation-cap mr-2"></i>Learning Time!</h3>
                <p class="text-green-700">Learn about the Big Rule Book for families.</p>
                <a href="https://flamea.org/training/course-kids-big_rule_book.html" target="_blank" class="mt-4 inline-block bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-600">Start Learning!</a>
            </div>
        </div>
    `;
}


// --- DATA FETCHING & LOGIC HELPERS ---

function calculateLifeCvStrength(lifeCv) {
    if (!lifeCv) return 0;
    const sections = ['summary', 'experience', 'education', 'skills', 'references', 'projects'];
    const filledSections = sections.filter(sec => lifeCv[sec] && ( (Array.isArray(lifeCv[sec]) && lifeCv[sec].length > 0) || (!Array.isArray(lifeCv[sec]) && lifeCv[sec])) );
    return Math.round((filledSections.length / sections.length) * 100);
}

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

function listenForNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;

    const q = query(collection(db, "syncInvitations"), where("recipientEmail", "==", currentUser.email), where("status", "===", "pending"));
    
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            notificationsList.innerHTML = `<p class="text-slate-500 text-sm">No new notifications.</p>`;
        } else {
            let notificationsHTML = '';
            snapshot.forEach(doc => {
                const invite = doc.data();
                notificationsHTML += `
                    <div class="flex items-start p-3 bg-indigo-50 rounded-lg">
                        <i class="fas fa-user-friends text-indigo-500 mt-1"></i>
                        <div class="ml-3">
                            <p class="text-sm text-slate-800">You have a <strong>LifeSync</strong> invitation from ${invite.senderName}.</p>
                            <a href="./family-hub.html" class="text-sm font-semibold text-indigo-600 hover:underline">Respond Now</a>
                        </div>
                    </div>
                `;
            });
            notificationsList.innerHTML = notificationsHTML;
        }
    }, (error) => {
        console.error("Error listening for notifications:", error);
        notificationsList.innerHTML = `<p class="text-red-500 text-sm">Could not load notifications.</p>`;
    });
}
