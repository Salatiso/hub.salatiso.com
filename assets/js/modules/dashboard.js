/* ================================================================================= */
/* FILE: assets/js/modules/dashboard.js (CORRECTED)                                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument } from '../database.js';
import { collection, query, where, onSnapshot, limit, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let currentUser = null;
let isInitialized = false;

export async function init(user) {
    if (!user || !user.uid) {
        console.error("Dashboard Error: User not authenticated.");
        isInitialized = false;
        return;
    }
    if (isInitialized && currentUser.uid === user.uid) {
        return; // Avoid re-initialization
    }
    
    currentUser = user;
    isInitialized = true;
    console.log("Dynamic Dashboard module initialized.");

    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) {
        greetingEl.textContent = `Welcome, ${user.displayName || 'Friend'}`;
    }
    
    setupStyleSwitcher();
    await renderDashboard('default'); 
    listenForNotifications();
}

function setupStyleSwitcher() {
    const buttons = document.querySelectorAll('.style-selector button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('active')) {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderDashboard(button.dataset.style);
            }
        });
    });
}

async function renderDashboard(style) {
    const container = document.getElementById('dashboard-container');
    if (!container) return;

    container.innerHTML = `<p class="text-center text-slate-500 py-10">Loading dashboard...</p>`;

    let dashboardHTML = '';
    if (style === 'kids') {
        dashboardHTML = getKidsDashboardHTML();
    } else {
        dashboardHTML = await getDefaultDashboardHTML();
    }
    container.innerHTML = dashboardHTML;
}

async function getDefaultDashboardHTML() {
    // Simulating fetching data for the default dashboard
    const lifeCvData = await getDocument('users', currentUser.uid);
    const lifeCvStrength = calculateLifeCvStrength(lifeCvData?.lifeCvData);

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-slate-500">LifeCV Strength</h3>
                <p class="text-3xl font-bold text-indigo-600">${lifeCvStrength}%</p>
            </div>
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-slate-500">Pending Tasks</h3>
                <p class="text-3xl font-bold text-amber-600">3</p>
            </div>
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-slate-500">Upcoming Events</h3>
                <p class="text-3xl font-bold text-green-600">1</p>
            </div>
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-slate-500">Notifications</h3>
                <p class="text-3xl font-bold text-red-600" id="notification-count">0</p>
            </div>
        </div>
        <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-semibold text-slate-900 mb-4">Recent Notifications</h3>
            <div id="notifications-list" class="space-y-4">
                <p class="text-slate-500">No new notifications.</p>
            </div>
        </div>
    `;
}

function getKidsDashboardHTML() {
    return `
        <div class="text-center">
            <h2 class="text-2xl font-bold text-purple-600">Welcome, Little Explorer!</h2>
            <p class="text-slate-600">Let's have some fun today!</p>
        </div>
    `;
}

function calculateLifeCvStrength(lifeCv) {
    if (!lifeCv) return 0;
    const sections = Object.keys(lifeCv);
    const filledSections = sections.filter(key => {
        const section = lifeCv[key];
        if (Array.isArray(section)) return section.length > 0;
        if (typeof section === 'object' && section !== null) {
            return Object.values(section).some(field => field && field.value);
        }
        return false;
    });
    return sections.length > 0 ? Math.round((filledSections.length / sections.length) * 100) : 0;
}

function listenForNotifications() {
    if (!currentUser) return;

    const notificationsList = document.getElementById('notifications-list');
    const notificationCount = document.getElementById('notification-count');
    
    // **FIX:** Corrected Firestore query to listen to a subcollection on the user document.
    // This is more efficient and avoids needing a composite index.
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false), orderBy('timestamp', 'desc'), limit(5));

    onSnapshot(q, (snapshot) => {
        if (!notificationsList || !notificationCount) return;

        if (snapshot.empty) {
            notificationsList.innerHTML = `<p class="text-slate-500">No new notifications.</p>`;
            notificationCount.textContent = '0';
        } else {
            let notificationsHTML = '';
            snapshot.forEach(doc => {
                const notification = doc.data();
                notificationsHTML += `
                    <div class="flex items-start p-4 bg-slate-50 rounded-lg">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-blue-500 text-xl"></i>
                        </div>
                        <div class="ml-4 flex-grow">
                            <p class="font-semibold text-slate-800">${notification.title}</p>
                            <p class="text-sm text-slate-600">${notification.message}</p>
                        </div>
                        <a href="${notification.link || '#'}" class="text-sm font-semibold text-indigo-600 hover:underline">View</a>
                    </div>
                `;
            });
            notificationsList.innerHTML = notificationsHTML;
            notificationCount.textContent = snapshot.size;
        }
    }, (error) => {
        console.error("Error listening for notifications:", error);
        if (notificationsList) {
            notificationsList.innerHTML = `<p class="text-red-500 text-sm">Could not load notifications.</p>`;
        }
    });
}

// Initialize the dashboard when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing dashboard...');
    onAuthStateChanged(auth, (user) => {
        // **FIX:** Only initialize if there is an authenticated user.
        if (user) {
            console.log('User authenticated, initializing dashboard for:', user.email);
            init(user);
        } else {
            console.log('No user authenticated, dashboard will not initialize.');
            isInitialized = false; // Reset initialization state on sign-out
        }
    });
});
