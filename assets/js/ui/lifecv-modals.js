/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-modals.js                                               */
/* PURPOSE: Manages the behavior of all modals used within the LifeCV module,        */
/* including the Camera, PII Confirmation, and Public Presence modals.               */
/* ================================================================================= */

import CameraService from '../services/camera-service.js';
import { getLifeCvData, saveLifeCvData } from '../services/life-cv-data-service.js';

let cameraService;

/**
 * Initializes modal functionality and attaches event listeners to trigger buttons.
 */
export function init() {
    cameraService = new CameraService('camera-stream', 'camera-canvas');
    
    document.body.addEventListener('click', (e) => {
        const targetId = e.target.id;
        if (targetId === 'open-camera-btn') showCameraModal();
        if (targetId === 'manage-public-btn') showPublicPresenceModal();
        
        // Modal close buttons
        if (targetId === 'cancel-capture-btn' || targetId === 'pii-cancel-btn' || targetId === 'public-presence-close-btn') {
            e.target.closest('.fixed').classList.add('hidden');
            if (targetId === 'cancel-capture-btn') cameraService.stop();
        }
    });
}

/**
 * Displays and manages the PII confirmation modal.
 * @param {string} path - The data path for the privacy boolean to update.
 * @param {function} onConfirm - The callback to execute on successful confirmation.
 */
export function showPiiConfirmModal(path, onConfirm) {
    const modal = document.getElementById('pii-confirm-modal');
    const nameDisplay = document.getElementById('pii-user-fullname');
    const input = document.getElementById('pii-confirm-input');
    const confirmBtn = document.getElementById('pii-confirm-btn');

    const lifeCvData = getLifeCvData();
    const userFullName = lifeCvData.personal?.fullName?.value || '';

    if (!userFullName) {
        alert("Please enter your full name in the 'Personal & Identity' section before making sensitive information public.");
        return;
    }

    nameDisplay.textContent = userFullName;
    input.value = '';
    confirmBtn.disabled = true;
    modal.classList.remove('hidden');

    const handleInput = () => {
        confirmBtn.disabled = input.value !== userFullName;
    };
    
    const handleConfirm = () => {
        onConfirm(); // Execute the callback passed from the event handler
        modal.classList.add('hidden');
        input.removeEventListener('input', handleInput);
        confirmBtn.removeEventListener('click', handleConfirm);
    };

    input.addEventListener('input', handleInput);
    confirmBtn.addEventListener('click', handleConfirm);
}

/**
 * Displays and manages the camera capture modal.
 * @param {function} uploadCallback - The function to call with the captured image blob.
 */
async function showCameraModal(uploadCallback) {
    const modal = document.getElementById('camera-modal');
    const captureBtn = document.getElementById('capture-btn');
    modal.classList.remove('hidden');
    
    try {
        await cameraService.start();
        
        const handleCapture = async () => {
            try {
                const blob = await cameraService.capture();
                uploadCallback(blob); // Pass the blob to the callback for uploading
            } catch (error) {
                console.error("Failed to capture image:", error);
            } finally {
                cameraService.stop();
                modal.classList.add('hidden');
                captureBtn.removeEventListener('click', handleCapture);
            }
        };
        captureBtn.addEventListener('click', handleCapture);

    } catch (err) {
        alert(err.message);
        modal.classList.add('hidden');
    }
}

/**
 * Shows the placeholder modal for public profile management.
 */
function showPublicPresenceModal() {
    document.getElementById('public-presence-modal').classList.remove('hidden');
}
