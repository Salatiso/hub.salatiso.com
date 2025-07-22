/* ================================================================================= */
/* */
/* FILE: assets/js/auth.js (REVISED AND FINAL)                                       */
/* */
/* PURPOSE: This file's ONLY job is to handle authentication logic. It IMPORTS       */
/* the 'auth' service from firebase-config.js. It no longer redeclares anything.     */
/* */
/* ================================================================================= */
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup,
    GoogleAuthProvider,
    signInAnonymously,
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// CRITICAL FIX: Import the 'auth' object from our single source of truth.
import { auth } from './firebase-config.js';

// --- This function runs on every page that includes this script ---
const handleAuthProtection = () => {
    onAuthStateChanged(auth, (user) => {
        const isProtectedPage = !!document.getElementById('app-container');
        
        if (user) {
            // User is logged in.
            // If on a protected page, make it visible.
            if (isProtectedPage) {
                const container = document.getElementById('app-container');
                if(container) container.style.visibility = 'visible';
                
                const userEmailElement = document.getElementById('user-email');
                if (userEmailElement) {
                    userEmailElement.textContent = user.isAnonymous ? 'Guest User' : user.email;
                }
            }
        } else {
            // User is NOT logged in.
            // If they are trying to access a protected page, redirect them.
            if (isProtectedPage) {
                // Use a relative path that works from any module depth.
                window.location.replace('../login.html'); 
            }
        }
    });
};

// Run the protection logic on every page load.
handleAuthProtection();

// --- This logic ONLY runs on the login page ---
if (document.getElementById('auth-form')) {
    const authForm = document.getElementById('auth-form');
    const formToggleLink = document.getElementById('form-toggle-link');
    const submitButton = document.getElementById('submit-button');
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const anonymousSignInBtn = document.getElementById('anonymous-signin-btn');
    const messageBox = document.getElementById('message-box');
    let isSignUp = false;

    const showMessage = (message, isError = false) => {
        messageBox.textContent = message;
        messageBox.className = `p-3 text-center text-sm rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`;
        messageBox.classList.remove('hidden');
    };

    const setButtonsDisabled = (disabled) => {
        submitButton.disabled = disabled;
        googleSignInBtn.disabled = disabled;
        anonymousSignInBtn.disabled = disabled;
    };

    formToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;
        document.getElementById('confirm-password-container').classList.toggle('hidden', !isSignUp);
        document.getElementById('form-title').textContent = isSignUp ? 'Create a New Account' : 'Login to Your Digital Homestead';
        submitButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
        formToggleLink.textContent = isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up";
        messageBox.classList.add('hidden');
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authForm['email'].value;
        const password = authForm['password'].value;
        const message = isSignUp ? 'Creating account...' : 'Signing in...';
        showMessage(message);
        setButtonsDisabled(true);

        const redirectUrl = './modules/dashboard.html';

        if (isSignUp) {
            const confirmPassword = authForm['confirm-password'].value;
            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", true);
                setButtonsDisabled(false);
                return;
            }
            createUserWithEmailAndPassword(auth, email, password)
                .then(() => { window.location.href = redirectUrl; })
                .catch(error => {
                    showMessage(error.message, true);
                    setButtonsDisabled(false);
                });
        } else {
            signInWithEmailAndPassword(auth, email, password)
                .then(() => { window.location.href = redirectUrl; })
                .catch(error => {
                    showMessage(error.message, true);
                    setButtonsDisabled(false);
                });
        }
    });

    googleSignInBtn.addEventListener('click', () => {
        showMessage('Connecting to Google...');
        setButtonsDisabled(true);
        signInWithPopup(auth, new GoogleAuthProvider())
            .then(() => { window.location.href = './modules/dashboard.html'; })
            .catch(error => {
                showMessage(error.message, true);
                setButtonsDisabled(false);
            });
    });

    anonymousSignInBtn.addEventListener('click', () => {
        showMessage('Signing in as guest...');
        setButtonsDisabled(true);
        signInAnonymously(auth)
            .then(() => { window.location.href = './modules/dashboard.html'; })
            .catch(error => {
                showMessage(error.message, true);
                setButtonsDisabled(false);
            });
    });
}

// --- This logic ONLY runs on pages with a logout button ---
if (document.getElementById('logout-button')) {
    document.getElementById('logout-button').addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Logout error:', error));
    });
}
