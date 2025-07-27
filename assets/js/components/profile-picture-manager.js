/* ================================================================================= */
/* FILE: assets/js/components/profile-picture-manager.js                            */
/* PURPOSE: Profile picture upload and management system                            */
/* ================================================================================= */

import { readFileAsDataURL, compressImage, generateId } from '../utils/helpers.js';
import { validateFileType, validateFileSize } from '../utils/validators.js';
import { showNotification } from '../utils/notifications.js';
import { updateField, addArrayItem, removeArrayItem } from '../services/life-cv-data-service.js';

let currentProfilePictures = [];
let webcamActive = false;

/**
 * Initialize profile picture manager
 */
export function init() {
    setupEventListeners();
    console.log('Profile Picture Manager initialized');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // File input change
    document.addEventListener('change', async (e) => {
        if (e.target.id === 'profile-pic-input') {
            await handleFileUpload(e.target.files[0]);
        }
    });
    
    // Camera capture
    document.addEventListener('click', (e) => {
        if (e.target.id === 'camera-capture-btn') {
            startWebcam();
        } else if (e.target.id === 'take-photo-btn') {
            capturePhoto();
        } else if (e.target.id === 'stop-camera-btn') {
            stopWebcam();
        }
    });
}

/**
 * Handle file upload
 */
async function handleFileUpload(file) {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validateFileType(file, allowedTypes)) {
        showNotification('Please select a valid image file (JPG, PNG, GIF, WebP)', 'error');
        return;
    }
    
    // Validate file size (5MB max)
    if (!validateFileSize(file, 5)) {
        showNotification('Image file must be smaller than 5MB', 'error');
        return;
    }
    
    try {
        showNotification('Processing image...', 'info');
        
        // Compress image
        const compressedFile = await compressImage(file, 800, 0.85);
        
        // Convert to data URL
        const dataUrl = await readFileAsDataURL(compressedFile);
        
        // Add to profile pictures
        await addProfilePicture(dataUrl, {
            caption: file.name,
            context: 'Professional',
            isPrimary: currentProfilePictures.length === 0
        });
        
        showNotification('Profile picture added successfully!', 'success');
        
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showNotification('Failed to upload profile picture', 'error');
    }
}

/**
 * Start webcam for photo capture
 */
async function startWebcam() {
    try {
        const video = document.getElementById('webcam-video');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        webcamActive = true;
        
        // Update UI to show camera controls
        updateCameraUI(true);
        
    } catch (error) {
        console.error('Error accessing webcam:', error);
        showNotification('Failed to access camera. Please check permissions.', 'error');
    }
}

/**
 * Capture photo from webcam
 */
function capturePhoto() {
    const video = document.getElementById('webcam-video');
    const canvas = document.getElementById('capture-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        try {
            const dataUrl = await readFileAsDataURL(blob);
            
            await addProfilePicture(dataUrl, {
                caption: `Webcam capture ${new Date().toLocaleDateString()}`,
                context: 'Professional',
                isPrimary: currentProfilePictures.length === 0
            });
            
            showNotification('Photo captured successfully!', 'success');
            stopWebcam();
            
        } catch (error) {
            console.error('Error saving captured photo:', error);
            showNotification('Failed to save captured photo', 'error');
        }
    }, 'image/jpeg', 0.85);
}

/**
 * Stop webcam
 */
function stopWebcam() {
    const video = document.getElementById('webcam-video');
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    video.style.display = 'none';
    webcamActive = false;
    
    updateCameraUI(false);
}

/**
 * Update camera UI
 */
function updateCameraUI(cameraActive) {
    const captureBtn = document.getElementById('camera-capture-btn');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    
    if (cameraActive) {
        if (captureBtn) captureBtn.style.display = 'none';
        if (takePhotoBtn) takePhotoBtn.style.display = 'inline-block';
        if (stopCameraBtn) stopCameraBtn.style.display = 'inline-block';
    } else {
        if (captureBtn) captureBtn.style.display = 'inline-block';
        if (takePhotoBtn) takePhotoBtn.style.display = 'none';
        if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    }
}

/**
 * Add profile picture to data
 */
async function addProfilePicture(dataUrl, metadata) {
    const pictureData = {
        id: generateId(),
        url: dataUrl,
        caption: metadata.caption || '',
        context: metadata.context || 'Professional',
        isPrimary: metadata.isPrimary || false,
        tags: metadata.tags || '',
        uploadedAt: new Date().toISOString()
    };
    
    // If this is set as primary, make all others non-primary
    if (pictureData.isPrimary) {
        currentProfilePictures.forEach((pic, index) => {
            updateField(`profilePictures.${index}.isPrimary.value`, false);
        });
    }
    
    addArrayItem('profilePictures', pictureData);
    await refreshProfilePictureGallery();
}

/**
 * Set primary profile picture
 */
export async function setPrimaryPicture(index) {
    // Make all others non-primary
    currentProfilePictures.forEach((pic, i) => {
        updateField(`profilePictures.${i}.isPrimary.value`, i === index);
    });
    
    await refreshProfilePictureGallery();
    showNotification('Primary profile picture updated', 'success');
}

/**
 * Delete profile picture
 */
export async function deleteProfilePicture(index) {
    if (confirm('Are you sure you want to delete this profile picture?')) {
        removeArrayItem('profilePictures', index);
        await refreshProfilePictureGallery();
        showNotification('Profile picture deleted', 'success');
    }
}

/**
 * Refresh profile picture gallery display
 */
async function refreshProfilePictureGallery() {
    const gallery = document.querySelector('.profile-pic-gallery');
    if (!gallery) return;
    
    if (currentProfilePictures.length === 0) {
        gallery.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block p-4 bg-slate-200 rounded-full mb-2">
                    <i class="fas fa-camera text-slate-500 text-xl"></i>
                </div>
                <p class="text-slate-500 text-sm">No profile pictures yet</p>
            </div>
        `;
        return;
    }
    
    gallery.innerHTML = currentProfilePictures.map((pic, index) => `
        <div class="relative group">
            <img src="${pic.url.value}" 
                 alt="${pic.caption.value}" 
                 class="w-20 h-20 object-cover rounded-lg cursor-pointer ${pic.isPrimary.value ? 'primary' : ''}"
                 onclick="window.profilePicManager.setPrimaryPicture(${index})">
            
            ${pic.isPrimary.value ? '<div class="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><i class="fas fa-star"></i></div>' : ''}
            
            <div class="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onclick="window.profilePicManager.deleteProfilePicture(${index})" 
                        class="text-white hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="mt-1 text-xs text-slate-600 text-center">${pic.context.value}</div>
        </div>
    `).join('');
}

/**
 * Update current profile pictures data
 */
export function updateProfilePictures(pictures) {
    currentProfilePictures = pictures || [];
    refreshProfilePictureGallery();
}

// Make functions globally available
window.profilePicManager = {
    setPrimaryPicture,
    deleteProfilePicture
};