/* ================================================================================= */
/* */
/* FILE: assets/js/auth.js (REVISED AND FINAL)                                       */
/* */
/* PURPOSE: This file handles authentication logic and now includes a check for      */
/* terms and conditions acceptance after login.                                      */
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
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// CRITICAL FIX: Import the 'auth' and 'db' objects from our single source of truth.
import { auth, db } from './firebase-config.js';


// --- Helper function to check terms acceptance ---
const checkTermsAndRedirect = async (user) => {
    if (!user || user.isAnonymous) {
        // For anonymous users, or if no user, go straight to dashboard.
        // Or, you might decide anonymous users also need to see a version of terms.
        // For now, we bypass for them.
        window.location.href = './modules/dashboard.html';
        return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().termsAccepted === true) {
        // User has accepted terms, proceed to dashboard
        window.location.href = './modules/dashboard.html';
    } else {
        // User has not accepted terms, redirect to terms page
        window.location.href = './terms.html';
    }
};


// --- This function runs on every page that includes this script ---
const handleAuthProtection = () => {
    let firebaseReadyDispatched = false;

    onAuthStateChanged(auth, (user) => {
        const isProtectedPage = !!document.getElementById('app-container');
        const isLoginPage = !!document.querySelector('.login-container');
        
        if (user) {
            // User is logged in.
            if (isLoginPage) {
                 // If user is on login page but already logged in, check terms and redirect
                checkTermsAndRedirect(user);
            } else if (isProtectedPage) {
                const container = document.getElementById('app-container');
                if(container) container.style.visibility = 'visible';
                
                const userEmailElement = document.getElementById('user-email');
                if(userEmailElement) userEmailElement.textContent = user.email || 'Guest';

                if (!firebaseReadyDispatched) {
                    document.dispatchEvent(new CustomEvent('firebase-ready', { detail: { user } }));
                    firebaseReadyDispatched = true;
                }
            }
        } else {
            // User is not logged in.
            if (isProtectedPage) {
                // If on a protected page and not logged in, redirect to login
                window.location.href = '../login.html';
            }
        }
    });
};

// --- This logic ONLY runs on the login page ---
if (document.querySelector('.login-container')) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    const googleSignInBtn = document.getElementById('google-sign-in-btn');
    const anonymousSignInBtn = document.getElementById('anonymous-sign-in-btn');
    const messageDiv = document.getElementById('message');

    const showMessage = (message, isError = false) => {
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'error' : 'success';
    };

    const setButtonsDisabled = (disabled) => {
        signInBtn.disabled = disabled;
        signUpBtn.disabled = disabled;
        googleSignInBtn.disabled = disabled;
        anonymousSignInBtn.disabled = disabled;
    };

    const handleAuthAction = (authPromise) => {
        showMessage('Please wait...');
        setButtonsDisabled(true);
        authPromise
            .then(userCredential => {
                // On successful login/signup, check terms
                checkTermsAndRedirect(userCredential.user);
            })
            .catch(error => {
                showMessage(error.message, true);
                setButtonsDisabled(false);
            });
    };

    signInBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) return showMessage('Please enter email and password.', true);
        handleAuthAction(signInWithEmailAndPassword(auth, email, password));
    });

    signUpBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) return showMessage('Please enter email and password.', true);
        handleAuthAction(createUserWithEmailAndPassword(auth, email, password));
    });

    googleSignInBtn.addEventListener('click', () => {
        handleAuthAction(signInWithPopup(auth, new GoogleAuthProvider()));
    });

    anonymousSignInBtn.addEventListener('click', () => {
       handleAuthAction(signInAnonymously(auth));
    });
}

// --- This logic ONLY runs on pages with a logout button ---
if (document.getElementById('logout-button')) {
    document.getElementById('logout-button').addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Logout error:', error));
    });
}

// --- Run auth protection on script load ---
handleAuthProtection();

