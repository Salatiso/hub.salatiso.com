import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

// Get elements
const acceptBtn = document.getElementById('accept-button');
const declineBtn = document.getElementById('decline-button');
const messageArea = document.getElementById('message-area');

// Show a message to the user
const showMessage = (message) => {
    messageArea.textContent = message;
};

// Disable buttons to prevent multiple clicks
const setButtonsDisabled = (disabled) => {
    acceptBtn.disabled = disabled;
    declineBtn.disabled = disabled;
    acceptBtn.classList.toggle('opacity-50', disabled);
    declineBtn.classList.toggle('opacity-50', disabled);
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, enable the buttons.
        setButtonsDisabled(false);

        // Handle Accept button click
        acceptBtn.addEventListener('click', async () => {
            showMessage('Saving your acceptance...');
            setButtonsDisabled(true);

            try {
                // Use the user's UID to create a document reference in a 'users' collection
                const userDocRef = doc(db, "users", user.uid);
                
                // Set the termsAccepted flag to true. Using setDoc with merge:true is safe.
                await setDoc(userDocRef, { termsAccepted: true }, { merge: true });

                showMessage('Thank you! Redirecting to your dashboard...');
                
                // Redirect to the main dashboard
                window.location.href = './modules/dashboard.html';

            } catch (error) {
                console.error("Error saving terms acceptance:", error);
                showMessage('An error occurred. Please try again.');
                setButtonsDisabled(false);
            }
        });

        // Handle Decline button click
        declineBtn.addEventListener('click', () => {
            showMessage('Logging you out...');
            setButtonsDisabled(true);
            signOut(auth).then(() => {
                // Redirect to login page after successful logout
                window.location.href = '../login.html';
            }).catch((error) => {
                console.error('Logout Error:', error);
                showMessage('Failed to log out. Please close the page.');
                setButtonsDisabled(false);
            });
        });

    } else {
        // No user is signed in.
        showMessage('You are not logged in. Redirecting...');
        setButtonsDisabled(true);
        // Redirect to login page if no user is found
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 2000);
    }
});
