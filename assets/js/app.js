/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - FINAL & COMPLETE)                         */
/* PURPOSE: This is the ONLY script loaded by the module pages. It builds the UI,    */
/* handles auth, and then loads the specific logic for the current page.             */
/* ================================================================================= */
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 1. DEFINE COMPONENTS ---

const sidebarHTML = `
<aside class="w-64 bg-white shadow-lg p-4 flex flex-col h-full flex-shrink-0">
    <div class="text-center mb-6 pt-4">
        <a href="./dashboard.html" class="inline-block group">
            <svg viewBox="0 0 100 100" class="h-16 w-16 mx-auto text-slate-800 group-hover:text-blue-600 transition-colors">
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/>
                <path d="M50 10 L 50 90 M10 50 L 90 50" stroke="#4b5563" stroke-width="2"/>
                <path d="M50 10 L 40 25 L 60 25 Z" fill="currentColor"/>
            </svg>
        </a>
        <h1 class="text-xl font-bold text-gray-800 font-poppins mt-2">The Hub</h1>
        <p class="text-gray-500 text-xs mt-1 font-semibold italic">Your Digital Homestead</p>
    </div>

    <nav class="flex-grow space-y-1 overflow-y-auto">
        <!-- Homestead Core Group -->
        <div>
            <h2 class="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Homestead Core</h2>
            <a href="./dashboard.html" data-nav="dashboard" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-home w-6 text-center"></i><span class="ml-3">Dashboard</span>
            </a>
            <a href="./life-cv.html" data-nav="life-cv" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-id-card w-6 text-center"></i><span class="ml-3">LifeCV</span>
            </a>
            <a href="./family-hub.html" data-nav="family-hub" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-users w-6 text-center"></i><span class="ml-3">Family Hub</span>
            </a>
        </div>

        <!-- Professional Suite Group -->
        <div class="pt-4">
            <h2 class="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Suite</h2>
            <a href="./finhelp.html" data-nav="finhelp" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-chart-pie w-6 text-center"></i><span class="ml-3">FinHelp</span>
            </a>
             <a href="./hrhelp.html" data-nav="hrhelp" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-briefcase w-6 text-center"></i><span class="ml-3">HRHelp</span>
            </a>
            <a href="./legalhelp.html" data-nav="legalhelp" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-gavel w-6 text-center"></i><span class="ml-3">LegalHelp</span>
            </a>
        </div>

        <!-- Content & Comms Group -->
        <div class="pt-4">
            <h2 class="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Content & Comms</h2>
            <a href="./docuhelp.html" data-nav="docuhelp" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-file-alt w-6 text-center"></i><span class="ml-3">DocuHelp</span>
            </a>
            <a href="./commshub.html" data-nav="commshub" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-comments w-6 text-center"></i><span class="ml-3">CommsHub</span>
            </a>
            <a href="./publications.html" data-nav="publications" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-book-open w-6 text-center"></i><span class="ml-3">Publications</span>
            </a>
             <a href="./public-pages/index.html" data-nav="public-pages" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-globe w-6 text-center"></i><span class="ml-3">Public Pages</span>
            </a>
        </div>
        
         <!-- Growth & Discovery Group -->
        <div class="pt-4">
            <h2 class="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Growth & Discovery</h2>
            <a href="./training.html" data-nav="training" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-graduation-cap w-6 text-center"></i><span class="ml-3">Training</span>
            </a>
            <a href="../assessment.html" data-nav="assessment" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-map-signs w-6 text-center"></i><span class="ml-3">Tool Assessment</span>
            </a>
            <a href="../quiz.html" data-nav="quiz" class="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200">
                <i class="fas fa-brain w-6 text-center"></i><span class="ml-3">Holistic Quiz</span>
            </a>
        </div>
    </nav>
</aside>
`;

const headerHTML = `
<header class="bg-white shadow-sm p-3 flex justify-between items-center flex-shrink-0">
    <div><!-- Breadcrumbs can go here --></div>
    <div class="flex items-center gap-4">
        <div class="relative">
            <button id="ecosystem-btn" class="text-gray-600 hover:text-blue-600 transition-colors" title="Ecosystem Menu">
                <i class="fas fa-project-diagram fa-lg"></i>
            </button>
            <div id="ecosystem-menu" class="hidden absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl p-4 z-50 border">
                <p class="text-xs text-slate-500 mb-3 text-center font-semibold">Access the full Sazi Ecosystem</p>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-bold">
                    <a href="https://safetyfirst.help" target="_blank" class="hover:text-blue-600">Safety<span class="text-blue-600">Help</span></a>
                    <a href="https://salatiso.com/legalhelp/" target="_blank" class="hover:text-blue-600">Legal<span class="text-blue-600">Help</span></a>
                    <a href="https://finhelp.salatiso.com" target="_blank" class="hover:text-blue-600">Fin<span class="text-blue-600">Help</span></a>
                    <a href="https://salatiso.com/hrhelp/" target="_blank" class="hover:text-blue-600">HR<span class="text-blue-600">Help</span></a>
                    <a href="https://sazi.life" target="_blank" class="hover:text-sky-600">sazi.life</a>
                    <a href="https://flamea.org" target="_blank" class="hover:text-green-600">Flamea</a>
                </div>
            </div>
        </div>
        
        <div class="relative">
             <i class="fas fa-language absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            <select id="language-switcher" class="bg-gray-100 border-gray-300 text-sm rounded-lg pl-9 p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="en">English</option>
                <option value="xh">isiXhosa</option>
                <option value="zu">isiZulu</option>
            </select>
        </div>

        <button id="theme-switcher-btn" class="text-gray-600 hover:text-blue-600 transition-colors" title="Toggle Theme">
            <i class="fas fa-sun fa-lg"></i>
        </button>

        <div class="relative">
            <button id="user-menu-button" class="flex items-center space-x-2">
                <span id="user-email" class="font-semibold text-gray-700 text-sm"></span>
                <i class="fas fa-chevron-down text-gray-500 text-xs"></i>
            </button>
            <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                <a href="#" id="logout-button" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</a>
            </div>
        </div>
    </div>
</header>
`;

// --- 2. DEFINE LOGIC ---

function handleDropdowns() {
    const userMenuBtn = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const ecosystemBtn = document.getElementById('ecosystem-btn');
    const ecosystemMenu = document.getElementById('ecosystem-menu');

    if (userMenuBtn) userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('hidden');
        if (ecosystemMenu) ecosystemMenu.classList.add('hidden');
    });
    
    if (ecosystemBtn) ecosystemBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ecosystemMenu.classList.toggle('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    });

    window.addEventListener('click', () => {
        if(userMenu && !userMenu.classList.contains('hidden')) userMenu.classList.add('hidden');
        if(ecosystemMenu && !ecosystemMenu.classList.contains('hidden')) ecosystemMenu.classList.add('hidden');
    });
}

function setActiveNavLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (path === linkPath) {
            link.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
        }
    });
}

// --- 3. MASTER INITIALIZATION ---

async function initializePage() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.replace('../login.html');
            return;
        }

        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHTML;
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
        
        const userEmailEl = document.getElementById('user-email');
        if (userEmailEl) userEmailEl.textContent = user.isAnonymous ? 'Guest' : user.email;
        
        const logoutBtn = document.getElementById('logout-button');
        if(logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));

        handleDropdowns();
        setActiveNavLink();

        const pageModule = document.body.dataset.module;
        const knownModules = ['life-cv', 'family-hub', 'ekhaya', 'dashboard'];
        if (pageModule && knownModules.includes(pageModule)) {
            try {
                const module = await import(`./modules/${pageModule}.js`);
                if (module.init) {
                    module.init();
                }
            } catch (error) {
                console.error(`Failed to load module ${pageModule}:`, error);
            }
        }
        
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.visibility = 'visible';
    });
}

document.addEventListener('DOMContentLoaded', initializePage);
