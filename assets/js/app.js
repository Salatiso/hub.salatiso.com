/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - FINAL & COMPLETE)                         */
/* PURPOSE: This is the ONLY script loaded by the module pages. It builds the UI,    */
/* handles auth, and then loads the specific logic for the current page.             */
/* All links have been corrected for the flat /modules/ structure.                   */
/* LOGO HAS BEEN RESTORED TO THE USER'S ORIGINAL DESIGN.                             */
/* ================================================================================= */
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 1. DEFINE SHARED UI COMPONENTS ---

const sidebarHTML = `
<aside class="w-64 bg-white shadow-lg p-4 flex flex-col h-full flex-shrink-0">
    <div class="text-center mb-6 pt-4">
        <a href="./dashboard.html" class="inline-block group">
            <svg viewBox="0 0 100 100" class="h-16 w-16 mx-auto text-slate-800 group-hover:text-indigo-600 transition-colors">
                <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="5" fill="none"/>
                <path d="M50 15 V 85 M15 50 H 85" stroke="#94a3b8" stroke-width="1.5"/>
                <text x="50" y="55" font-size="28" fill="currentColor" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="bold">H</text>
            </svg>
            <p class="text-slate-800 font-bold text-lg mt-2 group-hover:text-indigo-600">The Hub</p>
        </a>
    </div>

    <nav class="flex-grow space-y-2" id="main-nav">
        <h3 class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</h3>
        <a href="./dashboard.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-tachometer-alt w-6 text-center"></i><span class="ml-3">Dashboard</span></a>
        <a href="./life-cv.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-user-tie w-6 text-center"></i><span class="ml-3">LifeCV</span></a>
        <a href="./family-hub.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-users w-6 text-center"></i><span class="ml-3">Family Hub</span></a>
        
        <div class="pt-4">
            <h3 class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</h3>
            <a href="./finhelp.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-dollar-sign w-6 text-center"></i><span class="ml-3">FinHelp</span></a>
            <a href="./hrhelp.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-briefcase w-6 text-center"></i><span class="ml-3">HRHelp</span></a>
            <a href="./legalhelp.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-gavel w-6 text-center"></i><span class="ml-3">LegalHelp</span></a>
            <a href="./docuhelp.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-file-alt w-6 text-center"></i><span class="ml-3">DocuHelp</span></a>
        </div>

        <div class="pt-4">
            <h3 class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Community</h3>
            <a href="./commshub.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-bullhorn w-6 text-center"></i><span class="ml-3">CommsHub</span></a>
            <a href="./publications.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-book-open w-6 text-center"></i><span class="ml-3">Publications</span></a>
            <a href="./training.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-chalkboard-teacher w-6 text-center"></i><span class="ml-3">Training</span></a>
        </div>
    </nav>

    <div class="mt-auto">
         <a href="./public-pages.html" class="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><i class="fas fa-globe w-6 text-center"></i><span class="ml-3">Public Profile</span></a>
    </div>
</aside>
`;

const headerHTML = `
<header class="bg-white shadow-sm p-4 flex justify-between items-center">
    <div class="flex items-center">
        <button id="menu-toggle" class="text-slate-600 hover:text-slate-900 lg:hidden mr-4">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <h1 class="text-xl font-bold text-slate-800" id="page-title">Dashboard</h1>
    </div>
    <div class="flex items-center">
        <div class="relative" id="user-dropdown-container">
            <button id="user-dropdown-button" class="flex items-center space-x-2">
                <span id="user-email" class="text-sm font-medium text-slate-700"></span>
                <img id="user-avatar" class="h-8 w-8 rounded-full" src="https://placehold.co/40x40/E2E8F0/475569?text=U" alt="User avatar">
                <i class="fas fa-chevron-down text-xs text-slate-500"></i>
            </button>
            <div id="user-dropdown-menu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden">
                <a href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Profile</a>
                <a href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</a>
                <div class="border-t border-slate-200 my-1"></div>
                <button id="logout-button" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
            </div>
        </div>
    </div>
</header>
`;


// --- 2. CORE INITIALIZATION LOGIC ---

function initializePage() {
    onAuthStateChanged(auth, async (user) => {
        const appContainer = document.getElementById('app-container');
        if (!user) {
            const currentPage = window.location.pathname + window.location.search;
            window.location.replace(`../login.html?redirectUrl=${encodeURIComponent(currentPage)}`);
            return;
        }

        injectUI();
        
        const userEmailEl = document.getElementById('user-email');
        const userAvatarEl = document.getElementById('user-avatar');
        if (userEmailEl) userEmailEl.textContent = user.displayName || user.email;
        if (userAvatarEl && user.photoURL) userAvatarEl.src = user.photoURL;

        document.getElementById('logout-button').addEventListener('click', () => signOut(auth));
        
        handleDropdowns();
        setActiveNavLink();
        updatePageTitle();

        const pageModule = document.body.dataset.module;
        if (pageModule) {
            try {
                const module = await import(`./modules/${pageModule}.js`);
                if (module.init) {
                    module.init(user);
                }
            } catch (error) {
                console.error(`Failed to load or initialize module '${pageModule}':`, error);
                const mainContent = document.querySelector('main');
                if(mainContent) mainContent.innerHTML = `<div class="text-center py-10"><h2 class="text-2xl font-bold text-red-600">Error</h2><p class="text-slate-600 mt-2">Could not load the content for this page.</p><p class="text-sm text-slate-500 mt-4">${error.message}</p></div>`;
            }
        }
        
        if (appContainer) appContainer.style.visibility = 'visible';
    });
}

// --- 3. UI & EVENT HANDLERS ---

function injectUI() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHTML;
    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
}

function handleDropdowns() {
    const userDropdownButton = document.getElementById('user-dropdown-button');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');

    if (userDropdownButton && userDropdownMenu) {
        userDropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            userDropdownMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (event) => {
            if (!userDropdownMenu.classList.contains('hidden') && !userDropdownButton.contains(event.target)) {
                userDropdownMenu.classList.add('hidden');
            }
        });
    }
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('#main-nav a');
    const currentPage = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('bg-indigo-100', 'text-indigo-700', 'font-semibold');
            link.classList.remove('text-slate-700');
        }
    });
}

function updatePageTitle() {
    const pageTitleEl = document.getElementById('page-title');
    const pageModule = document.body.dataset.module;
    if (pageTitleEl && pageModule) {
        const title = pageModule.charAt(0).toUpperCase() + pageModule.slice(1).replace(/-/g, ' ');
        pageTitleEl.textContent = title;
    }
}

// --- 4. SCRIPT EXECUTION ---
document.addEventListener('DOMContentLoaded', initializePage);
