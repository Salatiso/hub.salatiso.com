/* ================================================================================= */
/* FILE: assets/js/auth.js (CORRECTED LOGIN FLOW)                                    */
/* PURPOSE: Handles authentication with proper terms acceptance flow                 */
/* ================================================================================= */

import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

class AuthManager {
    constructor() {
        this.isSignUpMode = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAuthStateListener();
    }

    bindEvents() {
        // Form submission
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.isSignUpMode) {
                this.handleSignUp();
            } else {
                this.handleSignIn();
            }
        });

        // Toggle between sign in and sign up
        document.getElementById('form-toggle-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForm();
        });

        // Google sign in
        document.getElementById('google-signin-btn').addEventListener('click', () => {
            this.handleGoogleSignIn();
        });

        // Anonymous sign in
        document.getElementById('anonymous-signin-btn').addEventListener('click', () => {
            this.handleAnonymousSignIn();
        });
    }

    toggleForm() {
        this.isSignUpMode = !this.isSignUpMode;
        const formTitle = document.getElementById('form-title');
        const submitButton = document.getElementById('submit-button');
        const toggleLink = document.getElementById('form-toggle-link');
        const confirmPasswordContainer = document.getElementById('confirm-password-container');

        if (this.isSignUpMode) {
            formTitle.textContent = 'Create Your Account';
            submitButton.textContent = 'Sign Up';
            toggleLink.textContent = 'Already have an account? Sign In';
            confirmPasswordContainer.classList.remove('hidden');
            document.getElementById('confirm-password').required = true;
        } else {
            formTitle.textContent = 'Login to Your Digital Homestead';
            submitButton.textContent = 'Sign In';
            toggleLink.textContent = "Don't have an account? Sign Up";
            confirmPasswordContainer.classList.add('hidden');
            document.getElementById('confirm-password').required = false;
        }
    }

    async handleSignIn() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            this.showMessage('Signing in...', 'info');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await this.handleSuccessfulAuth(userCredential.user);
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), 'error');
        }
    }

    async handleSignUp() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            this.showMessage('Creating account...', 'info');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await this.handleSuccessfulAuth(userCredential.user, true);
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), 'error');
        }
    }

    async handleGoogleSignIn() {
        try {
            this.showMessage('Signing in with Google...', 'info');
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            await this.handleSuccessfulAuth(userCredential.user);
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), 'error');
        }
    }

    async handleAnonymousSignIn() {
        try {
            this.showMessage('Continuing as guest...', 'info');
            const userCredential = await signInAnonymously(auth);
            await this.handleSuccessfulAuth(userCredential.user);
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), 'error');
        }
    }

    async handleSuccessfulAuth(user, isNewUser = false) {
        try {
            // Check if user has accepted terms
            const hasAcceptedTerms = await this.checkTermsAcceptance(user.uid);
            
            if (!hasAcceptedTerms) {
                // Redirect to terms page
                this.showMessage('Redirecting to terms of service...', 'success');
                setTimeout(() => {
                    window.location.href = './terms.html';
                }, 1000);
                return;
            }

            // User has accepted terms, proceed to dashboard
            this.showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = './modules/dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('Error checking terms acceptance:', error);
            // If there's an error, redirect to terms to be safe
            window.location.href = './terms.html';
        }
    }

    async checkTermsAcceptance(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() && userDoc.data().termsAccepted === true;
        } catch (error) {
            console.error('Error checking terms acceptance:', error);
            return false; // Default to false if error
        }
    }

    setupAuthStateListener() {
        onAuthStateChanged(auth, (user) => {
            if (user && window.location.pathname.includes('login.html')) {
                // User is signed in and on login page, check terms
                this.handleSuccessfulAuth(user);
            }
        });
    }

    showMessage(message, type) {
        const messageBox = document.getElementById('message-box');
        messageBox.textContent = message;
        messageBox.className = `p-3 text-center text-sm rounded-lg ${this.getMessageClasses(type)}`;
        messageBox.classList.remove('hidden');

        if (type === 'error') {
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 5000);
        }
    }

    getMessageClasses(type) {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 border border-green-300';
            case 'error':
                return 'bg-red-100 text-red-800 border border-red-300';
            case 'info':
                return 'bg-blue-100 text-blue-800 border border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email address';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/popup-closed-by-user':
                return 'Sign-in cancelled';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            default:
                return error.message || 'An error occurred during authentication';
        }
    }
}

// Initialize the auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Export function to accept terms (used by terms.html)
export async function acceptTerms(userId) {
    try {
        await setDoc(doc(db, 'users', userId), {
            termsAccepted: true,
            termsAcceptedAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Error accepting terms:', error);
        return false;
    }
}
// In auth.js, modify the initialization:
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize AuthManager if we're on a page with auth elements
    if (document.getElementById('auth-form')) {
        new AuthManager();
    }
});

